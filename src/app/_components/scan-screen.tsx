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
import {
  NAIL_SHAPES,
  createNailFrameSmoother,
  type NailFrame,
  type NailShapeId,
} from "../_lib/nail-shapes";
import { drawArOverlay } from "../_lib/render-nails";
import {
  buildScanResult,
  captureVideoFrame,
  mirrorLandmarks,
  type ScanResult,
} from "../_lib/scan";
import { useCamera } from "../_lib/use-camera";
import { useHandLandmarker } from "../_lib/use-hand-landmarker";
import { copyFor, type Copy, type Language } from "../_lib/i18n";
import { IconButton, Label, OutlineButton, Stage, cx } from "./ui";

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

function idleGuidance(t: Copy): Guidance {
  return {
    message: t.showHand,
    detail: t.showHandDetail,
    tracking: false,
    seconds: 5,
    progress: 0,
  };
}

function resolveBlockedMessage(
  t: Copy,
  cameraError: string | null,
  modelError: string | null,
): string {
  const key = cameraError ?? modelError;
  switch (key) {
    case "unsupported":
      return t.cameraUnsupported;
    case "denied":
      return t.cameraDenied;
    case "not_found":
      return t.cameraNotFound;
    case "start_failed":
      return t.cameraStartFailed;
    case "load_failed":
      return t.modelLoadFailed;
    default:
      return t.scannerUnavailable;
  }
}

type ScanScreenProps = {
  language: Language;
  onComplete: (result: ScanResult) => void;
  onCancel: () => void;
  onPickPhoto: (file: File) => void;
};

