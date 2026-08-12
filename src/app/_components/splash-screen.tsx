"use client";

import { useRef, useState } from "react";
import { ImageUp, ScanLine, Sparkles } from "lucide-react";
import { Eyebrow, GhostButton, Hairline, PrimaryButton, Stage, Wordmark } from "./ui";

type SplashScreenProps = {
  onStartScan: () => void;
  onPickPhoto: (file: File) => void;
  busy: boolean;
  notice: string | null;
};

const PROMISES = [
  "21 landmarks mapped in real time",
  "Shape matched to your finger ratio",
  "Nothing leaves your device",
];

export function SplashScreen({
  onStartScan,
  onPickPhoto,
  busy,
  notice,
}: SplashScreenProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [pressed, setPressed] = useState(false);

  return (
    <Stage name="splash" className="bg-porcelain overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-blush/40 absolute -top-32 -right-24 h-72 w-72 rounded-full blur-3xl" />
        <div className="bg-champagne/35 absolute -bottom-40 -left-24 h-80 w-80 rounded-full blur-3xl" />
      </div>

      <div className="safe-top relative flex flex-1 flex-col items-center px-8">
        <Wordmark />

        <div className="flex flex-1 flex-col items-center justify-center gap-8 py-10 text-center">
          <div className="animate-rise flex flex-col items-center gap-5">
            <Eyebrow>AI Hand Scan</Eyebrow>
            <h1 className="font-display text-espresso text-balance text-[2.6rem] leading-[1.08] font-light">
              Discover the shape
              <br />
              <span className="gilded italic">your hands</span>
              <br />
              were made for
            </h1>
            <p className="text-mocha max-w-[19rem] text-balance text-sm leading-relaxed font-light">
              Hold your hand still for five seconds. We measure the ratio of
              every finger and place the nail shape, length and shade that suit
              you best — on your own photograph.
            </p>
          </div>

          <div
            className="animate-rise relative flex h-40 w-40 items-center justify-center"
            style={{ animationDelay: "120ms" }}
          >
            <div className="border-champagne/60 absolute inset-0 rounded-full border" />
            <div className="border-champagne/30 animate-breathe absolute inset-4 rounded-full border" />
            <div className="bg-linen absolute inset-9 rounded-full" />
            <Sparkles className="text-taupe relative h-7 w-7" strokeWidth={1} />
          </div>
        </div>

        <div
          className="animate-rise safe-bottom flex w-full max-w-sm flex-col items-center gap-4"
          style={{ animationDelay: "220ms" }}
        >
          {notice ? (
            <p className="border-champagne/60 bg-linen/70 text-mocha w-full rounded-2xl border px-5 py-3 text-center text-xs leading-relaxed">
              {notice}
            </p>
          ) : null}

          <PrimaryButton
            onPointerDown={() => setPressed(true)}
            onPointerUp={() => setPressed(false)}
            onPointerCancel={() => setPressed(false)}
            onClick={onStartScan}
            disabled={busy}
            icon={<ScanLine className="h-4 w-4" strokeWidth={1.25} />}
            className={pressed ? "scale-[0.985]" : undefined}
          >
            {busy ? "Preparing" : "Start Hand Scan"}
          </PrimaryButton>

          <GhostButton
            onClick={() => fileInput.current?.click()}
            disabled={busy}
            icon={<ImageUp className="h-4 w-4" strokeWidth={1.25} />}
          >
            Use a photo instead
          </GhostButton>

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

          <Hairline className="mt-2" />

          <ul className="text-mocha/80 flex flex-col items-center gap-1.5 pt-1 text-[0.6rem] tracking-[0.16em] uppercase">
            {PROMISES.map((promise) => (
              <li key={promise}>{promise}</li>
            ))}
          </ul>
        </div>
      </div>
    </Stage>
  );
}
