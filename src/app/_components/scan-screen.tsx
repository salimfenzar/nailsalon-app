"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ImageUp, LoaderCircle, SwitchCamera, TriangleAlert } from "lucide-react";
import { analyseHand } from "../_lib/analysis";
import {
  distance,
  isFullyVisible,
  jitterOf,
  medianLandmarks,
  toPixels,
  type HandLandmarks,
} from "../_lib/geometry";
import { NAIL_SHAPES, buildNailFrames, type NailShapeId } from "../_lib/nail-shapes";
import { drawArOverlay } from "../_lib/render-nails";
import {
  buildScanResult,
  captureVideoFrame,
  mirrorLandmarks,
  type ScanResult,
} from "../_lib/scan";
import { useCamera } from "../_lib/use-camera";
import { useHandLandmarker } from "../_lib/use-hand-landmarker";
import { Eyebrow, GhostButton, Stage, cx } from "./ui";

const COUNTDOWN_MS = 5000;
/** Tracking may drop out this long before the countdown restarts. */
const GRACE_MS = 600;
const MIN_HAND_SPAN = 0.13;
const STEADY_JITTER = 0.009;

type Guidance = {
  message: string;
  detail: string;
  tracking: boolean;
  seconds: number;
  progress: number;
};

const IDLE_GUIDANCE: Guidance = {
  message: "Show your hand",
  detail: "Palm down, fingers relaxed and slightly apart",
  tracking: false,
  seconds: 5,
  progress: 0,
};

type ScanScreenProps = {
  onComplete: (result: ScanResult) => void;
  onCancel: () => void;
  onPickPhoto: (file: File) => void;
};

export function ScanScreen({ onComplete, onCancel, onPickPhoto }: ScanScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const camera = useCamera(videoRef, true);
  const { status: modelStatus, error: modelError, detectVideo, prepareVideoMode } =
    useHandLandmarker(true);

  const [guidance, setGuidance] = useState<Guidance>(IDLE_GUIDANCE);
  const [shapeId, setShapeId] = useState<NailShapeId>("almond");

  const samples = useRef<HandLandmarks[]>([]);
  const recent = useRef<HandLandmarks[]>([]);
  const countdownStart = useRef<number | null>(null);
  const lastSeen = useRef(0);
  const lastTimestamp = useRef(0);
  const frameCount = useRef(0);
  const finished = useRef(false);
  const shapeRef = useRef<NailShapeId>("almond");
  const guidanceRef = useRef<Guidance>(IDLE_GUIDANCE);

  const publish = useCallback((next: Guidance) => {
    const previous = guidanceRef.current;
    if (
      previous.message === next.message &&
      previous.tracking === next.tracking &&
      previous.seconds === next.seconds &&
      Math.abs(previous.progress - next.progress) < 0.02
    ) {
      return;
    }
    guidanceRef.current = next;
    setGuidance(next);
  }, []);

  const complete = useCallback(() => {
    const video = videoRef.current;
    if (!video || finished.current) return;

    const collected = samples.current;
    if (collected.length < 8) {
      countdownStart.current = null;
      samples.current = [];
      return;
    }

    finished.current = true;

    // The burst is reduced with a median so a single mistracked frame cannot
    // shift the measurement the recommendation is built on.
    const averaged = medianLandmarks(collected);
    const canvas = captureVideoFrame(video, camera.mirrored);
    if (!canvas) {
      finished.current = false;
      return;
    }

    const landmarks = camera.mirrored ? mirrorLandmarks(averaged) : averaged;
    onComplete(buildScanResult(canvas, landmarks, "camera", collected.length));
  }, [camera.mirrored, onComplete]);

  useEffect(() => {
    void prepareVideoMode();
  }, [prepareVideoMode]);

  useEffect(() => {
    if (modelStatus !== "ready" || camera.status !== "streaming") return;

    let raf = 0;
    finished.current = false;
    samples.current = [];
    recent.current = [];
    countdownStart.current = null;

    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2 || finished.current) return;

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // detectForVideo rejects a timestamp it has already seen.
      const timestamp = Math.max(time, lastTimestamp.current + 1);
      lastTimestamp.current = timestamp;

      const detection = detectVideo(video, timestamp);
      const landmarks = detection?.landmarks?.[0] as HandLandmarks | undefined;

      if (!landmarks || landmarks.length < 21) {
        if (time - lastSeen.current > GRACE_MS) {
          countdownStart.current = null;
          samples.current = [];
          recent.current = [];
          publish(IDLE_GUIDANCE);
        }
        return;
      }

      lastSeen.current = time;
      recent.current.push(landmarks);
      if (recent.current.length > 8) recent.current.shift();

      const points = toPixels(landmarks, canvas.width, canvas.height);
      // Measured in pixels rather than normalized units, so a portrait frame
      // does not read as "closer" than a landscape one.
      const span = distance(points[5], points[17]) / canvas.width;

      frameCount.current += 1;
      if (frameCount.current % 8 === 0) {
        const next = analyseHand(points).shape;
        if (next !== shapeRef.current) {
          shapeRef.current = next;
          setShapeId(next);
        }
      }

      const shape = NAIL_SHAPES[shapeRef.current];
      const frames = buildNailFrames(points, shape);
      const pulse = 0.5 + 0.5 * Math.sin(time / 380);
      drawArOverlay(ctx, points, frames, shape, pulse);

      const visible = isFullyVisible(landmarks);
      const steady = jitterOf(recent.current) < STEADY_JITTER;
      const close = span > MIN_HAND_SPAN;

      if (!visible || !close || !steady) {
        countdownStart.current = null;
        samples.current = [];
        publish({
          message: !close
            ? "Move a little closer"
            : !visible
              ? "Bring the whole hand into frame"
              : "Hold still",
          detail: !close
            ? "Fill the frame with your hand"
            : !visible
              ? "All five fingertips need to be visible"
              : "Almost there — steady now",
          tracking: true,
          seconds: 5,
          progress: 0,
        });
        return;
      }

      if (countdownStart.current === null) countdownStart.current = time;
      samples.current.push(landmarks);

      const elapsed = time - countdownStart.current;
      const progress = Math.min(1, elapsed / COUNTDOWN_MS);

      publish({
        message: "Measuring",
        detail: "Keep your hand exactly where it is",
        tracking: true,
        seconds: Math.max(1, Math.ceil((COUNTDOWN_MS - elapsed) / 1000)),
        progress,
      });

      if (progress >= 1) complete();
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [camera.status, complete, detectVideo, modelStatus, publish]);

  const preparing = modelStatus === "loading" || camera.status === "requesting";
  const blocked =
    camera.status === "denied" || camera.status === "error" || modelStatus === "error";

  return (
    <Stage name="scan" className="bg-noir text-porcelain">
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={cx(
            "absolute inset-0 h-full w-full object-cover",
            camera.mirrored && "-scale-x-100",
          )}
        />
        <canvas
          ref={canvasRef}
          className={cx(
            "pointer-events-none absolute inset-0 h-full w-full object-cover",
            camera.mirrored && "-scale-x-100",
          )}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(10,8,7,0.72)_100%)]" />
      </div>

      <div className="safe-top relative flex items-center justify-between px-6">
        <button
          onClick={onCancel}
          aria-label="Back"
          className="border-porcelain/25 text-porcelain/85 hover:bg-porcelain/10 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-colors"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.25} />
        </button>
        <Eyebrow tone="light">Hand Scan</Eyebrow>
        <button
          onClick={camera.flip}
          aria-label="Switch camera"
          className="border-porcelain/25 text-porcelain/85 hover:bg-porcelain/10 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-colors"
        >
          <SwitchCamera className="h-4 w-4" strokeWidth={1.25} />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-8">
        <Reticle active={guidance.tracking} />
      </div>

      <div className="safe-bottom relative flex flex-col items-center gap-5 px-8">
        {blocked ? (
          <div className="border-porcelain/20 bg-noir/70 w-full max-w-sm rounded-3xl border p-6 text-center backdrop-blur-xl">
            <TriangleAlert
              className="text-champagne mx-auto mb-3 h-5 w-5"
              strokeWidth={1.25}
            />
            <p className="text-porcelain/85 text-sm leading-relaxed font-light">
              {camera.error ?? modelError ?? "The scanner is unavailable."}
            </p>
            <div className="mt-5 flex flex-col gap-2.5">
              <GhostButton
                onClick={camera.retry}
                className="border-porcelain/25 text-porcelain/85 hover:text-porcelain hover:border-porcelain/50"
              >
                Try again
              </GhostButton>
              <GhostButton
                onClick={() => fileInput.current?.click()}
                icon={<ImageUp className="h-4 w-4" strokeWidth={1.25} />}
                className="border-porcelain/25 text-porcelain/85 hover:text-porcelain hover:border-porcelain/50"
              >
                Upload a photo
              </GhostButton>
            </div>
          </div>
        ) : (
          <>
            <CountdownRing
              progress={guidance.progress}
              seconds={guidance.seconds}
              counting={guidance.progress > 0}
              preparing={preparing}
            />
            <div className="flex flex-col items-center gap-1.5 text-center">
              <p className="font-display text-porcelain text-2xl leading-none font-light">
                {preparing ? "Preparing the scanner" : guidance.message}
              </p>
              <p className="text-porcelain/55 text-xs font-light">
                {preparing
                  ? "Loading the hand tracking model"
                  : guidance.detail}
              </p>
            </div>
            <p className="text-porcelain/40 text-[0.6rem] tracking-[0.16em] uppercase">
              Recommending {NAIL_SHAPES[shapeId].name}
            </p>
          </>
        )}

        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) onPickPhoto(file);
          }}
        />
      </div>
    </Stage>
  );
}