export function ScanScreen({
  language,
  onComplete,
  onCancel,
  onPickPhoto,
}: ScanScreenProps) {
  const t = copyFor(language);
  const tRef = useRef(t);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const camera = useCamera(videoRef, true);
  const { status: modelStatus, error: modelError, detectVideo, prepareVideoMode } =
    useHandLandmarker(true);

  const [guidance, setGuidance] = useState<Guidance>(() => idleGuidance(t));
  const [shapeId, setShapeId] = useState<NailShapeId>("almond");

  const samples = useRef<HandLandmarks[]>([]);
  const recent = useRef<HandLandmarks[]>([]);
  const countdownStart = useRef<number | null>(null);
  const lastSeen = useRef(0);
  const lastTimestamp = useRef(0);
  const frameCount = useRef(0);
  const finished = useRef(false);
  const shapeRef = useRef<NailShapeId>("almond");
  const guidanceRef = useRef<Guidance>(idleGuidance(t));
  const frameSmoother = useRef(createNailFrameSmoother(0.26));
  const lastOverlay = useRef<{
    points: ReturnType<typeof toPixels>;
    frames: NailFrame[];
    shapeId: NailShapeId;
  } | null>(null);

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
    frameSmoother.current.reset();
    lastOverlay.current = null;

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
        const cached = lastOverlay.current;
        if (cached && time - lastSeen.current <= GRACE_MS) {
          const pulse = 0.5 + 0.5 * Math.sin(time / 380);
          drawArOverlay(
            ctx,
            cached.points,
            cached.frames,
            NAIL_SHAPES[cached.shapeId],
            pulse,
          );
        } else if (time - lastSeen.current > GRACE_MS) {
          countdownStart.current = null;
          samples.current = [];
          recent.current = [];
          lastOverlay.current = null;
          publish(idleGuidance(tRef.current));
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
      const frames = frameSmoother.current.update(points, shape, undefined, {
        width: canvas.width,
        height: canvas.height,
      });
      lastOverlay.current = {
        points,
        frames,
        shapeId: shapeRef.current,
      };
      const pulse = 0.5 + 0.5 * Math.sin(time / 380);
      drawArOverlay(ctx, points, frames, shape, pulse);

      const visible = isFullyVisible(landmarks);
      const steady = jitterOf(recent.current) < STEADY_JITTER;
      const close = span > MIN_HAND_SPAN;
      const copy = tRef.current;

      if (!visible || !close || !steady) {
        countdownStart.current = null;
        samples.current = [];
        publish({
          message: !close
            ? copy.moveCloser
            : !visible
              ? copy.wholeHand
              : copy.holdStill,
          detail: !close
            ? copy.moveCloserDetail
            : !visible
              ? copy.wholeHandDetail
              : copy.holdStillDetail,
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
        message: copy.measuring,
        detail: copy.measuringDetail,
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
    <Stage name="scan" className="bg-atelier text-charcoal">
      <header className="safe-top border-hairline flex items-center justify-between border-b px-6 pb-4">
        <IconButton onClick={onCancel} aria-label={t.back}>
          <ArrowLeft className="h-4 w-4" strokeWidth={1.25} />
        </IconButton>
        <Label className="text-charcoal/45">{t.handScan}</Label>
        <IconButton onClick={camera.flip} aria-label={t.switchCamera}>
          <SwitchCamera className="h-4 w-4" strokeWidth={1.25} />
        </IconButton>
      </header>

      <div className="flex min-h-0 flex-1 flex-col px-6 pt-6">
        <div className="border-hairline bg-charcoal relative min-h-0 flex-1 overflow-hidden rounded-sm border">
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
          <Brackets active={guidance.tracking} />
        </div>
      </div>

      <footer className="safe-bottom flex flex-col gap-5 px-6 pt-6">
        {blocked ? (
          <div className="border-hairline flex flex-col gap-5 border-t pt-5">
            <div className="flex gap-3">
              <TriangleAlert
                className="text-charcoal/50 mt-0.5 h-4 w-4 shrink-0"
                strokeWidth={1.25}
              />
              <p className="text-charcoal/70 text-sm leading-relaxed font-light">
                {resolveBlockedMessage(t, camera.error, modelError)}
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <OutlineButton onClick={camera.retry}>{t.tryAgain}</OutlineButton>
              <OutlineButton
                onClick={() => fileInput.current?.click()}
                icon={<ImageUp className="h-4 w-4" strokeWidth={1.25} />}
              >
                {t.uploadPhoto}
              </OutlineButton>
            </div>
          </div>
        ) : (
          <ProgressReadout
            title={preparing ? t.preparingScanner : guidance.message}
            detail={preparing ? t.loadingModel : guidance.detail}
            footnote={`${t.recommending} ${NAIL_SHAPES[shapeId].name}`}
            progress={guidance.progress}
            seconds={guidance.seconds}
            counting={guidance.progress > 0}
            preparing={preparing}
          />
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
      </footer>
    </Stage>
  );
}

/** Four hairline corner marks that recede once the hand is being tracked. */
function Brackets({ active }: { active: boolean }) {
  return (
    <div
      className={cx(
        "pointer-events-none absolute inset-4 transition-opacity duration-500",
        active ? "opacity-35" : "opacity-80",
      )}
    >
      {[
        "top-0 left-0 border-t border-l",
        "top-0 right-0 border-t border-r",
        "bottom-0 left-0 border-b border-l",
        "bottom-0 right-0 border-b border-r",
      ].map((corner) => (
        <span
          key={corner}
          className={cx("border-atelier/80 absolute h-8 w-8", corner)}
        />
      ))}
    </div>
  );
}

function ProgressReadout({
  title,
  detail,
  footnote,
  progress,
  seconds,
  counting,
  preparing,
}: {
  title: string;
  detail: string;
  footnote: string;
  progress: number;
  seconds: number;
  counting: boolean;
  preparing: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-display text-charcoal text-2xl leading-none">
          {title}
        </p>
        {preparing ? (
          <LoaderCircle
            className="text-charcoal/40 h-4 w-4 shrink-0 animate-spin"
            strokeWidth={1.25}
          />
        ) : (
          <span
            className={cx(
              "font-display shrink-0 text-2xl leading-none tabular-nums transition-colors",
              counting ? "text-charcoal" : "text-charcoal/25",
            )}
          >
            {counting ? seconds : 5}
          </span>
        )}
      </div>

      <div className="bg-hairline h-px w-full overflow-hidden">
        <div
          className="bg-charcoal h-px origin-left transition-transform duration-100 ease-linear"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      <div className="flex items-baseline justify-between gap-4">
        <p className="text-charcoal/55 text-xs font-light">{detail}</p>
        <Label className="text-charcoal/35 shrink-0 text-[0.6rem]">
          {footnote}
        </Label>
      </div>
    </div>
  );
}
