"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Download, Link2, Send, X } from "lucide-react";
import { copyFor, type Language } from "../_lib/i18n";
import { NAIL_SHAPES, type NailShapeId } from "../_lib/nail-shapes";
import { swatchBackground, type Polish } from "../_lib/palette";
import { IconButton, Label, OutlineButton, PrimaryButton, cx } from "./ui";

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
  const url = new URL("/app", window.location.origin);
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
        color: { dark: "#1a1817", light: "#fbf9f5" },
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
        className="bg-charcoal/40 absolute inset-0 backdrop-blur-sm"
      />

      <div className="animate-rise bg-atelier border-hairline relative z-10 flex max-h-[92dvh] w-full max-w-[26rem] flex-col overflow-y-auto rounded-t-sm border px-6 pt-6 pb-8 sm:rounded-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-charcoal/45">{t.shareSubtitle}</Label>
            <h2 className="font-display text-charcoal text-3xl leading-none">
              {t.shareTitle}
            </h2>
          </div>
          <IconButton ref={closeRef} onClick={onClose} aria-label={t.shareClose}>
            <X className="h-4 w-4" strokeWidth={1.25} />
          </IconButton>
        </div>

        <div className="border-hairline mt-6 flex gap-4 border-t pt-5">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              className="border-hairline h-24 w-24 shrink-0 rounded-sm border object-cover"
            />
          ) : (
            <div className="border-hairline h-24 w-24 shrink-0 rounded-sm border" />
          )}

          <div className="flex min-w-0 flex-col justify-center gap-3">
            <div className="flex flex-col gap-1">
              <Label className="text-charcoal/40 text-[0.55rem]">
                {t.shareShape}
              </Label>
              <span className="font-display text-charcoal text-xl leading-none">
                {NAIL_SHAPES[shape].name}
                <span className="text-charcoal/45 ml-2 text-xs">{match}%</span>
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-charcoal/40 text-[0.55rem]">
                {t.shareColour}
              </Label>
              <span className="flex items-center gap-2">
                <span
                  className="border-hairline h-4 w-4 shrink-0 rounded-sm border"
                  style={{ background: swatchBackground(polish) }}
                />
                <span className="text-charcoal truncate text-xs">
                  {polish.name}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="border-hairline mt-5 flex flex-col items-center gap-4 border-t pt-6">
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt={t.shareQrAlt} className="h-40 w-40" />
          ) : (
            <div className="border-hairline h-40 w-40 animate-pulse border" />
          )}
          <p className="text-charcoal/60 max-w-[17rem] text-center text-xs leading-relaxed font-light text-balance">
            {t.shareScanHint}
          </p>
        </div>

        <div className="mt-7 flex flex-col gap-2.5">
          <PrimaryButton
            onClick={onDownload}
            icon={<Download className="h-4 w-4" strokeWidth={1.25} />}
          >
            {t.shareDownload}
          </PrimaryButton>

          {canSend ? (
            <OutlineButton
              onClick={send}
              icon={<Send className="h-4 w-4" strokeWidth={1.25} />}
            >
              {t.shareSend}
            </OutlineButton>
          ) : null}

          <button
            onClick={copyLink}
            className={cx(
              "flex items-center justify-center gap-2 py-2 text-xs font-medium tracking-[0.2em] uppercase transition-colors",
              copied
                ? "text-charcoal"
                : "text-charcoal/50 hover:text-charcoal",
            )}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" strokeWidth={1.25} />
            ) : (
              <Link2 className="h-3.5 w-3.5" strokeWidth={1.25} />
            )}
            {copied ? t.shareLinkCopied : t.shareCopyLink}
          </button>
        </div>
      </div>
    </div>
  );
}
