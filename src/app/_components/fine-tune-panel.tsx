"use client";

import { RotateCcw } from "lucide-react";
import { copyFor, type Language } from "../_lib/i18n";
import { DEFAULT_ALIGNMENT, type Alignment } from "../_lib/nail-shapes";

type FineTunePanelProps = {
  language: Language;
  alignment: Alignment;
  onChange: (alignment: Alignment) => void;
};

type ControlKey = keyof Alignment;

export function FineTunePanel({
  language,
  alignment,
  onChange,
}: FineTunePanelProps) {
  const t = copyFor(language);

  const controls: Array<{
    key: ControlKey;
    label: string;
    min: number;
    max: number;
    step: number;
    format: (value: number) => string;
  }> = [
    {
      key: "offsetY",
      label: t.alignAlong,
      min: -0.35,
      max: 0.35,
      step: 0.01,
      format: (v) => `${v > 0 ? "+" : ""}${Math.round(v * 100)}%`,
    },
    {
      key: "offsetX",
      label: t.alignAcross,
      min: -0.5,
      max: 0.5,
      step: 0.01,
      format: (v) => `${v > 0 ? "+" : ""}${Math.round(v * 100)}%`,
    },
    {
      key: "scale",
      label: t.alignWidth,
      min: 0.7,
      max: 1.35,
      step: 0.01,
      format: (v) => `${Math.round(v * 100)}%`,
    },
    {
      key: "lengthScale",
      label: t.alignLength,
      min: 0.7,
      max: 1.5,
      step: 0.01,
      format: (v) => `${Math.round(v * 100)}%`,
    },
  ];

  const touched = controls.some(
    (control) => alignment[control.key] !== DEFAULT_ALIGNMENT[control.key],
  );

  return (
    <div className="border-sand bg-porcelain/95 flex flex-col gap-5 rounded-2xl border px-5 py-5 shadow-[0_16px_40px_-28px_rgba(74,59,50,0.55)] backdrop-blur-md">
      {controls.map((control) => (
        <label key={control.key} className="flex flex-col gap-2.5">
          <span className="flex items-baseline justify-between">
            <span className="text-mocha text-[0.6rem] tracking-[0.16em] uppercase">
              {control.label}
            </span>
            <span className="text-espresso font-display text-sm">
              {control.format(alignment[control.key])}
            </span>
          </span>
          <input
            type="range"
            min={control.min}
            max={control.max}
            step={control.step}
            value={alignment[control.key]}
            onChange={(event) =>
              onChange({
                ...alignment,
                [control.key]: Number(event.target.value),
              })
            }
          />
        </label>
      ))}

      <button
        onClick={() => onChange(DEFAULT_ALIGNMENT)}
        disabled={!touched}
        className="text-mocha hover:text-espresso flex items-center justify-center gap-2 pt-1 text-[0.6rem] tracking-[0.16em] uppercase transition-colors disabled:opacity-40"
      >
        <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.25} />
        {t.resetAlignment}
      </button>
    </div>
  );
}
