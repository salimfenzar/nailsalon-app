"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Download,
  Eye,
  SlidersHorizontal,
  UserRoundPlus,
} from "lucide-react";
import { clamp } from "../_lib/geometry";
import { copyFor, type Language } from "../_lib/i18n";
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
import { ShareModal } from "./share-modal";
import { Eyebrow, GhostButton, PrimaryButton, Stage, cx } from "./ui";

type ResultScreenProps = {
  language: Language;
  result: ScanResult;
  onRescan: () => void;
  onBack: () => void;
  /** Clears the session and sends the station straight to the next scan. */
  onNextClient: () => void;
};

export function ResultScreen({
  language,
  result,
  onRescan,
  onBack,
  onNextClient,
}: ResultScreenProps) {
  const t = copyFor(language);
  const { verdict, skinTone } = result;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [shape, setShape] = useState<NailShapeId>(
    () => presetShape() ?? verdict.shape,
  );
  const [polish, setPolish] = useState<Polish>(
    () => presetPolish() ?? suggestPolish(result),
  );
  const [alignment, setAlignment] = useState<Alignment>(DEFAULT_ALIGNMENT);
  const [fineTuneOpen, setFineTuneOpen] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const match = useMemo(() => matchFor(result, shape), [result, shape]);
  const definition = NAIL_SHAPES[shape];
  const isRecommended = shape === verdict.shape;
  const fineTuneTouched =
    alignment.offsetX !== DEFAULT_ALIGNMENT.offsetX ||
    alignment.offsetY !== DEFAULT_ALIGNMENT.offsetY ||
    alignment.scale !== DEFAULT_ALIGNMENT.scale ||
    alignment.lengthScale !== DEFAULT_ALIGNMENT.lengthScale;

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `lumiere-${shape}-${polish.id}.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 0.92);
    link.click();
  };

  // Snapshots the composed look so the modal keeps showing it even while the
  // client keeps tweaking the canvas underneath.
  const openShare = () => {
    const canvas = canvasRef.current;
    setPreview(canvas ? canvas.toDataURL("image/jpeg", 0.85) : null);
    setShareOpen(true);
  };

  return (
    <Stage name="result" className="bg-porcelain">
      <header className="bg-porcelain/85 safe-top border-sand/70 sticky top-0 z-20 flex items-center justify-between border-b px-6 pb-4 backdrop-blur-xl">
        <button
          onClick={onBack}
          aria-label={t.back}
          className="border-sand text-mocha hover:border-champagne hover:text-espresso flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.25} />
        </button>
        <Eyebrow>{t.yourResult}</Eyebrow>
        <button
          onClick={openShare}
          aria-label={t.saveImage}
          className="border-sand text-mocha hover:border-champagne hover:text-espresso flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
        >
          <Download className="h-4 w-4" strokeWidth={1.25} />
        </button>
      </header>

      <div className="flex flex-col gap-7 pt-6 pb-16">
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
                  {t.match}
                </span>
              </span>
              {isRecommended ? (
                <span className="bg-espresso/85 text-porcelain rounded-full px-3 py-1.5 text-[0.5rem] tracking-[0.18em] uppercase backdrop-blur-md">
                  {t.stylistPick}
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
              {comparing ? t.bareHand : t.holdToCompare}
            </button>

            <button
              onClick={() => setFineTuneOpen((value) => !value)}
              aria-expanded={fineTuneOpen}
              aria-label={t.fineTuneAlignment}
              className={cx(
                "absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full px-3 py-2 text-[0.55rem] tracking-[0.16em] uppercase backdrop-blur-md transition-colors active:scale-95",
                fineTuneOpen || fineTuneTouched
                  ? "bg-espresso text-porcelain"
                  : "bg-porcelain/92 text-espresso",
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.25} />
              {t.align}
            </button>
          </div>

          {fineTuneOpen ? (
            <div className="animate-rise mt-3">
              <FineTunePanel
                language={language}
                alignment={alignment}
                onChange={setAlignment}
              />
            </div>
          ) : null}
        </section>

        <section className="flex flex-col items-center gap-3 px-8 text-center">
          <Eyebrow>
            {isRecommended ? t.recommendedShape : t.previewing}
          </Eyebrow>
          <h1 className="font-display text-espresso text-4xl leading-none font-light">
            {definition.name}
          </h1>
          <p className="text-mocha max-w-xs text-balance text-sm leading-relaxed font-light">
            {isRecommended
              ? t.shapeSummaries[shape]
              : t.offPickNote(NAIL_SHAPES[verdict.shape].name)}
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between px-6">
            <Eyebrow>{t.shape}</Eyebrow>
            <span className="text-mocha/70 text-[0.6rem] tracking-[0.16em] uppercase">
              {t.alsoSuitsYou}:{" "}
              {verdict.alternates.map((id) => NAIL_SHAPES[id].name).join(", ")}
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

        <ColorPicker
          language={language}
          selected={polish}
          onSelect={setPolish}
          skinTone={skinTone}
        />

        <section className="safe-bottom flex flex-col gap-3 px-6 pt-2">
          <PrimaryButton
            onClick={openShare}
            icon={<Download className="h-4 w-4" strokeWidth={1.25} />}
          >
            {t.saveThisLook}
          </PrimaryButton>
          <PrimaryButton
            onClick={onNextClient}
            icon={<UserRoundPlus className="h-4 w-4" strokeWidth={1.25} />}
          >
            {t.nextClient}
          </PrimaryButton>
          <GhostButton
            onClick={onRescan}
            icon={<Camera className="h-4 w-4" strokeWidth={1.25} />}
          >
            {t.scanAgain}
          </GhostButton>
        </section>
      </div>

      <ShareModal
        language={language}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        preview={preview}
        shape={shape}
        polish={polish}
        match={match}
        onDownload={save}
      />
    </Stage>
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

/**
 * A look shared by QR arrives as query parameters, so a client who scans the
 * salon's code lands on the same shape and shade the stylist was showing.
 */
function presetShape(): NailShapeId | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("shape");
  return value && NAIL_SHAPE_ORDER.includes(value as NailShapeId)
    ? (value as NailShapeId)
    : null;
}

function presetPolish(): Polish | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("polish");
  return POLISHES.find((polish) => polish.id === value) ?? null;
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
