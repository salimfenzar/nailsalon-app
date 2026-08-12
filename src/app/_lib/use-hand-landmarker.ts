"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  HandLandmarker,
  HandLandmarkerResult,
} from "@mediapipe/tasks-vision";

export type LandmarkerStatus = "idle" | "loading" | "ready" | "error";

const WASM_PATH = "/mediapipe/wasm";
const MODEL_PATH = "/mediapipe/models/hand_landmarker.task";

/** The task weighs ~8 MB, so the instance is shared across mounts. */
let instance: Promise<HandLandmarker> | null = null;
let currentMode: "IMAGE" | "VIDEO" = "VIDEO";

async function createLandmarker(): Promise<HandLandmarker> {
  const { FilesetResolver, HandLandmarker } = await import(
    "@mediapipe/tasks-vision"
  );
  const fileset = await FilesetResolver.forVisionTasks(WASM_PATH);

  const options = {
    baseOptions: { modelAssetPath: MODEL_PATH },
    runningMode: "VIDEO" as const,
    numHands: 1,
    minHandDetectionConfidence: 0.55,
    minHandPresenceConfidence: 0.55,
    minTrackingConfidence: 0.55,
  };

  try {
    return await HandLandmarker.createFromOptions(fileset, {
      ...options,
      baseOptions: { ...options.baseOptions, delegate: "GPU" },
    });
  } catch {
    // Plenty of mobile browsers refuse the GPU delegate; CPU is slower but
    // still comfortably real time for a single hand.
    return HandLandmarker.createFromOptions(fileset, {
      ...options,
      baseOptions: { ...options.baseOptions, delegate: "CPU" },
    });
  }
}

function loadLandmarker(): Promise<HandLandmarker> {
  if (!instance) {
    currentMode = "VIDEO";
    instance = createLandmarker().catch((error) => {
      instance = null;
      throw error;
    });
  }
  return instance;
}

export function useHandLandmarker(enabled: boolean) {
  const [resolved, setResolved] = useState<{
    status: LandmarkerStatus;
    error: string | null;
  }>({ status: "idle", error: null });
  const landmarker = useRef<HandLandmarker | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    loadLandmarker()
      .then((value) => {
        if (cancelled) return;
        landmarker.current = value;
        setResolved({ status: "ready", error: null });
      })
      .catch(() => {
        if (cancelled) return;
        setResolved({
          status: "error",
          error: "load_failed",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  // Derived rather than stored, so enabling the hook does not need a render
  // pass just to move the status to "loading".
  const status: LandmarkerStatus =
    enabled && resolved.status === "idle" ? "loading" : resolved.status;
  const error = resolved.error;

  const detectVideo = useCallback(
    (video: HTMLVideoElement, timestamp: number): HandLandmarkerResult | null => {
      if (!landmarker.current || currentMode !== "VIDEO") return null;
      try {
        return landmarker.current.detectForVideo(video, timestamp);
      } catch {
        return null;
      }
    },
    [],
  );

  const detectImage = useCallback(
    async (
      image: HTMLImageElement | HTMLCanvasElement,
    ): Promise<HandLandmarkerResult | null> => {
      const value = landmarker.current ?? (await loadLandmarker());
      landmarker.current = value;

      if (currentMode !== "IMAGE") {
        await value.setOptions({ runningMode: "IMAGE" });
        currentMode = "IMAGE";
      }
      try {
        return value.detect(image);
      } catch {
        return null;
      }
    },
    [],
  );

  const prepareVideoMode = useCallback(async () => {
    const value = landmarker.current ?? (await loadLandmarker());
    landmarker.current = value;
    if (currentMode !== "VIDEO") {
      await value.setOptions({ runningMode: "VIDEO" });
      currentMode = "VIDEO";
    }
  }, []);

  return { status, error, detectVideo, detectImage, prepareVideoMode };
}