function Reticle({ active }: { active: boolean }) {
  return (
    <div
      className={cx(
        "relative aspect-[3/4] w-full max-w-[19rem] transition-opacity duration-500",
        active ? "opacity-30" : "opacity-70",
      )}
    >
      {[
        "left-0 top-0 border-l border-t rounded-tl-[2rem]",
        "right-0 top-0 border-r border-t rounded-tr-[2rem]",
        "left-0 bottom-0 border-l border-b rounded-bl-[2rem]",
        "right-0 bottom-0 border-r border-b rounded-br-[2rem]",
      ].map((corner) => (
        <span
          key={corner}
          className={cx("border-champagne/70 absolute h-12 w-12", corner)}
        />
      ))}
    </div>
  );
}

function CountdownRing({
  progress,
  seconds,
  counting,
  preparing,
}: {
  progress: number;
  seconds: number;
  counting: boolean;
  preparing: boolean;
}) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center">
      <svg viewBox="0 0 72 72" className="absolute inset-0 h-full w-full -rotate-90">
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="rgba(250,247,244,0.18)"
          strokeWidth="1.5"
        />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="#d9c4a7"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          className="transition-[stroke-dashoffset] duration-100 ease-linear"
        />
      </svg>
      {preparing ? (
        <LoaderCircle
          className="text-champagne h-5 w-5 animate-spin"
          strokeWidth={1.25}
        />
      ) : (
        <span
          className={cx(
            "font-display text-2xl leading-none font-light transition-colors",
            counting ? "text-porcelain" : "text-porcelain/35",
          )}
        >
          {counting ? seconds : 5}
        </span>
      )}
    </div>
  );
}
