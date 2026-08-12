import { type Vec2 } from "./geometry";
import {
  edgeExtent,
  localToCanvas,
  nailApex,
  nailPath,
  type NailFrame,
  type NailShape,
} from "./nail-shapes";
import {
  darken,
  lighten,
  luminance,
  withAlpha,
  type Finish,
  type Polish,
} from "./palette";

/** Light is treated as coming from the upper left, as in a salon photo. */
const LIGHT: Vec2 = { x: -0.55, y: -0.83 };

export function paintNails(
  ctx: CanvasRenderingContext2D,
  frames: NailFrame[],
  shape: NailShape,
  polish: Polish,
): void {
  frames.forEach((frame, index) => {
    paintNail(ctx, frame, shape, polish, index);
  });
}

function paintNail(
  ctx: CanvasRenderingContext2D,
  frame: NailFrame,
  shape: NailShape,
  polish: Polish,
  seed: number,
): void {
  const path = nailPath(frame, shape);
  const opacity = polish.finish.kind === "sheer" ? polish.finish.opacity : 1;

  // The nail sits on top of the finger, so it casts a small contact shadow
  // before anything else is drawn.
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.shadowColor = "rgba(38, 24, 16, 0.5)";
  ctx.shadowBlur = frame.halfWidth * 0.7;
  ctx.shadowOffsetX = -LIGHT.x * frame.halfWidth * 0.34;
  ctx.shadowOffsetY = -LIGHT.y * frame.halfWidth * 0.34;
  ctx.fillStyle = darken(polish.base, 0.3);
  ctx.fill(path);
  ctx.restore();

  ctx.save();
  ctx.clip(path);

  ctx.globalAlpha = opacity;
  ctx.fillStyle = baseGradient(ctx, frame, polish.base);
  fillFrame(ctx, frame);
  ctx.globalAlpha = 1;

  paintFinish(ctx, frame, shape, polish.finish, polish.base, seed);
  paintCuticleShade(ctx, frame, polish.base);
  paintSpecular(ctx, frame, polish.base);

  ctx.restore();

  paintEdgeLight(ctx, frame, shape, polish.base);
}

/** Fills a generous rectangle in nail space; the caller's clip does the shaping. */
function fillFrame(ctx: CanvasRenderingContext2D, frame: NailFrame): void {
  ctx.beginPath();
  const corners: Vec2[] = [
    localToCanvas(frame, -0.4, -2),
    localToCanvas(frame, 2, -2),
    localToCanvas(frame, 2, 2),
    localToCanvas(frame, -0.4, 2),
  ];
  ctx.moveTo(corners[0].x, corners[0].y);
  for (const c of corners.slice(1)) ctx.lineTo(c.x, c.y);
  ctx.closePath();
  ctx.fill();
}

function crossGradient(
  ctx: CanvasRenderingContext2D,
  frame: NailFrame,
): CanvasGradient {
  const from = localToCanvas(frame, 0.5, -1);
  const to = localToCanvas(frame, 0.5, 1);
  return ctx.createLinearGradient(from.x, from.y, to.x, to.y);
}

function axisGradient(
  ctx: CanvasRenderingContext2D,
  frame: NailFrame,
  u0 = 0,
  u1 = 1,
): CanvasGradient {
  const from = localToCanvas(frame, u0, 0);
  const to = localToCanvas(frame, u1, 0);
  return ctx.createLinearGradient(from.x, from.y, to.x, to.y);
}

function baseGradient(
  ctx: CanvasRenderingContext2D,
  frame: NailFrame,
  base: string,
): CanvasGradient {
  const gradient = crossGradient(ctx, frame);
  gradient.addColorStop(0, lighten(base, 0.17));
  gradient.addColorStop(0.28, lighten(base, 0.05));
  gradient.addColorStop(0.62, base);
  gradient.addColorStop(1, darken(base, 0.2));
  return gradient;
}

