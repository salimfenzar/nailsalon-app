import { clamp, distance, type Vec2 } from "./geometry";
import {
  NAIL_SHAPES,
  NAIL_WIDTH_RATIO,
  knuckleUnit,
  type NailShapeId,
} from "./nail-shapes";

export type HandMeasurements = {
  /** Middle finger length over knuckle span. Scale free, so distance to the
   *  camera does not change it. */
  slenderness: number;
  /** Distal phalanx length over nail width: how elongated the nail plate is. */
  bedRatio: number;
  /** Finger length to finger width, the number shown to the client. */
  lengthWidthRatio: number;
  /** Where the hand sits on the compact-to-elongated axis, 0 to 1. */
  drama: number;
};

export type ShapeVerdict = {
  shape: NailShapeId;
  match: number;
  alternates: NailShapeId[];
  measurements: HandMeasurements;
  headline: string;
  advice: string;
};

/** Bands over the drama axis, ordered by how much length each shape carries. */
const SHAPE_BANDS: NailShapeId[] = [
  "round",
  "oval",
  "squoval",
  "almond",
  "coffin",
  "stiletto",
];

// Both ranges are centred on an average adult hand, so a typical scan lands
// mid-scale and resolves to the squoval band rather than an extreme.
const SLENDERNESS_RANGE = [1.28, 1.7] as const;
const BED_RANGE = [1.05, 1.6] as const;

export function measureHand(points: Vec2[]): HandMeasurements {
  const unit = knuckleUnit(points);
  const span = distance(points[5], points[17]);

  const middleLength =
    distance(points[9], points[10]) +
    distance(points[10], points[11]) +
    distance(points[11], points[12]);

  const distalPhalanx = distance(points[11], points[12]);
  const nailWidth = unit * NAIL_WIDTH_RATIO * 1.05;

  const slenderness = span > 0 ? middleLength / span : 1.5;
  const bedRatio = nailWidth > 0 ? distalPhalanx / nailWidth : 1.1;

  const slendernessScore = normalize(slenderness, SLENDERNESS_RANGE);
  const bedScore = normalize(bedRatio, BED_RANGE);
  const drama = clamp(slendernessScore * 0.6 + bedScore * 0.4, 0, 1);

  return {
    slenderness,
    bedRatio,
    lengthWidthRatio: unit > 0 ? middleLength / unit : 4.5,
    drama,
  };
}

export function analyseHand(points: Vec2[]): ShapeVerdict {
  const measurements = measureHand(points);
  const bandCount = SHAPE_BANDS.length;
  const position = measurements.drama * bandCount;
  const index = clamp(Math.floor(position), 0, bandCount - 1);
  const shape = SHAPE_BANDS[index];

  // A hand that lands dead centre in its band is the textbook case for that
  // shape; one sitting near a boundary is nearly as well served by its
  // neighbour, so the score drops and the neighbour is offered as an alternate.
  const withinBand = position - index;
  const centredness = 1 - Math.abs(withinBand - 0.5) * 2;
  const match = Math.round(92 + centredness * 7);

  const neighbour = withinBand < 0.5 ? index - 1 : index + 1;
  const alternates = [neighbour, withinBand < 0.5 ? index + 1 : index - 1]
    .filter((i) => i >= 0 && i < bandCount)
    .map((i) => SHAPE_BANDS[i]);

  return {
    shape,
    match,
    alternates,
    measurements,
    headline: HEADLINES[shape],
    advice: buildAdvice(shape, measurements),
  };
}

const HEADLINES: Record<NailShapeId, string> = {
  round: "Neat, natural and low maintenance",
  oval: "Softly elongating, endlessly wearable",
  squoval: "Clean architecture with a forgiving edge",
  almond: "A tapered silhouette that lengthens the hand",
  coffin: "Sculpted walls with an editorial flat tip",
  stiletto: "The most dramatic line your hand can carry",
};

/** One-word summary of the nail plate, shared by the advice and the metrics. */
export function describeNailBed(bedRatio: number): "Compact" | "Balanced" | "Elongated" {
  if (bedRatio < 1.2) return "Compact";
  if (bedRatio > 1.42) return "Elongated";
  return "Balanced";
}

export function describeFingers(
  slenderness: number,
): "Compact" | "Balanced" | "Slender" {
  if (slenderness < 1.4) return "Compact";
  if (slenderness > 1.58) return "Slender";
  return "Balanced";
}

function buildAdvice(shape: NailShapeId, m: HandMeasurements): string {
  const ratio = m.lengthWidthRatio.toFixed(2);
  const bed = {
    Compact: "a wide, compact nail bed",
    Balanced: "a balanced nail bed",
    Elongated: "a long, narrow nail bed",
  }[describeNailBed(m.bedRatio)];
  const hand = {
    Compact: "compact fingers",
    Balanced: "well-proportioned fingers",
    Slender: "long, slender fingers",
  }[describeFingers(m.slenderness)];

  const reasoning: Record<NailShapeId, string> = {
    round: `With ${hand} and ${bed}, a short rounded edge keeps the hand looking tidy and lets the natural nail stay strong.`,
    oval: `${capitalise(hand)} paired with ${bed} take beautifully to an oval: the curve adds visual length without any extension.`,
    squoval: `${capitalise(hand)} and ${bed} give you the straight side walls a squoval needs, and the softened corners keep it from reading harsh.`,
    almond: `${capitalise(hand)} and ${bed} are exactly where a taper pays off — the almond point draws the eye down the finger and lengthens the whole hand.`,
    coffin: `${capitalise(hand)} and ${bed} give the coffin room to breathe; the tapered walls stay in proportion instead of overwhelming the finger.`,
    stiletto: `${capitalise(hand)} and ${bed} can carry the steepest taper there is. Keep the apex reinforced and the line will stay elegant rather than sharp.`,
  };

  return `Your finger length-to-width ratio measures ${ratio} : 1. ${reasoning[shape]}`;
}

/** Length in millimetres past the fingertip that the stylist would file to. */
export function suggestedLength(shape: NailShapeId): string {
  const factor = NAIL_SHAPES[shape].lengthFactor;
  if (factor < 0.95) return "Short";
  if (factor < 1.1) return "Short to medium";
  if (factor < 1.3) return "Medium";
  return "Medium to long";
}

function normalize(value: number, [min, max]: readonly [number, number]): number {
  return clamp((value - min) / (max - min), 0, 1);
}

function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
