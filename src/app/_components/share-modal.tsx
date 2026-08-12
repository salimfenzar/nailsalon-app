"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Download, Link2, Send, X } from "lucide-react";
import { copyFor, type Language } from "../_lib/i18n";
import { NAIL_SHAPES, type NailShapeId } from "../_lib/nail-shapes";
import { swatchBackground, type Polish } from "../_lib/palette";
import { Eyebrow, GhostButton, PrimaryButton, cx } from "./ui";

type ShareModalProps = {
  language: Language;
  open: boolean;
  onClose: () => void;
  /** The composed look, already rendered with the nails painted on. */
  preview: string | null;
  shape: NailShapeId;
  polish: Polish;
  match: number;
  onDownload: () => void;
};

/** A link that reopens this exact shape and shade on another device. */
function buildLookUrl(shape: NailShapeId, polish: Polish): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set("shape", shape);
  url.searchParams.set("polish", polish.id);
  return url.toString();
}

export function ShareModal({
  language,
  open,
  onClose,
  preview,
  shape,
  polish,
  match,
  onDownload,
}: ShareModalProps) {
  const t = copyFor(language);
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // The modal only ever mounts from a click, so `window` is available by then.
  const lookUrl = useMemo(
    () => (open ? buildLookUrl(shape, polish) : ""),
    [open, polish, shape],
  );

  useEffect(() => {
    if (!open || !lookUrl) return;
    let cancelled = false;

    void import("qrcode").then(async (mod) => {
      const dataUrl = await mod.toDataURL(lookUrl, {
        width: 480,
        margin: 1,
        color: { dark: "#4a3b32", light: "#faf7f4" },
      });
      if (!cancelled) setQr(dataUrl);
    });

    return () => {
      cancelled = true;
    };
  }, [lookUrl, open]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, open]);

  if (!open) return null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(lookUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const send = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title: t.shareTitle, url: lookUrl });
    } catch {
      // The client dismissed the sheet; nothing to recover from.
    }
  };

  const canSend = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.shareTitle}
      className="animate-fade fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    >
      <button
        aria-hidden
        tabIndex={-1}
        onClick={onClose}
        className="bg-ink/45 absolute inset-0 backdrop-blur-sm"
      />

      <div className="animate-rise bg-porcelain relative z-10 flex max-h-[92dvh] w-full max-w-[26rem] flex-col overflow-y-auto rounded-t-[2rem] px-6 pt-6 pb-8 shadow-[0_-20px_60px_-30px_rgba(33,26,21,0.6)] sm:rounded-[2rem]">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <Eyebrow>{t.shareSubtitle}</Eyebrow>
            <h2 className="font-display text-espresso text-3xl leading-none font-light">
              {t.shareTitle}
            </h2>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label={t.shareClose}
            className="border-sand text-mocha hover:border-champagne hover:text-espresso flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors"
          >
            <X className="h-4 w-4" strokeWidth={1.25} />
          </button>
        </div>

        <div className="border-sand mt-5 flex gap-4 rounded-2xl border p-3">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              className="border-sand h-24 w-24 shrink-0 rounded-xl border object-cover"
            />
          ) : (
            <div className="bg-linen h-24 w-24 shrink-0 rounded-xl" />
          )}

          <div className="flex min-w-0 flex-col justify-center gap-2.5">
            <div className="flex flex-col gap-0.5">
              <span className="text-mocha/70 text-[0.55rem] tracking-[0.18em] uppercase">
                {t.shareShape}
              </span>
              <span className="font-display text-espresso text-xl leading-none">
                {NAIL_SHAPES[shape].name}
                <span className="text-taupe ml-2 text-xs">{match}%</span>
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-mocha/70 text-[0.55rem] tracking-[0.18em] uppercase">
                {t.shareColour}
              </span>
              <span className="flex items-center gap-2">
                <span
                  className="border-porcelain h-4 w-4 shrink-0 rounded-full border shadow-[0_1px_4px_rgba(74,59,50,0.3)]"
                  style={{ background: swatchBackground(polish) }}
                />
                <span className="text-espresso truncate text-xs">
                  {polish.name}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center gap-3">
          <div className="border-sand bg-linen/40 rounded-2xl border p-3">
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qr}
                alt={t.shareQrAlt}
                className="h-36 w-36"
              />
            ) : (
              <div className="bg-sand/40 h-36 w-36 animate-pulse rounded-lg" />
            )}
          </div>
          <p className="text-mocha max-w-[17rem] text-balance text-center text-xs leading-relaxed font-light">
            {t.shareScanHint}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <PrimaryButton
            onClick={onDownload}
            icon={<Download className="h-4 w-4" strokeWidth={1.25} />}
          >
            {t.shareDownload}
          </PrimaryButton>

          {canSend ? (
            <GhostButton
              onClick={send}
              icon={<Send className="h-4 w-4" strokeWidth={1.25} />}
            >
              {t.shareSend}
            </GhostButton>
          ) : null}

          <GhostButton
            onClick={copyLink}
            icon={
              copied ? (
                <Check className="h-4 w-4" strokeWidth={1.25} />
              ) : (
                <Link2 className="h-4 w-4" strokeWidth={1.25} />
              )
            }
            className={cx(copied && "border-champagne text-espresso")}
          >
            {copied ? t.shareLinkCopied : t.shareCopyLink}
          </GhostButton>
        </div>
      </div>
    </div>
  );
}
