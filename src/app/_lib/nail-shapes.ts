import {
  FINGERS,
  add,
  clamp,
  distance,
  normalize,
  perpendicular,
  scale,
  sub,
  type FingerId,
  type Vec2,
} from "./geometry";

export type NailShapeId =
  | "round"
  | "oval"
  | "almond"
  | "squoval"
  | "coffin"
  | "stiletto";

export type NailShape = {
  id: NailShapeId;
  name: string;
  tagline: string;
  /** Free-edge length relative to the distal phalanx. */
  lengthFactor: number;
  /** Half-width at the free edge, as a fraction of the nail bed half-width. */
  edgeWidth: number;
  /** Where along the nail the side walls start converging. */
  taperStart: number;
  /** Curvature of that convergence: 1 is linear, >1 stays wide for longer. */
  taperPower: number;
  /** How far the free edge bulges past the tip line, in half-widths. */
  edgeBulge: number;
  /** Free-edge profile: 1 is a circular arc, higher flattens, lower sharpens. */
  edgeFlatness: number;
  /** How deeply the cuticle line curves back into the finger. */
  cuticleBow: number;
};

export const NAIL_SHAPES: Record<NailShapeId, NailShape> = {
  round: {
    id: "round",
    name: "Round",
    tagline: "Soft, short and effortless",
    lengthFactor: 0.8,
    edgeWidth: 0.96,
    taperStart: 0.55,
    taperPower: 2,
    edgeBulge: 0.96,
    edgeFlatness: 1,
    cuticleBow: 0.06,
  },
  oval: {
    id: "oval",
    name: "Oval",
    tagline: "The quietly flattering classic",
    lengthFactor: 1,
    edgeWidth: 0.82,
    taperStart: 0.2,
    taperPower: 1.7,
    edgeBulge: 1.15,
    edgeFlatness: 0.85,
    cuticleBow: 0.06,
  },
  almond: {
    id: "almond",
    name: "Almond",
    tagline: "Lengthens the hand, softly",
    lengthFactor: 1.16,
    edgeWidth: 0.56,
    taperStart: 0.16,
    taperPower: 1.55,
    edgeBulge: 0.95,
    edgeFlatness: 0.8,
    cuticleBow: 0.055,
  },
  squoval: {
    id: "squoval",
    name: "Squoval",
    tagline: "Structured edge, rounded corners",
    lengthFactor: 1.06,
    edgeWidth: 0.95,
    taperStart: 0.5,
    taperPower: 2.2,
    edgeBulge: 0.24,
    edgeFlatness: 3.5,
    cuticleBow: 0.05,
  },
  coffin: {
    id: "coffin",
    name: "Coffin",
    tagline: "Tapered walls, flat editorial tip",
    lengthFactor: 1.34,
    edgeWidth: 0.6,
    taperStart: 0.16,
    taperPower: 1.1,
    edgeBulge: 0.14,
    edgeFlatness: 4,
    cuticleBow: 0.05,
  },
  stiletto: {
    id: "stiletto",
    name: "Stiletto",
    tagline: "High drama, needle-fine point",
    lengthFactor: 1.46,
    edgeWidth: 0.16,
    taperStart: 0.06,
    taperPower: 1.2,
    edgeBulge: 0.5,
    edgeFlatness: 0.5,
    cuticleBow: 0.05,
  },
};

export const NAIL_SHAPE_ORDER: NailShapeId[] = [
  "round",
  "oval",
  "almond",
  "squoval",
  "coffin",
  "stiletto",
];

/**
 * A nail placed on the hand: an origin at the cuticle plus the two axes the
 * outline is drawn along. Everything downstream works in these terms so the
 * overlay, the fine-tune sliders and the finishes all stay in sync.
 */
export type NailFrame = {
  finger: FingerId;
  origin: Vec2;
  axis: Vec2;
  perp: Vec2;
  length: number;
  halfWidth: number;
};

export type Alignment = {
  /** Shifts every nail across the hand, in half-widths. */
  offsetX: number;
  /** Shifts every nail along the finger, in nail lengths. */
  offsetY: number;
  /** Overall width multiplier. */
  scale: number;
  /** Free-edge length multiplier. */
  lengthScale: number;
};

export const DEFAULT_ALIGNMENT: Alignment = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  lengthScale: 1,
};

/**
 * Nails are measured against the knuckle span rather than the finger segments:
 * the MCP landmarks are anchored to the palm, so they keep their spacing when
 * the fingers spread, which the phalanx lengths do not.
 */
export function knuckleUnit(points: Vec2[]): number {
  return distance(points[5], points[17]) / 3;
}

/**
 * Nail plate width as a fraction of the knuckle spacing. On an adult hand the
 * knuckles sit about 20 mm apart and the middle nail plate is about 13 mm wide.
 */
export const NAIL_WIDTH_RATIO = 0.66;

