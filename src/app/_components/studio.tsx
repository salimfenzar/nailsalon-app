"use client";

import { useCallback, useState } from "react";
import type { HandLandmarks } from "../_lib/geometry";
import {
  buildScanResult,
  imageToCanvas,
  loadImageFile,
  type ScanResult,
} from "../_lib/scan";
import { useHandLandmarker } from "../_lib/use-hand-landmarker";
import { ResultScreen } from "./result-screen";
import { ScanScreen } from "./scan-screen";
import { SplashScreen } from "./splash-screen";

type Stage = "splash" | "scan" | "result";

export function Studio() {
  const [stage, setStage] = useState<Stage>("splash");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Left disabled so the 8 MB task is only fetched once a scan is actually
  // requested; `detectImage` loads it on demand for the upload route.
  const { detectImage } = useHandLandmarker(false);

  const handlePickPhoto = useCallback(
    async (file: File) => {
      setBusy(true);
      setNotice(null);

      try {
        const image = await loadImageFile(file);
        const canvas = imageToCanvas(image);
        if (!canvas) throw new Error("That image could not be read.");

        const detection = await detectImage(canvas);
        const landmarks = detection?.landmarks?.[0] as HandLandmarks | undefined;

        if (!landmarks || landmarks.length < 21) {
          setStage("splash");
          setNotice(
            "No hand was found in that photo. Use a well-lit shot with the palm down and all five fingertips inside the frame.",
          );
          return;
        }

        setResult(buildScanResult(canvas, landmarks, "upload", 1));
        setStage("result");
      } catch (cause: unknown) {
        setStage("splash");
        setNotice(
          cause instanceof Error
            ? cause.message
            : "That photo could not be analysed.",
        );
      } finally {
        setBusy(false);
      }
    },
    [detectImage],
  );

  const handleComplete = useCallback((scan: ScanResult) => {
    setResult(scan);
    setNotice(null);
    setStage("result");
  }, []);

  if (stage === "scan") {
    return (
      <ScanScreen
        onComplete={handleComplete}
        onCancel={() => setStage("splash")}
        onPickPhoto={handlePickPhoto}
      />
    );
  }

  if (stage === "result" && result) {
    return (
      <ResultScreen
        result={result}
        onRescan={() => setStage("scan")}
        onBack={() => setStage("splash")}
      />
    );
  }

  return (
    <SplashScreen
      onStartScan={() => {
        setNotice(null);
        setStage("scan");
      }}
      onPickPhoto={handlePickPhoto}
      busy={busy}
      notice={notice}
    />
  );
}