function paintFinish(
  ctx: CanvasRenderingContext2D,
  frame: NailFrame,
  shape: NailShape,
  finish: Finish,
  base: string,
  seed: number,
): void {
  switch (finish.kind) {
    case "creme":
    case "sheer":
      return;

    case "chrome": {
      // Mirror finishes read as chrome because of the hard banding across the
      // plate, not because of overall brightness.
      const gradient = crossGradient(ctx, frame);
      gradient.addColorStop(0, withAlpha(finish.tint, 0.95));
      gradient.addColorStop(0.16, darken(base, 0.42));
      gradient.addColorStop(0.36, lighten(finish.tint, 0.2));
      gradient.addColorStop(0.52, base);
      gradient.addColorStop(0.72, darken(base, 0.34));
      gradient.addColorStop(0.88, withAlpha(finish.tint, 0.8));
      gradient.addColorStop(1, darken(base, 0.2));
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = gradient;
      fillFrame(ctx, frame);

      const horizon = axisGradient(ctx, frame, 0.1, 1);
      horizon.addColorStop(0, "rgba(255,255,255,0)");
      horizon.addColorStop(0.45, withAlpha(finish.tint, 0.45));
      horizon.addColorStop(0.62, "rgba(255,255,255,0)");
      horizon.addColorStop(1, "rgba(0,0,0,0.22)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = horizon;
      fillFrame(ctx, frame);
      return;
    }

    case "glazed": {
      const sheen = axisGradient(ctx, frame, 0, 1.1);
      sheen.addColorStop(0, withAlpha(finish.pearl, 0.62));
      sheen.addColorStop(0.4, withAlpha(finish.pearl, 0.18));
      sheen.addColorStop(0.78, "rgba(255,255,255,0.05)");
      sheen.addColorStop(1, withAlpha(finish.pearl, 0.4));
      ctx.fillStyle = sheen;
      fillFrame(ctx, frame);

      const iridescence = crossGradient(ctx, frame);
      iridescence.addColorStop(0, "rgba(255, 233, 245, 0.34)");
      iridescence.addColorStop(0.45, "rgba(255,255,255,0)");
      iridescence.addColorStop(1, "rgba(226, 241, 255, 0.3)");
      ctx.fillStyle = iridescence;
      fillFrame(ctx, frame);
      return;
    }

    case "french": {
      paintSmileLine(ctx, frame, shape, finish.tip, finish.depth);
      return;
    }

    case "ombre": {
      const gradient = axisGradient(ctx, frame, 0, 1.05);
      gradient.addColorStop(0, "rgba(255,255,255,0)");
      gradient.addColorStop(0.35, withAlpha(finish.to, 0.35));
      gradient.addColorStop(1, withAlpha(finish.to, 0.96));
      ctx.fillStyle = gradient;
      fillFrame(ctx, frame);
      return;
    }

    case "aura": {
      const centre = localToCanvas(frame, 0.72, 0);
      const radius = Math.max(frame.halfWidth, frame.length * 0.55);
      const glow = ctx.createRadialGradient(
        centre.x,
        centre.y,
        radius * 0.05,
        centre.x,
        centre.y,
        radius,
      );
      glow.addColorStop(0, withAlpha(finish.glow, 0.92));
      glow.addColorStop(0.45, withAlpha(finish.glow, 0.4));
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      fillFrame(ctx, frame);
      return;
    }

    case "glitter": {
      const random = seededRandom(seed * 977 + 13);
      const count = Math.round(150 * finish.density);
      for (let i = 0; i < count; i++) {
        const u = 0.02 + random() * 1.02;
        const v = -1 + random() * 2;
        const point = localToCanvas(frame, u, v);
        // Flakes are sized off the plate so they stay visible on a pinky and
        // do not turn into confetti on a thumb.
        const size = Math.max(0.6, frame.halfWidth * (0.05 + random() * 0.11));
        ctx.globalAlpha = 0.45 + random() * 0.55;
        ctx.fillStyle = random() > 0.35 ? finish.flake : "#ffffff";
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      return;
    }

    case "marble": {
      const random = seededRandom(seed * 613 + 29);
      ctx.lineCap = "round";
      for (let vein = 0; vein < 3; vein++) {
        const start = -0.8 + random() * 1.6;
        ctx.beginPath();
        for (let i = 0; i <= 14; i++) {
          const u = (i / 14) * 1.05;
          const v = start + Math.sin(u * 5 + vein * 2.1) * 0.42 + (random() - 0.5) * 0.1;
          const point = localToCanvas(frame, u, v);
          if (i === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        }
        ctx.globalAlpha = 0.24 + random() * 0.26;
        ctx.strokeStyle = finish.vein;
        ctx.lineWidth = Math.max(1, frame.halfWidth * (0.09 + random() * 0.14));
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      const wash = crossGradient(ctx, frame);
      wash.addColorStop(0, "rgba(255,255,255,0.25)");
      wash.addColorStop(0.5, "rgba(255,255,255,0)");
      wash.addColorStop(1, withAlpha(finish.vein, 0.14));
      ctx.fillStyle = wash;
      fillFrame(ctx, frame);
      return;
    }

    case "cateye": {
      const gradient = axisGradient(ctx, frame, -0.1, 1.1);
      gradient.addColorStop(0, "rgba(0,0,0,0.35)");
      gradient.addColorStop(0.34, withAlpha(finish.band, 0.1));
      gradient.addColorStop(0.5, withAlpha(finish.band, 0.85));
      gradient.addColorStop(0.66, withAlpha(finish.band, 0.1));
      gradient.addColorStop(1, "rgba(0,0,0,0.4)");
      ctx.fillStyle = gradient;
      fillFrame(ctx, frame);
      return;
    }
  }
}

/**
 * The French smile line bows toward the free edge in the centre, so the tip
 * reads thinner in the middle than at the side walls.
 */
function paintSmileLine(
  ctx: CanvasRenderingContext2D,
  frame: NailFrame,
  shape: NailShape,
  tip: string,
  depth: number,
): void {
  const curve = depth * 0.55;
  ctx.beginPath();
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const v = -1 + (2 * i) / steps;
    const u = 1 - depth + curve * (1 - v * v);
    const point = localToCanvas(frame, u, v);
    if (i === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  }
  const freeEdge = 1 + edgeExtent(shape, frame.halfWidth / frame.length);
  const rightEnd = localToCanvas(frame, freeEdge + 0.4, 1.6);
  const leftEnd = localToCanvas(frame, freeEdge + 0.4, -1.6);
  ctx.lineTo(rightEnd.x, rightEnd.y);
  ctx.lineTo(leftEnd.x, leftEnd.y);
  ctx.closePath();

  const gradient = axisGradient(ctx, frame, 1 - depth, freeEdge);
  gradient.addColorStop(0, lighten(tip, luminance(tip) > 0.6 ? 0.1 : 0.18));
  gradient.addColorStop(1, luminance(tip) > 0.6 ? darken(tip, 0.08) : darken(tip, 0.2));
  ctx.fillStyle = gradient;
  ctx.fill();
}

/** A little occlusion where the plate meets the cuticle seats the nail. */
function paintCuticleShade(
  ctx: CanvasRenderingContext2D,
  frame: NailFrame,
  base: string,
): void {
  const gradient = axisGradient(ctx, frame, -0.05, 0.3);
  gradient.addColorStop(0, withAlpha(darkHex(base), 0.42));
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  fillFrame(ctx, frame);
}

function paintSpecular(
  ctx: CanvasRenderingContext2D,
  frame: NailFrame,
  base: string,
): void {
  // Pale polishes need much less of a highlight than dark ones before the
  // plate stops reading as its own colour and starts reading as white.
  const strength = luminance(base) > 0.55 ? 0.3 : 0.55;
  drawSoftBlob(ctx, frame, 0.34, -0.38, 0.34, 0.28, strength);
  drawSoftBlob(ctx, frame, 0.68, 0.42, 0.2, 0.16, strength * 0.45);
}

function drawSoftBlob(
  ctx: CanvasRenderingContext2D,
  frame: NailFrame,
  u: number,
  v: number,
  alongRadius: number,
  acrossRadius: number,
  alpha: number,
): void {
  const centre = localToCanvas(frame, u, v);
  const angle = Math.atan2(frame.axis.y, frame.axis.x);

  ctx.save();
  ctx.translate(centre.x, centre.y);
  ctx.rotate(angle);
  ctx.scale(frame.length * alongRadius, frame.halfWidth * acrossRadius);

  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
  gradient.addColorStop(0.55, `rgba(255,255,255,${alpha * 0.32})`);
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** The wet-look rim and the bright catch on the free edge. */
function paintEdgeLight(
  ctx: CanvasRenderingContext2D,
  frame: NailFrame,
  shape: NailShape,
  base: string,
): void {
  const path = nailPath(frame, shape);

  ctx.save();
  ctx.clip(path);
  ctx.lineWidth = Math.max(1, frame.halfWidth * 0.11);
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.stroke(path);
  ctx.restore();

  ctx.save();
  ctx.lineWidth = Math.max(0.6, frame.halfWidth * 0.05);
  ctx.strokeStyle = withAlpha(darkHex(base), 0.35);
  ctx.stroke(path);
  ctx.restore();

  const apex = nailApex(frame, shape);
  const radius = frame.halfWidth * 0.45;
  ctx.save();
  ctx.clip(path);
  const glint = ctx.createRadialGradient(
    apex.x,
    apex.y,
    0,
    apex.x,
    apex.y,
    radius,
  );
  glint.addColorStop(0, "rgba(255,255,255,0.34)");
  glint.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glint;
  ctx.beginPath();
  ctx.arc(apex.x, apex.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

const HAND_CONNECTIONS: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

/**
 * The live scan overlay: a faint tracking constellation plus a glowing outline
 * of the shape currently being recommended, sitting on each fingertip.
 */
export function drawArOverlay(
  ctx: CanvasRenderingContext2D,
  points: Vec2[],
  frames: NailFrame[],
  shape: NailShape,
  pulse: number,
): void {
  ctx.save();
  ctx.lineWidth = Math.max(1, ctx.canvas.width * 0.0016);
  ctx.strokeStyle = "rgba(255, 246, 235, 0.22)";
  for (const [a, b] of HAND_CONNECTIONS) {
    const from = points[a];
    const to = points[b];
    if (!from || !to) continue;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255, 246, 235, 0.5)";
  const dot = Math.max(1.5, ctx.canvas.width * 0.0035);
  for (const point of points) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, dot, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const glow = 0.55 + 0.45 * pulse;

  for (const frame of frames) {
    const path = nailPath(frame, shape);

    ctx.save();
    ctx.shadowColor = `rgba(215, 184, 138, ${glow})`;
    ctx.shadowBlur = frame.halfWidth * 1.6;
    ctx.fillStyle = `rgba(255, 244, 226, ${0.1 + 0.06 * pulse})`;
    ctx.fill(path);
    ctx.lineWidth = Math.max(1.2, frame.halfWidth * 0.11);
    ctx.strokeStyle = `rgba(255, 249, 238, ${0.7 + 0.3 * pulse})`;
    ctx.stroke(path);
    ctx.restore();

    ctx.save();
    ctx.lineWidth = Math.max(0.8, frame.halfWidth * 0.05);
    ctx.strokeStyle = "rgba(199, 169, 123, 0.9)";
    ctx.stroke(path);
    ctx.restore();
  }
}

function darkHex(base: string): string {
  return luminance(base) > 0.5 ? "#4a3b32" : "#000000";
}

function seededRandom(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}
