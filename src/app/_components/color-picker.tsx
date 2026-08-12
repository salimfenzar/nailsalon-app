"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  CATEGORIES,
  POLISHES,
  swatchBackground,
  type CategoryId,
  type Polish,
} from "../_lib/palette";
import type { SkinTone } from "../_lib/skin-tone";
import { Eyebrow, cx } from "./ui";

type ColorPickerProps = {
  selected: Polish;
  onSelect: (polish: Polish) => void;
  skinTone: SkinTone | null;
};

export function ColorPicker({ selected, onSelect, skinTone }: ColorPickerProps) {
  const [category, setCategory] = useState<CategoryId>(selected.category);

  const shades = useMemo(
    () => POLISHES.filter((polish) => polish.category === category),
    [category],
  );

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between px-6">
        <Eyebrow>Colour & Design</Eyebrow>
        <span className="text-mocha/70 text-[0.6rem] tracking-[0.16em] uppercase">
          {POLISHES.length} shades
        </span>
      </div>

      {skinTone ? <UndertoneBadge tone={skinTone} /> : null}

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-6">
        {CATEGORIES.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategory(tab.id)}
            className={cx(
              "shrink-0 rounded-full border px-4 py-2 text-[0.6rem] tracking-[0.18em] whitespace-nowrap uppercase transition-colors duration-300",
              category === tab.id
                ? "border-espresso bg-espresso text-porcelain"
                : "border-sand text-mocha hover:border-champagne",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="no-scrollbar flex gap-4 overflow-x-auto px-6 pb-1">
        {shades.map((polish) => {
          const isSelected = polish.id === selected.id;
          const isRecommended =
            skinTone !== null && polish.flatters.includes(skinTone.undertone);

          return (
            <button
              key={polish.id}
              onClick={() => onSelect(polish)}
              aria-pressed={isSelected}
              className="flex w-16 shrink-0 flex-col items-center gap-2"
            >
              <span
                className={cx(
                  "relative flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-300",
                  isSelected ? "scale-105" : "hover:scale-105",
                )}
              >
                <span
                  className={cx(
                    "absolute inset-0 rounded-full border transition-colors",
                    isSelected ? "border-espresso" : "border-transparent",
                  )}
                />
                <span
                  className="h-11 w-11 rounded-full shadow-[inset_0_-4px_10px_rgba(0,0,0,0.22),inset_0_4px_8px_rgba(255,255,255,0.45)]"
                  style={{ background: swatchBackground(polish) }}
                />
                {isRecommended ? (
                  <Sparkles
                    className="text-taupe absolute -top-0.5 -right-0.5 h-3 w-3"
                    strokeWidth={1.5}
                  />
                ) : null}
              </span>
              <span
                className={cx(
                  "text-center text-[0.55rem] leading-tight tracking-[0.08em] uppercase transition-colors",
                  isSelected ? "text-espresso" : "text-mocha/70",
                )}
              >
                {polish.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function UndertoneBadge({ tone }: { tone: SkinTone }) {
  return (
    <div className="border-sand bg-linen/60 mx-6 flex items-start gap-3.5 rounded-2xl border px-4 py-3.5">
      <span
        className="border-porcelain mt-0.5 h-8 w-8 shrink-0 rounded-full border shadow-[0_2px_8px_rgba(74,59,50,0.2)]"
        style={{ background: tone.hex }}
      />
      <div className="flex flex-col gap-1">
        <p className="text-espresso text-[0.6rem] tracking-[0.18em] uppercase">
          {tone.depth} skin · {tone.undertone} undertone
        </p>
        <p className="text-mocha text-xs leading-relaxed font-light">
          {tone.advice}
        </p>
      </div>
    </div>
  );
}
