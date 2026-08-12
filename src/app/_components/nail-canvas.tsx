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

    canvas.width = result.width;
    canvas.height = result.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    if (bare) return;

    const points = toPixels(result.landmarks, canvas.width, canvas.height);
    const frames = buildNailFrames(points, NAIL_SHAPES[shape], alignment);
    paintNails(ctx, frames, NAIL_SHAPES[shape], polish);
  }, [alignment, bare, canvasRef, image, polish, result, shape]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full object-cover"
      style={{ aspectRatio: `${result.width} / ${result.height}` }}
    />
  );
}
