"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { copyFor, type Language } from "../_lib/i18n";
import {
  CATEGORIES,
  POLISHES,
  swatchBackground,
  type CategoryId,
  type Polish,
  type Undertone,
} from "../_lib/palette";
import type { SkinTone } from "../_lib/skin-tone";
import { Eyebrow, cx } from "./ui";

type ColorPickerProps = {
  language: Language;
  selected: Polish;
  onSelect: (polish: Polish) => void;
  skinTone: SkinTone | null;
};

export function ColorPicker({
  language,
  selected,
  onSelect,
  skinTone,
}: ColorPickerProps) {
  const t = copyFor(language);
  const [category, setCategory] = useState<CategoryId>(selected.category);

  const shades = useMemo(
    () => POLISHES.filter((polish) => polish.category === category),
    [category],
  );

  const categoryLabel: Record<CategoryId, string> = {
    solid: t.categorySolid,
    chrome: t.categoryChrome,
    french: t.categoryFrench,
    trending: t.categoryTrending,
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between px-6">
        <Eyebrow>{t.colourDesign}</Eyebrow>
        <span className="text-mocha/70 text-[0.6rem] tracking-[0.16em] uppercase">
          {t.shades(POLISHES.length)}
        </span>
      </div>

      {skinTone ? <UndertoneBadge language={language} tone={skinTone} /> : null}

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
            {categoryLabel[tab.id]}
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
              <span className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                <span
                  className={cx(
                    "h-11 w-11 rounded-full shadow-[inset_0_-4px_10px_rgba(0,0,0,0.22),inset_0_4px_8px_rgba(255,255,255,0.45)] transition-[box-shadow,transform] duration-300",
                    isSelected
                      ? "ring-espresso ring-offset-porcelain scale-105 ring-2 ring-offset-2"
                      : "hover:scale-105",
                  )}
                  style={{ background: swatchBackground(polish) }}
                />
                {isRecommended ? (
                  <Sparkles
                    className="text-taupe pointer-events-none absolute top-0 -right-1 z-10 h-3 w-3"
                    strokeWidth={1.5}
                    aria-hidden
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

function UndertoneBadge({
  language,
  tone,
}: {
  language: Language;
  tone: SkinTone;
}) {
  const t = copyFor(language);
  const undertoneLabel: Record<Undertone, string> = {
    warm: t.undertoneWarm,
    cool: t.undertoneCool,
    neutral: t.undertoneNeutral,
  };
  const depthLabel: Record<SkinTone["depth"], string> = {
    Fair: t.depthFair,
    Light: t.depthLight,
    Medium: t.depthMedium,
    Tan: t.depthTan,
    Deep: t.depthDeep,
  };
  const advice: Record<Undertone, string> = {
    warm: t.adviceWarm,
    cool: t.adviceCool,
    neutral: t.adviceNeutral,
  };

  return (
    <div className="border-sand bg-linen/60 mx-6 flex items-start gap-3.5 rounded-2xl border px-4 py-3.5">
      <span
        className="border-porcelain mt-0.5 h-8 w-8 shrink-0 rounded-full border shadow-[0_2px_8px_rgba(74,59,50,0.2)]"
        style={{ background: tone.hex }}
      />
      <div className="flex flex-col gap-1">
        <p className="text-espresso text-[0.6rem] tracking-[0.18em] uppercase">
          {t.skinBadge(depthLabel[tone.depth], undertoneLabel[tone.undertone])}
        </p>
        <p className="text-mocha text-xs leading-relaxed font-light">
          {advice[tone.undertone]}
        </p>
      </div>
    </div>
  );
}
