"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { DEFAULT_ALIGNMENT, type Alignment } from "../_lib/nail-shapes";
import { Eyebrow, cx } from "./ui";

type FineTunePanelProps = {
  alignment: Alignment;
  onChange: (alignment: Alignment) => void;
  open: boolean;
  onToggle: () => void;
};

type Control = {
  key: keyof Alignment;
  label: string;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
};

const CONTROLS: Control[] = [
  {
    key: "offsetY",
    label: "Position along finger",
    min: -0.35,
    max: 0.35,
    step: 0.01,
    format: (v) => `${v > 0 ? "+" : ""}${Math.round(v * 100)}%`,
  },
  {
    key: "offsetX",
    label: "Position across nail",
    min: -0.5,
    max: 0.5,
    step: 0.01,
    format: (v) => `${v > 0 ? "+" : ""}${Math.round(v * 100)}%`,
  },
  {
    key: "scale",
    label: "Width",
    min: 0.7,
    max: 1.35,
    step: 0.01,
    format: (v) => `${Math.round(v * 100)}%`,
  },
  {
    key: "lengthScale",
    label: "Length",
    min: 0.7,
    max: 1.5,
    step: 0.01,
    format: (v) => `${Math.round(v * 100)}%`,
  },
];

export function FineTunePanel({
  alignment,
  onChange,
  open,
  onToggle,
}: FineTunePanelProps) {
  const touched = CONTROLS.some(
    (control) => alignment[control.key] !== DEFAULT_ALIGNMENT[control.key],
  );

  return (
    <section className="mx-6">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className={cx(
          "border-sand hover:border-champagne flex w-full items-center justify-between rounded-2xl border px-5 py-4 transition-colors",
          open && "border-champagne",
        )}
      >
        <span className="flex items-center gap-3">
          <SlidersHorizontal className="text-taupe h-4 w-4" strokeWidth={1.25} />
          <Eyebrow>Fine-Tune Alignment</Eyebrow>
        </span>
        <span className="text-mocha/70 text-[0.6rem] tracking-[0.16em] uppercase">
          {touched ? "Adjusted" : open ? "Close" : "Open"}
        </span>
      </button>

      {open ? (
        <div className="border-sand animate-rise mt-3 flex flex-col gap-5 rounded-2xl border px-5 py-5">
          {CONTROLS.map((control) => (
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
            Reset alignment
          </button>
        </div>
      ) : null}
    </section>
  );
}
