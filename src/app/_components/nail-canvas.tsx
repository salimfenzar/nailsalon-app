"use client";

import { useEffect, useState } from "react";
import { toPixels } from "../_lib/geometry";
import {
  NAIL_SHAPES,
  buildNailFrames,
  type Alignment,
  type NailShapeId,
} from "../_lib/nail-shapes";
import type { Polish } from "../_lib/palette";
import { paintNails } from "../_lib/render-nails";
import type { ScanResult } from "../_lib/scan";

type NailCanvasProps = {
  result: ScanResult;
  shape: NailShapeId;
  polish: Polish;
  alignment: Alignment;
  /** Hides the overlay so the client can compare against the bare hand. */
  bare?: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
};

export function NailCanvas({
  result,
  shape,
  polish,
  alignment,
  bare = false,
  canvasRef,
}: NailCanvasProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const element = new Image();
    element.onload = () => {
      if (!cancelled) setImage(element);
    };
    element.src = result.photo;
    return () => {
      cancelled = true;
    };
  }, [result.photo]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    // The bitmap is sized to the captured frame, and the photo is drawn at its
    // natural size into that same space. Landmarks are normalized against the
    // very same frame, so nails and photo share one coordinate system and no
    // crop or letterbox correction is needed.
    const width = image.naturalWidth || result.width;
    const height = image.naturalHeight || result.height;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);
    if (bare) return;

    const points = toPixels(result.landmarks, width, height);
    const frames = buildNailFrames(points, NAIL_SHAPES[shape], alignment);
    paintNails(ctx, frames, NAIL_SHAPES[shape], polish);
  }, [alignment, bare, canvasRef, image, polish, result, shape]);

  return (
    // `h-auto` with the intrinsic aspect ratio keeps the bitmap mapped to the
    // box by a single uniform scale: no object-fit cropping, so a landmark at
    // (x, y) lands on the same pixel the client sees.
    <canvas
      ref={canvasRef}
      width={result.width}
      height={result.height}
      className="block h-auto w-full"
      style={{ aspectRatio: `${result.width} / ${result.height}` }}
    />
  );
}
