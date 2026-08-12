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
import {
  Chip,
  IconButton,
  Label,
  OutlineButton,
  PrimaryButton,
  Stage,
  cx,
} from "./ui";

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
    link.download = `naillab-${shape}-${polish.id}.jpg`;
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
    <Stage name="result" className="bg-atelier">
      <header className="bg-atelier/90 safe-top border-hairline sticky top-0 z-20 flex items-center justify-between border-b px-6 pb-4 backdrop-blur-xl">
        <IconButton onClick={onBack} aria-label={t.back}>
          <ArrowLeft className="h-4 w-4" strokeWidth={1.25} />
        </IconButton>
        <Label className="text-charcoal/45">{t.yourResult}</Label>
        <IconButton onClick={openShare} aria-label={t.saveImage}>
          <Download className="h-4 w-4" strokeWidth={1.25} />
        </IconButton>
      </header>

      <div className="flex flex-col gap-9 pt-6 pb-16">
        <section className="relative px-6">
          {/* A hairline mat around the print, the way a proof sheet is framed. */}
          <div className="border-hairline rounded-sm border p-2">
            <div className="relative overflow-hidden">
              <NailCanvas
                result={result}
                shape={shape}
                polish={polish}
                alignment={alignment}
                bare={comparing}
                canvasRef={canvasRef}
              />

              <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                <span className="bg-atelier text-charcoal flex items-baseline gap-1.5 rounded-sm px-3 py-1.5">
                  <span className="font-display text-base leading-none">
                    {match}%
                  </span>
                  <span className="text-[0.55rem] font-medium tracking-[0.2em] uppercase">
                    {t.match}
                  </span>
                </span>
                {isRecommended ? (
                  <span className="bg-charcoal text-atelier rounded-sm px-3 py-1.5 text-[0.55rem] font-medium tracking-[0.2em] uppercase">
                    {t.stylistPick}
                  </span>
                ) : null}
              </div>

              <button
                onPointerDown={() => setComparing(true)}
                onPointerUp={() => setComparing(false)}
                onPointerLeave={() => setComparing(false)}
                onPointerCancel={() => setComparing(false)}
                className="bg-atelier text-charcoal absolute bottom-3 left-3 flex items-center gap-2 rounded-sm px-3 py-1.5 text-[0.55rem] font-medium tracking-[0.2em] uppercase"
              >
                <Eye className="h-3.5 w-3.5" strokeWidth={1.25} />
                {comparing ? t.bareHand : t.holdToCompare}
              </button>

              <button
                onClick={() => setFineTuneOpen((value) => !value)}
                aria-expanded={fineTuneOpen}
                aria-label={t.fineTuneAlignment}
                className={cx(
                  "absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-sm transition-colors",
                  fineTuneOpen || fineTuneTouched
                    ? "bg-charcoal text-atelier"
                    : "bg-atelier text-charcoal",
                )}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.25} />
              </button>
            </div>
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

        <section className="flex flex-col gap-3 px-6">
          <Label className="text-charcoal/45">
            {isRecommended ? t.recommendedShape : t.previewing}
          </Label>
          <h1 className="font-display text-charcoal text-[2.75rem] leading-none">
            {definition.name}
          </h1>
          <p className="text-charcoal/60 max-w-sm text-sm leading-relaxed font-light">
            {isRecommended
              ? t.shapeSummaries[shape]
              : t.offPickNote(NAIL_SHAPES[verdict.shape].name)}
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-4 px-6">
            <Label className="text-charcoal/45">{t.shape}</Label>
            <Label className="text-charcoal/35 truncate text-[0.6rem]">
              {t.alsoSuitsYou}:{" "}
              {verdict.alternates.map((id) => NAIL_SHAPES[id].name).join(", ")}
            </Label>
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-6">
            {NAIL_SHAPE_ORDER.map((id) => (
              <Chip
                key={id}
                active={id === shape}
                onClick={() => setShape(id)}
              >
                {NAIL_SHAPES[id].name}
                {id === verdict.shape ? " ·" : ""}
              </Chip>
            ))}
          </div>
        </section>

        <ColorPicker
          language={language}
          selected={polish}
          onSelect={setPolish}
          skinTone={skinTone}
        />

        <section className="safe-bottom border-hairline mx-6 flex flex-col gap-2.5 border-t pt-6">
          <PrimaryButton
            onClick={onNextClient}
            icon={<UserRoundPlus className="h-4 w-4" strokeWidth={1.25} />}
          >
            {t.nextClient}
          </PrimaryButton>
          <OutlineButton
            onClick={openShare}
            icon={<Download className="h-4 w-4" strokeWidth={1.25} />}
          >
            {t.saveThisLook}
          </OutlineButton>
          <button
            onClick={onRescan}
            className="text-charcoal/50 hover:text-charcoal flex items-center justify-center gap-2 py-2 text-xs font-medium tracking-[0.2em] uppercase transition-colors"
          >
            <Camera className="h-3.5 w-3.5" strokeWidth={1.25} />
            {t.scanAgain}
          </button>
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
