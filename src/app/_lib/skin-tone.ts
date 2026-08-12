import { clamp, type Vec2 } from "./geometry";
import type { Undertone } from "./palette";

export type SkinTone = {
  undertone: Undertone;
  depth: "Fair" | "Light" | "Medium" | "Tan" | "Deep";
  /** Average sampled colour, for the badge swatch. */
  hex: string;
  advice: string;
  confidence: number;
};

const UNDERTONE_ADVICE: Record<Undertone, string> = {
  warm: "Golden and caramel bases sing against your skin. Reach for champagne chrome, café crème and terracotta before anything blue-based.",
  cool: "Your skin has a pink cast, so rose, mauve and silver-based shades read cleanest. Icy chromes and bordeaux will look intentional rather than harsh.",
  neutral:
    "You sit between warm and cool, which is the rare skin that carries almost anything. Milky nudes and glazed pearls will always be your safest luxury.",
};

/**
 * Samples the back of the hand and reads its undertone. The sample area is the
 * wrist-to-knuckle triangle, which avoids the fingers where the skin catches
 * far more specular light.
 */
export function readSkinTone(
  canvas: HTMLCanvasElement,
  points: Vec2[],
): SkinTone | null {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  const triangle = [points[0], points[5], points[17]];
  if (triangle.some((p) => !p)) return null;

  const samples: Array<[number, number, number]> = [];

  for (let i = 1; i <= 4; i++) {
    for (let j = 1; j <= 4 - i + 1; j++) {
      const a = i / 6;
      const b = j / 6;
      const c = 1 - a - b;
      if (c <= 0) continue;

      const x = Math.round(
        triangle[0].x * a + triangle[1].x * b + triangle[2].x * c,
      );
      const y = Math.round(
        triangle[0].y * a + triangle[1].y * b + triangle[2].y * c,
      );
      const patch = averagePatch(ctx, canvas, x, y, 7);
      if (patch) samples.push(patch);
    }
  }

  if (samples.length < 3) return null;

  // Blown-out highlights and deep shadows both distort the hue, so the middle
  // of the brightness range is the only part worth averaging.
  const byBrightness = [...samples].sort(
    (p, q) => brightness(p) - brightness(q),
  );
  const trimmed = byBrightness.slice(
    Math.floor(byBrightness.length * 0.2),
    Math.ceil(byBrightness.length * 0.8),
  );
  const pool = trimmed.length >= 3 ? trimmed : byBrightness;

  const avg = pool.reduce(
    (acc, [r, g, b]) => [acc[0] + r, acc[1] + g, acc[2] + b],
    [0, 0, 0],
  );
  const r = avg[0] / pool.length;
  const g = avg[1] / pool.length;
  const b = avg[2] / pool.length;

  const yellowness = g - b;
  const redness = r - g;
  const spread = Math.abs(yellowness - redness);

  let undertone: Undertone = "neutral";
  if (yellowness > redness * 1.15) undertone = "warm";
  else if (redness > yellowness * 1.3) undertone = "cool";

  const value = brightness([r, g, b]) / 255;

  return {
    undertone,
    depth:
      value > 0.78
        ? "Fair"
        : value > 0.66
          ? "Light"
          : value > 0.52
            ? "Medium"
            : value > 0.36
              ? "Tan"
              : "Deep",
    hex: toHex(r, g, b),
    advice: UNDERTONE_ADVICE[undertone],
    confidence: clamp(0.55 + spread / 40, 0.55, 0.95),
  };
}

function averagePatch(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  size: number,
): [number, number, number] | null {
  const half = size >> 1;
  const sx = clamp(x - half, 0, Math.max(0, canvas.width - size));
  const sy = clamp(y - half, 0, Math.max(0, canvas.height - size));
  if (canvas.width < size || canvas.height < size) return null;

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(sx, sy, size, size).data;
  } catch {
    return null;
  }

  let r = 0;
  let g = 0;
  let b = 0;
  const pixels = size * size;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  return [r / pixels, g / pixels, b / pixels];
}

function brightness([r, g, b]: [number, number, number]): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function toHex(r: number, g: number, b: number): string {
  const part = (v: number) =>
    Math.round(clamp(v, 0, 255))
      .toString(16)
      .padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`;
}
