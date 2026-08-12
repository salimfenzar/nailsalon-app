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
import { Chip, Label, cx } from "./ui";

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
        <Label className="text-charcoal/45">{t.colourDesign}</Label>
        <Label className="text-charcoal/35 text-[0.6rem]">
          {t.shades(POLISHES.length)}
        </Label>
      </div>

      {skinTone ? <UndertoneBadge language={language} tone={skinTone} /> : null}

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-6">
        {CATEGORIES.map((tab) => (
          <Chip
            key={tab.id}
            active={category === tab.id}
            onClick={() => setCategory(tab.id)}
          >
            {categoryLabel[tab.id]}
          </Chip>
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
              className="flex w-16 shrink-0 flex-col items-center gap-2.5"
            >
              <span className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                <span
                  className={cx(
                    "border-hairline h-12 w-12 rounded-sm border transition-[box-shadow] duration-300",
                    isSelected &&
                      "ring-charcoal ring-offset-atelier ring-1 ring-offset-2",
                  )}
                  style={{ background: swatchBackground(polish) }}
                />
                {isRecommended ? (
                  <Sparkles
                    className="text-charcoal/50 pointer-events-none absolute top-0 -right-1 z-10 h-3 w-3"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                ) : null}
              </span>
              <span
                className={cx(
                  "text-center text-[0.55rem] leading-tight font-medium tracking-[0.12em] uppercase transition-colors",
                  isSelected ? "text-charcoal" : "text-charcoal/45",
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
    <div className="border-hairline mx-6 flex items-start gap-3.5 rounded-sm border px-4 py-3.5">
      <span
        className="border-hairline mt-0.5 h-8 w-8 shrink-0 rounded-sm border"
        style={{ background: tone.hex }}
      />
      <div className="flex flex-col gap-1.5">
        <p className="text-charcoal text-[0.6rem] font-medium tracking-[0.2em] uppercase">
          {t.skinBadge(depthLabel[tone.depth], undertoneLabel[tone.undertone])}
        </p>
        <p className="text-charcoal/60 text-xs leading-relaxed font-light">
          {advice[tone.undertone]}
        </p>
      </div>
    </div>
  );
}
