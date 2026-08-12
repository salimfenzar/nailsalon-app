import { analyseHand, type ShapeVerdict } from "./analysis";
import { toPixels, type HandLandmarks } from "./geometry";
import { readSkinTone, type SkinTone } from "./skin-tone";

export type ScanSource = "camera" | "upload";

export type ScanResult = {
  /** The captured frame, already oriented the way the client saw it. */
  photo: string;
  width: number;
  height: number;
  /** Normalized landmarks in the coordinate space of `photo`. */
  landmarks: HandLandmarks;
  verdict: ShapeVerdict;
  skinTone: SkinTone | null;
  source: ScanSource;
  samples: number;
};

const MAX_CAPTURE_EDGE = 1440;

/**
 * Copies the current video frame into a canvas. A selfie preview is mirrored on
 * screen, so the capture is mirrored too and the landmarks are flipped with it,
 * otherwise the result screen would show a hand the client does not recognise.
 */
export function captureVideoFrame(
  video: HTMLVideoElement,
  mirrored: boolean,
): HTMLCanvasElement | null {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) return null;

  const scale = Math.min(1, MAX_CAPTURE_EDGE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  if (mirrored) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  return canvas;
}

export function mirrorLandmarks(landmarks: HandLandmarks): HandLandmarks {
  return landmarks.map((l) => ({ ...l, x: 1 - l.x }));
}

export function imageToCanvas(image: HTMLImageElement): HTMLCanvasElement | null {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  if (!width || !height) return null;

  const scale = Math.min(1, MAX_CAPTURE_EDGE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export function loadImageFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That image could not be opened."));
    };
    image.src = url;
  });
}

export function buildScanResult(
  canvas: HTMLCanvasElement,
  landmarks: HandLandmarks,
  source: ScanSource,
  samples: number,
): ScanResult {
  const points = toPixels(landmarks, canvas.width, canvas.height);

  return {
    photo: canvas.toDataURL("image/jpeg", 0.92),
    width: canvas.width,
    height: canvas.height,
    landmarks,
    verdict: analyseHand(points),
    skinTone: readSkinTone(canvas, points),
    source,
    samples,
  };
}