export function buildNailFrames(
  points: Vec2[],
  shape: NailShape,
  alignment: Alignment = DEFAULT_ALIGNMENT,
): NailFrame[] {
  const unit = knuckleUnit(points);

  return FINGERS.map((finger) => {
    const dip = points[finger.dip];
    const tip = points[finger.tip];
    const axis = normalize(sub(tip, dip));
    const perp = perpendicular(axis);
    const distal = distance(tip, dip);

    const halfWidth =
      (unit * NAIL_WIDTH_RATIO * finger.widthFactor * alignment.scale) / 2;

    // Foreshortened fingers collapse the distal segment; clamping against the
    // nail width keeps the plate plausible instead of squashing it to nothing.
    const bedLength = clamp(
      distal * 0.78 * shape.lengthFactor * alignment.lengthScale,
      halfWidth * 1.5,
      halfWidth * 6,
    );

    const cuticle = add(
      add(dip, scale(axis, distal * 0.22)),
      add(
        scale(perp, alignment.offsetX * halfWidth),
        scale(axis, alignment.offsetY * bedLength),
      ),
    );

    return {
      finger: finger.id,
      origin: cuticle,
      axis,
      perp,
      length: bedLength,
      halfWidth,
    };
  });
}

/** Maps a point in nail-local space (u along, v across) to canvas pixels. */
export function localToCanvas(frame: NailFrame, u: number, v: number): Vec2 {
  return {
    x: frame.origin.x + frame.axis.x * u * frame.length + frame.perp.x * v * frame.halfWidth,
    y: frame.origin.y + frame.axis.y * u * frame.length + frame.perp.y * v * frame.halfWidth,
  };
}

function halfWidthAt(shape: NailShape, u: number): number {
  if (u <= shape.taperStart) return 1;
  const t = (u - shape.taperStart) / (1 - shape.taperStart);
  return 1 - (1 - shape.edgeWidth) * Math.pow(clamp(t, 0, 1), shape.taperPower);
}

const SIDE_SAMPLES = 26;
const EDGE_SAMPLES = 22;
const CUTICLE_SAMPLES = 12;

/**
 * How far past the tip line the free edge reaches, in nail lengths. The bulge
 * is authored in half-widths so a shape keeps its silhouette on a wide thumb
 * and a narrow pinky alike, which means converting through the aspect ratio.
 */
export function edgeExtent(shape: NailShape, aspect: number): number {
  return shape.edgeBulge * aspect;
}

/**
 * Traces the nail silhouette in local space, as [along, across] pairs. Sampling
 * the profile functions rather than hand-placing béziers keeps all six shapes
 * derived from the same handful of numbers, so a tweak stays consistent across
 * the set.
 *
 * @param aspect Half-width over length of the nail the outline is drawn on.
 */
export function nailOutline(
  shape: NailShape,
  aspect: number,
): Array<[number, number]> {
  const points: Array<[number, number]> = [];
  const edgeHalf = halfWidthAt(shape, 1);
  const bulge = edgeExtent(shape, aspect);
  const exponent = 1 / (2 * shape.edgeFlatness);

  // Left wall, cuticle to free edge.
  for (let i = 0; i <= SIDE_SAMPLES; i++) {
    const u = i / SIDE_SAMPLES;
    points.push([u, -halfWidthAt(shape, u)]);
  }

  // Free edge, swept from the left corner to the right one.
  for (let i = 1; i < EDGE_SAMPLES; i++) {
    const t = -1 + (2 * i) / EDGE_SAMPLES;
    points.push([
      1 + bulge * Math.pow(Math.max(0, 1 - t * t), exponent),
      t * edgeHalf,
    ]);
  }

  // Right wall, free edge back to the cuticle.
  for (let i = SIDE_SAMPLES; i >= 0; i--) {
    const u = i / SIDE_SAMPLES;
    points.push([u, halfWidthAt(shape, u)]);
  }

  // Cuticle line, bowed back into the finger.
  for (let i = 1; i < CUTICLE_SAMPLES; i++) {
    const t = 1 - (2 * i) / CUTICLE_SAMPLES;
    points.push([-shape.cuticleBow * (1 - t * t), t]);
  }

  return points;
}

const outlineCache = new Map<string, Array<[number, number]>>();

/** The silhouette placed on the hand, ready to fill or clip. */
export function nailPath(frame: NailFrame, shape: NailShape): Path2D {
  const aspect = frame.halfWidth / frame.length;
  // Aspect ratios are bucketed so five fingers do not each rebuild an outline
  // every frame of the live overlay.
  const key = `${shape.id}:${Math.round(aspect * 50)}`;

  let outline = outlineCache.get(key);
  if (!outline) {
    outline = nailOutline(shape, aspect);
    outlineCache.set(key, outline);
  }

  const path = new Path2D();
  outline.forEach(([u, v], index) => {
    const point = localToCanvas(frame, u, v);
    if (index === 0) path.moveTo(point.x, point.y);
    else path.lineTo(point.x, point.y);
  });
  path.closePath();
  return path;
}

/** The furthest point of the free edge, where the tip highlight sits. */
export function nailApex(frame: NailFrame, shape: NailShape): Vec2 {
  const aspect = frame.halfWidth / frame.length;
  return localToCanvas(frame, 1 + edgeExtent(shape, aspect), 0);
}
