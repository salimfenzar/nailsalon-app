"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import {
  LANDING,
  SALON_MAIL,
  scannerHref,
  studioHref,
  type LandingCopy,
} from "../_lib/landing";
import type { Language } from "../_lib/i18n";
import { Label, OutlineAnchor, Wordmark, cx } from "./ui";

export function LandingPage() {
  const [language, setLanguage] = useState<Language>("nl");
  const t = LANDING[language];
  const demo = scannerHref(language);
  const studio = studioHref(language);

  return (
    <div className="bg-atelier text-charcoal flex min-h-dvh flex-col">
      <Ticker text={t.ticker} href={demo} />

      <div className="from-lilac-soft via-lilac to-atelier bg-linear-to-b">
        <header className="px-4 pt-4 md:px-8">
          <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full bg-white/80 px-5 py-3 shadow-[0_8px_30px_-18px_rgba(109,78,155,0.45)] backdrop-blur-md md:px-8">
            <Link href="/" aria-label="NailLab Studio">
              <Wordmark size="sm" align="start" />
            </Link>
            <div className="flex items-center gap-5 sm:gap-7">
              <LanguageToggle
                language={language}
                onChange={setLanguage}
                label={t.language}
              />
              <Link
                href={demo}
                className="text-charcoal/55 hover:text-charcoal hidden text-xs font-medium tracking-[0.2em] uppercase sm:inline"
              >
                {t.navDemo}
              </Link>
            </div>
          </nav>
        </header>

        <Hero t={t} demo={demo} studio={studio} />
      </div>

      <StepsGallery t={t} />
      <Pillars t={t} />
      <SalonCta t={t} demo={demo} />

      <footer className="border-hairline border-t bg-white">
        <div className="text-charcoal/40 mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10">
          <Label className="text-charcoal/40 text-[0.6rem]">{t.copyright}</Label>
          <Label className="text-charcoal/35 text-[0.6rem]">
            NailLab Studio
          </Label>
        </div>
      </footer>
    </div>
  );
}

function Ticker({ text, href }: { text: string; href: string }) {
  const segment = `${text}   •   `;

  return (
    <Link
      href={href}
      className="group bg-violet text-atelier block overflow-hidden py-2.5"
    >
      <div className="animate-marquee group-hover:[animation-play-state:paused] flex w-max will-change-transform">
        <span className="px-6 text-[0.65rem] font-medium tracking-widest uppercase">
          {segment.repeat(3)}
        </span>
        <span
          className="px-6 text-[0.65rem] font-medium tracking-widest uppercase"
          aria-hidden
        >
          {segment.repeat(3)}
        </span>
      </div>
    </Link>
  );
}

