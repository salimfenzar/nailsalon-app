"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
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

type StudioProps = {
  initialLanguage?: Language;
  startAt?: "splash" | "scan";
};

export function Studio({ initialLanguage, startAt }: StudioProps) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>(
    () => startAt ?? (initialLanguage ? "splash" : "intro"),
  );
  const [language, setLanguage] = useState<Language>(initialLanguage ?? "en");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState(0);

  // Left disabled so the 8 MB task is only fetched once a scan is actually
  // requested; `detectImage` loads it on demand for the upload route.
  const { detectImage } = useHandLandmarker(false);

  const leaveToLanding = useCallback(() => {
    router.push("/");
  }, [router]);

  const handlePickPhoto = useCallback(
    async (file: File) => {
      setBusy(true);
      setNotice(null);
      const messages = copyFor(language);

      try {
        const image = await loadImageFile(file);
        const canvas = imageToCanvas(image);
        if (image instanceof ImageBitmap) image.close();
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

  /**
   * Hands the station to the next client: drops the previous photo, landmarks
   * and shade choices, clears any look preset left in the URL by a shared QR,
   * and goes straight to the scanner. The language stays as the salon set it.
   */
  const handleNextClient = useCallback(() => {
    setResult(null);
    setNotice(null);
    setBusy(false);

    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    // Remounts the screens, so no per-screen state survives into the next scan.
    setSession((value) => value + 1);
    setStage("scan");
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
        key={session}
        language={language}
        onComplete={handleComplete}
        onCancel={() => {
          if (startAt === "scan") leaveToLanding();
          else setStage("splash");
        }}
        onPickPhoto={handlePickPhoto}
      />
    );
  }

  if (stage === "result" && result) {
    return (
      <ResultScreen
        key={session}
        language={language}
        result={result}
        onRescan={() => setStage("scan")}
        onBack={() => setStage("splash")}
        onNextClient={handleNextClient}
      />
    );
  }

  return (
    <SplashScreen
      language={language}
      onHome={leaveToLanding}
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
