"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowLeft, Camera, Download, Eye } from "lucide-react";
import { describeNailBed, suggestedLength } from "../_lib/analysis";
import { clamp } from "../_lib/geometry";
import {
  DEFAULT_ALIGNMENT,
  NAIL_SHAPES,
  NAIL_SHAPE_ORDER,
  type Alignment,
  type NailShapeId,
} from "../_lib/nail-shapes";
import { POLISHES, polishById, type Polish } from "../_lib/palette";
import type { ScanResult } from "../_lib/scan";
import { ColorPicker } from "./color-picker";
import { FineTunePanel } from "./fine-tune-panel";
import { NailCanvas } from "./nail-canvas";
import { Eyebrow, GhostButton, Hairline, PrimaryButton, Stage, cx } from "./ui";

type ResultScreenProps = {
  result: ScanResult;
  onRescan: () => void;
  onBack: () => void;
};

export function ResultScreen({ result, onRescan, onBack }: ResultScreenProps) {
  const { verdict, skinTone } = result;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [shape, setShape] = useState<NailShapeId>(verdict.shape);
  const [polish, setPolish] = useState<Polish>(() => suggestPolish(result));
  const [alignment, setAlignment] = useState<Alignment>(DEFAULT_ALIGNMENT);
  const [fineTuneOpen, setFineTuneOpen] = useState(false);
  const [comparing, setComparing] = useState(false);

  const match = useMemo(() => matchFor(result, shape), [result, shape]);
  const definition = NAIL_SHAPES[shape];
  const isRecommended = shape === verdict.shape;

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `lumiere-${shape}-${polish.id}.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 0.92);
    link.click();
  };

  return (
    <Stage name="result" className="bg-porcelain">
      <header className="bg-porcelain/85 safe-top border-sand/70 sticky top-0 z-20 flex items-center justify-between border-b px-6 pb-4 backdrop-blur-xl">
        <button
          onClick={onBack}
          aria-label="Back"
          className="border-sand text-mocha hover:border-champagne hover:text-espresso flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.25} />
        </button>
        <Eyebrow>Your Result</Eyebrow>
        <button
          onClick={save}
          aria-label="Save image"
          className="border-sand text-mocha hover:border-champagne hover:text-espresso flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
        >
          <Download className="h-4 w-4" strokeWidth={1.25} />
        </button>
      </header>

      <div className="flex flex-col gap-8 pt-6 pb-16">
        <section className="relative px-6">
          <div className="border-sand relative overflow-hidden rounded-[2rem] border shadow-[0_30px_60px_-40px_rgba(74,59,50,0.7)]">
            <NailCanvas
              result={result}
              shape={shape}
              polish={polish}
              alignment={alignment}
              bare={comparing}
              canvasRef={canvasRef}
            />

            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/15 to-transparent" />

            <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
              <span className="bg-porcelain/92 text-espresso flex items-baseline gap-1.5 rounded-full px-3.5 py-2 shadow-[0_8px_24px_-12px_rgba(33,26,21,0.8)] backdrop-blur-md">
                <span className="font-display text-lg leading-none">{match}%</span>
                <span className="text-[0.55rem] tracking-[0.18em] uppercase">
                  Match
                </span>
              </span>
              {isRecommended ? (
                <span className="bg-espresso/85 text-porcelain rounded-full px-3 py-1.5 text-[0.5rem] tracking-[0.18em] uppercase backdrop-blur-md">
                  Stylist pick
                </span>
              ) : null}
            </div>

            <button
              onPointerDown={() => setComparing(true)}
              onPointerUp={() => setComparing(false)}
              onPointerLeave={() => setComparing(false)}
              onPointerCancel={() => setComparing(false)}
              className="bg-porcelain/92 text-espresso absolute bottom-4 left-4 flex items-center gap-2 rounded-full px-3.5 py-2 text-[0.55rem] tracking-[0.18em] uppercase backdrop-blur-md transition-transform active:scale-95"
            >
              <Eye className="h-3.5 w-3.5" strokeWidth={1.25} />
              {comparing ? "Bare hand" : "Hold to compare"}
            </button>
          </div>
        </section>

        <section className="flex flex-col items-center gap-3 px-8 text-center">
          <Eyebrow>Recommended shape</Eyebrow>
          <h1 className="font-display text-espresso text-4xl leading-none font-light">
            {definition.name}
          </h1>
          <p className="text-taupe text-xs tracking-[0.12em] uppercase">
            {definition.tagline}
          </p>
          <p className="text-mocha max-w-sm text-balance text-sm leading-relaxed font-light">
            {isRecommended ? verdict.advice : offPickNote(verdict.shape)}
          </p>
        </section>

        <section className="mx-6">
          <div className="border-sand grid grid-cols-3 divide-x divide-[color:var(--color-sand)] rounded-2xl border">
            <Metric
              label="Length / width"
              value={`${verdict.measurements.lengthWidthRatio.toFixed(2)} : 1`}
            />
            <Metric
              label="Nail bed"
              value={describeNailBed(verdict.measurements.bedRatio)}
            />
            <Metric label="Suggested length" value={suggestedLength(shape)} />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between px-6">
            <Eyebrow>Try another shape</Eyebrow>
            <span className="text-mocha/70 text-[0.6rem] tracking-[0.16em] uppercase">
              Also suits you: {verdict.alternates.map((id) => NAIL_SHAPES[id].name).join(", ")}
            </span>
          </div>
          <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-6">
            {NAIL_SHAPE_ORDER.map((id) => (
              <button
                key={id}
                onClick={() => setShape(id)}
                aria-pressed={id === shape}
                className={cx(
                  "shrink-0 rounded-full border px-4 py-2 text-[0.6rem] tracking-[0.18em] uppercase transition-colors duration-300",
                  id === shape
                    ? "border-espresso bg-espresso text-porcelain"
                    : "border-sand text-mocha hover:border-champagne",
                )}
              >
                {NAIL_SHAPES[id].name}
                {id === verdict.shape ? " ·" : ""}
              </button>
            ))}
          </div>
        </section>

        <FineTunePanel
          alignment={alignment}
          onChange={setAlignment}
          open={fineTuneOpen}
          onToggle={() => setFineTuneOpen((value) => !value)}
        />

        <Hairline />

        <ColorPicker selected={polish} onSelect={setPolish} skinTone={skinTone} />

        <section className="safe-bottom flex flex-col gap-3 px-6 pt-2">
          <PrimaryButton
            onClick={save}
            icon={<Download className="h-4 w-4" strokeWidth={1.25} />}
          >
            Save this look
          </PrimaryButton>
          <GhostButton
            onClick={onRescan}
            icon={<Camera className="h-4 w-4" strokeWidth={1.25} />}
          >
            Scan again
          </GhostButton>
          <p className="text-mocha/60 pt-2 text-center text-[0.6rem] tracking-[0.14em] uppercase">
            {result.source === "camera"
              ? `Averaged over ${result.samples} frames`
              : "Measured from your photo"}
          </p>
        </section>
      </div>
    </Stage>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-2 py-4">
      <span className="text-mocha/75 text-center text-[0.55rem] tracking-[0.16em] uppercase">
        {label}
      </span>
      <span className="font-display text-espresso text-base leading-none">
        {value}
      </span>
    </div>
  );
}

/**
 * The badge tracks whatever shape is on screen: the recommendation keeps its
 * measured score, a neighbouring shape loses a little, anything further loses
 * more.
 */
function matchFor(result: ScanResult, shape: NailShapeId): number {
  const { verdict } = result;
  if (shape === verdict.shape) return verdict.match;
  if (verdict.alternates.includes(shape)) return clamp(verdict.match - 7, 60, 99);

  const order = NAIL_SHAPE_ORDER.indexOf(shape);
  const target = NAIL_SHAPE_ORDER.indexOf(verdict.shape);
  return clamp(verdict.match - 8 - Math.abs(order - target) * 5, 58, 99);
}

function offPickNote(recommended: NailShapeId): string {
  return `You are previewing a shape outside your measured match. Your scan points to ${NAIL_SHAPES[recommended].name}, which sits in proportion with your finger ratio — switch back any time to compare.`;
}

function suggestPolish(result: ScanResult): Polish {
  const undertone = result.skinTone?.undertone;
  if (!undertone) return polishById("bare-silk");
  return (
    POLISHES.find(
      (polish) => polish.category === "solid" && polish.flatters.includes(undertone),
    ) ?? polishById("bare-silk")
  );
}
