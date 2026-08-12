"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import type { Language } from "../_lib/i18n";
import { Stage, Wordmark, cx } from "./ui";

type LanguageIntroProps = {
  onSelect: (language: Language) => void;
};

const OPTIONS: Array<{ id: Language; label: string }> = [
  { id: "nl", label: "Nederlands" },
  { id: "en", label: "English" },
];

export function LanguageIntro({ onSelect }: LanguageIntroProps) {
  const [leaving, setLeaving] = useState(false);
  const [picked, setPicked] = useState<Language | null>(null);

  const choose = (language: Language) => {
    if (leaving) return;
    setPicked(language);
    setLeaving(true);
    window.setTimeout(() => onSelect(language), 480);
  };

  return (
    <Stage
      name="intro"
      className={cx(
        "bg-porcelain overflow-hidden transition-opacity duration-500",
        leaving ? "opacity-0" : "opacity-100",
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-blush/35 absolute -top-28 -right-20 h-72 w-72 rounded-full blur-3xl" />
        <div className="bg-champagne/30 absolute -bottom-36 -left-16 h-80 w-80 rounded-full blur-3xl" />
      </div>

      <div className="safe-top safe-bottom relative flex flex-1 flex-col items-center justify-center gap-14 px-8">
        <div className="animate-rise flex flex-col items-center gap-8 text-center">
          <div className="animate-logo-pulse relative flex h-36 w-36 items-center justify-center">
            <div className="border-champagne/50 absolute inset-0 rounded-full border" />
            <div className="border-champagne/25 absolute inset-4 rounded-full border" />
            <div className="bg-linen absolute inset-8 rounded-full" />
            <Sparkles className="text-taupe relative h-7 w-7" strokeWidth={1} />
          </div>

          <Wordmark />

          <div className="flex flex-col items-center gap-2">
            <p className="font-display text-espresso text-2xl font-light tracking-wide">
              Choose your language
            </p>
            <p className="text-mocha/70 text-[0.6rem] tracking-[0.22em] uppercase">
              Select to continue · Selecteer om verder te gaan
            </p>
          </div>
        </div>

        <div
          className="animate-rise flex w-full max-w-xs flex-col gap-3"
          style={{ animationDelay: "160ms" }}
        >
          {OPTIONS.map((option) => {
            const active = picked === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => choose(option.id)}
                disabled={leaving}
                className={cx(
                  "rounded-full border px-6 py-3.5 text-[0.7rem] tracking-[0.22em] uppercase transition-all duration-300",
                  "active:scale-[0.985] disabled:pointer-events-none",
                  active
                    ? "border-espresso bg-espresso text-porcelain shadow-[0_16px_36px_-22px_rgba(33,26,21,0.85)]"
                    : "border-sand text-mocha hover:border-champagne hover:text-espresso bg-porcelain/70",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </Stage>
  );
}