function Hero({
  t,
  demo,
  studio,
}: {
  t: LandingCopy;
  demo: string;
  studio: string;
}) {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-14 md:px-10 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
      <div className="flex flex-col items-start">
        <span className="text-violet inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-1.5 text-[0.7rem] font-medium tracking-[0.04em]">
          <span className="bg-violet/10 flex h-5 w-5 items-center justify-center rounded-full">
            <Sparkles className="h-3 w-3" strokeWidth={1.5} />
          </span>
          {t.rating}
        </span>

        <h1 className="font-display text-charcoal mt-6 text-[2.7rem] leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-[3.35rem]">
          {t.headline}
        </h1>

        <p className="text-charcoal/60 mt-5 max-w-md text-base leading-relaxed font-light sm:text-lg">
          {t.subtitle}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-5">
          <Link
            href={demo}
            className="text-charcoal rounded-full bg-white px-8 py-3.5 text-xs font-medium tracking-[0.18em] uppercase shadow-[0_12px_30px_-16px_rgba(26,24,23,0.45)] transition-transform hover:scale-[1.02]"
          >
            {t.primaryCta}
          </Link>
          <Link
            href={studio}
            className="text-charcoal/70 hover:text-charcoal text-sm font-medium"
          >
            {t.studioLink}
          </Link>
        </div>

        <ul className="mt-10 grid w-full max-w-md grid-cols-1 gap-x-8 gap-y-3.5 sm:grid-cols-2">
          {t.checks.map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-sm">
              <span className="bg-violet flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                <Check className="text-atelier h-3 w-3" strokeWidth={2.5} />
              </span>
              <span className="text-charcoal/75">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mx-auto w-full max-w-[22rem] lg:max-w-none">
        <div className="relative rounded-[2rem] bg-white/70 p-4 shadow-[0_30px_60px_-28px_rgba(109,78,155,0.45)] backdrop-blur-sm sm:p-5">
          <PhoneFrame
            src="/screenshots/resultscreen.png"
            alt={t.steps[1].alt}
            priority
          />

          <span className="bg-violet text-atelier absolute top-[18%] -left-3 rounded-full px-3.5 py-2 text-[0.65rem] font-medium tracking-[0.14em] uppercase shadow-[0_10px_24px_-12px_rgba(109,78,155,0.8)] sm:-left-6">
            {t.scanBadge}
          </span>
          <span className="text-violet absolute top-[42%] -right-2 flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white/80 text-center shadow-[0_12px_28px_-14px_rgba(109,78,155,0.55)] backdrop-blur-md sm:-right-4 sm:h-28 sm:w-28">
            <span className="font-display text-2xl leading-none sm:text-3xl">
              97%
            </span>
            <span className="mt-1 text-[0.55rem] font-medium tracking-[0.16em] uppercase">
              {t.matchBadge.replace("97% ", "")}
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}

function StepsGallery({ t }: { t: LandingCopy }) {
  return (
    <section className="bg-white px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <Label className="text-charcoal/45">{t.stepsEyebrow}</Label>
          <h2 className="font-display text-charcoal mt-4 text-4xl leading-tight font-semibold sm:text-5xl">
            {t.stepsTitle}
          </h2>
          <p className="text-charcoal/55 mt-3 max-w-md text-sm font-light sm:text-base">
            {t.stepsSubtitle}
          </p>
        </div>

        <ol className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {t.steps.map((step) => (
            <li key={step.index} className="flex flex-col items-center">
              <PhoneFrame src={step.image} alt={step.alt} />
              <div className="mt-6 flex flex-col items-center gap-2 text-center">
                <Label className="text-violet/70">{step.index}</Label>
                <h3 className="font-display text-charcoal text-2xl">
                  {step.title}
                </h3>
                <p className="text-charcoal/55 max-w-[16rem] text-sm font-light">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PhoneFrame({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="border-charcoal w-full max-w-[17rem] overflow-hidden rounded-[2rem] border-[6px] bg-black shadow-[0_24px_50px_-28px_rgba(26,24,23,0.55)]">
      <div className="relative aspect-[9/19] w-full">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 768px) 280px, 70vw"
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}

function Pillars({ t }: { t: LandingCopy }) {
  return (
    <section className="border-hairline border-t px-6 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-6xl">
        <Label className="text-charcoal/45">{t.pillarsEyebrow}</Label>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3">
          {t.pillars.map((pillar, index) => (
            <article
              key={pillar.index}
              className={cx(
                "border-hairline flex flex-col gap-4 py-8 md:px-8 md:py-0",
                index === 0
                  ? "pt-0 md:pl-0"
                  : "border-t md:border-t-0 md:border-l",
                index === t.pillars.length - 1 && "md:pr-0",
              )}
            >
              <Label className="text-charcoal/35">{pillar.index}</Label>
              <h2 className="font-display text-charcoal text-3xl leading-tight">
                {pillar.title}
              </h2>
              <p className="text-charcoal/60 max-w-xs text-sm leading-relaxed font-light">
                {pillar.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SalonCta({ t, demo }: { t: LandingCopy; demo: string }) {
  return (
    <section className="from-lilac-soft to-atelier border-hairline border-t bg-linear-to-b px-6 py-16 md:px-10 md:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Label className="text-charcoal/45">{t.footerEyebrow}</Label>
        <h2 className="font-display text-charcoal max-w-xl text-4xl leading-tight font-semibold sm:text-5xl">
          {t.footerHeadline}
        </h2>
        <p className="text-charcoal/60 max-w-md text-base leading-relaxed font-light">
          {t.footerBody}
        </p>
        <div className="mt-2 flex w-full flex-wrap items-center gap-4">
          <Link
            href={demo}
            className="bg-charcoal text-atelier inline-flex rounded-full px-8 py-3.5 text-xs font-medium tracking-[0.18em] uppercase"
          >
            {t.footerPrimary}
          </Link>
          <OutlineAnchor href={SALON_MAIL} className="w-full rounded-full sm:w-auto">
            {t.footerSecondary}
          </OutlineAnchor>
        </div>
      </div>
    </section>
  );
}

function LanguageToggle({
  language,
  onChange,
  label,
}: {
  language: Language;
  onChange: (language: Language) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3" aria-label={label}>
      {(["nl", "en"] as const).map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cx(
            "text-xs font-medium tracking-[0.2em] uppercase transition-colors",
            language === id
              ? "text-charcoal"
              : "text-charcoal/35 hover:text-charcoal",
          )}
        >
          {id}
        </button>
      ))}
    </div>
  );
}
