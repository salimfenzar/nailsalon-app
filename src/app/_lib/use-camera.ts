"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CameraStatus = "idle" | "requesting" | "streaming" | "denied" | "error";

export type CameraState = {
  status: CameraStatus;
  error: string | null;
  /** True while the preview is horizontally flipped, i.e. on a selfie camera. */
  mirrored: boolean;
  facingMode: "user" | "environment";
  flip: () => void;
  retry: () => void;
};

/**
 * Attaches a camera stream to the given video element. iOS Safari only honours
 * `play()` inside the gesture that opened the screen, so this must be mounted
 * as a result of a tap rather than on load.
 */
export function useCamera(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  active: boolean,
): CameraState {
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );
  const [attempt, setAttempt] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    const element = videoRef.current;

    const stop = () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };

    const start = async () => {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setStatus("error");
        setError(
          "This browser cannot open a camera. Upload a photo of your hand instead.",
        );
        return;
      }

      setStatus("requesting");
      setError(null);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 1280 },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        stop();
        streamRef.current = stream;

        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.muted = true;
          video.playsInline = true;
          await video.play().catch(() => undefined);
        }

        if (!cancelled) setStatus("streaming");
      } catch (cause: unknown) {
        if (cancelled) return;
        const name = cause instanceof DOMException ? cause.name : "";
        if (name === "NotAllowedError" || name === "SecurityError") {
          setStatus("denied");
          setError(
            "Camera access was declined. Allow it in your browser settings, or upload a photo instead.",
          );
        } else if (name === "NotFoundError" || name === "OverconstrainedError") {
          setStatus("error");
          setError("No usable camera was found on this device.");
        } else {
          setStatus("error");
          setError(
            cause instanceof Error ? cause.message : "The camera could not be started.",
          );
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
      stop();
      if (element) element.srcObject = null;
    };
  }, [active, facingMode, attempt, videoRef]);

  const flip = useCallback(() => {
    setFacingMode((current) => (current === "user" ? "environment" : "user"));
  }, []);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  return {
    status,
    error,
    mirrored: facingMode === "user",
    facingMode,
    flip,
    retry,
  };
}
