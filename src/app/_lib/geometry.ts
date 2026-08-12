export type Landmark = { x: number; y: number; z?: number };
export type HandLandmarks = Landmark[];
export type Vec2 = { x: number; y: number };

export type FingerId = "thumb" | "index" | "middle" | "ring" | "pinky";

export type FingerSpec = {
  id: FingerId;
  label: string;
  /** Landmark indices, from the knuckle out to the fingertip. */
  mcp: number;
  pip: number;
  dip: number;
  tip: number;
  /** Nail plates are not equally wide across the hand. */
  widthFactor: number;
};

export const FINGERS: readonly FingerSpec[] = [
  { id: "thumb", label: "Thumb", mcp: 1, pip: 2, dip: 3, tip: 4, widthFactor: 1.28 },
  { id: "index", label: "Index", mcp: 5, pip: 6, dip: 7, tip: 8, widthFactor: 1.0 },
  { id: "middle", label: "Middle", mcp: 9, pip: 10, dip: 11, tip: 12, widthFactor: 1.05 },
  { id: "ring", label: "Ring", mcp: 13, pip: 14, dip: 15, tip: 16, widthFactor: 0.96 },
  { id: "pinky", label: "Pinky", mcp: 17, pip: 18, dip: 19, tip: 20, widthFactor: 0.8 },
] as const;

/** The fingertip landmarks the AR overlay tracks. */
export const FINGERTIP_INDICES = FINGERS.map((f) => f.tip);

export const WRIST = 0;

export function toPixels(
  landmarks: HandLandmarks,
  width: number,
  height: number,
): Vec2[] {
  return landmarks.map((l) => ({ x: l.x * width, y: l.y * height }));
}

export function sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function scale(a: Vec2, k: number): Vec2 {
  return { x: a.x * k, y: a.y * k };
}

export function length(a: Vec2): number {
  return Math.hypot(a.x, a.y);
}

export function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function normalize(a: Vec2): Vec2 {
  const len = length(a);
  return len < 1e-6 ? { x: 0, y: -1 } : { x: a.x / len, y: a.y / len };
}

/** Rotates a vector by 90°, giving the across-the-nail direction. */
export function perpendicular(a: Vec2): Vec2 {
  return { x: -a.y, y: a.x };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpVec(a: Vec2, b: Vec2, t: number): Vec2 {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

export function dot(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y;
}

/**
 * Averages a burst of detections. The median rejects the frames where a finger
 * was momentarily mistracked, which a mean would smear across the result.
 */
export function medianLandmarks(samples: HandLandmarks[]): HandLandmarks {
  if (samples.length === 0) return [];
  const count = samples[0].length;
  const result: HandLandmarks = [];

  for (let i = 0; i < count; i++) {
    const xs: number[] = [];
    const ys: number[] = [];
    const zs: number[] = [];
    for (const sample of samples) {
      const point = sample[i];
      if (!point) continue;
      xs.push(point.x);
      ys.push(point.y);
      zs.push(point.z ?? 0);
    }
    result.push({ x: median(xs), y: median(ys), z: median(zs) });
  }

  return result;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * How much a burst of samples wobbles, in normalized units. Used as the
 * stability signal that gates the countdown.
 */
export function jitterOf(samples: HandLandmarks[]): number {
  if (samples.length < 2) return 1;
  const reference = medianLandmarks(samples);
  let total = 0;
  let count = 0;
  for (const sample of samples) {
    for (let i = 0; i < reference.length; i++) {
      const a = sample[i];
      const b = reference[i];
      if (!a || !b) continue;
      total += Math.hypot(a.x - b.x, a.y - b.y);
      count++;
    }
  }
  return count === 0 ? 1 : total / count;
}

/**
 * The landmarks the measurement actually depends on. The wrist is excluded on
 * purpose: a hand held close enough to measure well usually has its wrist off
 * the bottom of the frame, and failing the scan for that would be wrong.
 */
const MEASURED_INDICES = Array.from({ length: 20 }, (_, i) => i + 1);

/** True when every measured landmark sits inside the frame with a margin. */
export function isFullyVisible(landmarks: HandLandmarks, margin = 0.015): boolean {
  return MEASURED_INDICES.every((index) => {
    const point = landmarks[index];
    return (
      point !== undefined &&
      point.x > margin &&
      point.x < 1 - margin &&
      point.y > margin &&
      point.y < 1 - margin
    );
  });
}
