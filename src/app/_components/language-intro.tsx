"use client";

import { useState } from "react";
import type { Language } from "../_lib/i18n";
import { Label, Stage, Wordmark, cx } from "./ui";

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
        "bg-atelier transition-opacity duration-500",
        leaving ? "opacity-0" : "opacity-100",
      )}
    >
      <div className="safe-top safe-bottom flex flex-1 flex-col items-center justify-between px-10">
        <div className="flex flex-1 flex-col items-center justify-center gap-16">
          <div className="animate-logo-pulse flex flex-col items-center gap-7">
            <span className="bg-charcoal/70 h-14 w-px" />
            <Wordmark />
            <span className="bg-charcoal/70 h-14 w-px" />
          </div>
        </div>

        <div
          className="animate-rise flex w-full max-w-xs flex-col items-center gap-6 pb-4"
          style={{ animationDelay: "200ms" }}
        >
          <Label className="text-charcoal/45">Language</Label>

          <div className="flex w-full flex-col">
            {OPTIONS.map((option, index) => {
              const active = picked === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => choose(option.id)}
                  disabled={leaving}
                  className={cx(
                    "border-hairline w-full border-t px-6 py-5 text-xs font-medium tracking-[0.2em] uppercase transition-colors duration-300",
                    index === OPTIONS.length - 1 && "border-b",
                    active
                      ? "bg-charcoal text-atelier"
                      : "text-charcoal hover:bg-charcoal hover:text-atelier",
                    "disabled:pointer-events-none",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Stage>
  );
}
