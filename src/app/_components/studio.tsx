"use client";

import { useCallback, useState } from "react";
import type { HandLandmarks } from "../_lib/geometry";
import { copyFor, type Language } from "../_lib/i18n";
import {
  buildScanResult,
  imageToCanvas,
  loadImageFile,
  type ScanResult,
} from "../_lib/scan";
import { useHandLandmarker } from "../_lib/use-hand-landmarker";
import { LanguageIntro } from "./language-intro";
import { ResultScreen } from "./result-screen";
import { ScanScreen } from "./scan-screen";
import { SplashScreen } from "./splash-screen";

type Stage = "intro" | "splash" | "scan" | "result";

export function Studio() {
  const [stage, setStage] = useState<Stage>("intro");
  const [language, setLanguage] = useState<Language>("en");
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
      const messages = copyFor(language);

      try {
        const image = await loadImageFile(file);
        const canvas = imageToCanvas(image);
        if (!canvas) throw new Error(messages.imageUnreadable);

        const detection = await detectImage(canvas);
        const landmarks = detection?.landmarks?.[0] as HandLandmarks | undefined;

        if (!landmarks || landmarks.length < 21) {
          setStage("splash");
          setNotice(messages.noHandInPhoto);
          return;
        }

        setResult(buildScanResult(canvas, landmarks, "upload", 1));
        setStage("result");
      } catch (cause: unknown) {
        setStage("splash");
        setNotice(
          cause instanceof Error ? cause.message : messages.photoAnalyseFailed,
        );
      } finally {
        setBusy(false);
      }
    },
    [detectImage, language],
  );

  const handleComplete = useCallback((scan: ScanResult) => {
    setResult(scan);
    setNotice(null);
    setStage("result");
  }, []);

  if (stage === "intro") {
    return (
      <LanguageIntro
        onSelect={(next) => {
          setLanguage(next);
          setStage("splash");
        }}
      />
    );
  }

  if (stage === "scan") {
    return (
      <ScanScreen
        language={language}
        onComplete={handleComplete}
        onCancel={() => setStage("splash")}
        onPickPhoto={handlePickPhoto}
      />
    );
  }

  if (stage === "result" && result) {
    return (
      <ResultScreen
        language={language}
        result={result}
        onRescan={() => setStage("scan")}
        onBack={() => setStage("splash")}
      />
    );
  }

  return (
    <SplashScreen
      language={language}
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
