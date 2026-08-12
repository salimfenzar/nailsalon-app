"use client";

import { useRef } from "react";
import { copyFor, type Language } from "../_lib/i18n";
import { Label, OutlineButton, PrimaryButton, Stage, Wordmark } from "./ui";

type SplashScreenProps = {
  language: Language;
  onStartScan: () => void;
  onPickPhoto: (file: File) => void;
  busy: boolean;
  notice: string | null;
};

export function SplashScreen({
  language,
  onStartScan,
  onPickPhoto,
  busy,
  notice,
}: SplashScreenProps) {
  const t = copyFor(language);
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <Stage name="splash" className="bg-atelier animate-fade">
      <div className="safe-top flex flex-1 flex-col px-10">
        <header className="flex justify-center pb-14">
          <Wordmark size="sm" />
        </header>

        <div className="animate-rise flex flex-1 flex-col justify-center">
          <Label className="text-charcoal/45">{t.aiHandScan}</Label>

          <h1 className="font-display text-charcoal mt-7 text-[3.1rem] leading-[1.02] font-normal">
            {t.splashHeadlineLead}
            <br />
            <span className="italic">{t.splashHeadlineAccent}</span>
            <br />
            {t.splashHeadlineTail}
          </h1>

          <span className="bg-hairline mt-9 h-px w-16" />

          <p className="text-charcoal/60 mt-7 max-w-[19rem] text-sm leading-relaxed font-light">
            {t.splashSubtitle}
          </p>
        </div>

        <div
          className="animate-rise safe-bottom flex w-full flex-col gap-3 pt-10"
          style={{ animationDelay: "180ms" }}
        >
          {notice ? (
            <p className="border-hairline text-charcoal/70 mb-1 border-l-2 py-1 pl-4 text-xs leading-relaxed font-light">
              {notice}
            </p>
          ) : null}

          <PrimaryButton onClick={onStartScan} disabled={busy}>
            {busy ? t.preparing : t.startHandScan}
          </PrimaryButton>

          <OutlineButton
            onClick={() => fileInput.current?.click()}
            disabled={busy}
          >
            {t.usePhotoInstead}
          </OutlineButton>

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
      </div>
    </Stage>
  );
}
