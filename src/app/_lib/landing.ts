import type { Language } from "./i18n";

export type LandingCopy = {
  ticker: string;
  rating: string;
  headline: string;
  subtitle: string;
  primaryCta: string;
  studioLink: string;
  navDemo: string;
  language: string;
  checks: string[];
  matchBadge: string;
  scanBadge: string;
  stepsEyebrow: string;
  stepsTitle: string;
  stepsSubtitle: string;
  steps: Array<{
    index: string;
    title: string;
    body: string;
    image: string;
    alt: string;
  }>;
  pillarsEyebrow: string;
  pillars: Array<{ index: string; title: string; body: string }>;
  footerEyebrow: string;
  footerHeadline: string;
  footerBody: string;
  footerPrimary: string;
  footerSecondary: string;
  copyright: string;
};

const NL: LandingCopy = {
  ticker: "✨ NIEUW: NAILLAB STUDIO  •  REAL-TIME AI HANDANALYSIS",
  rating: "✨ Next-Gen AI Hand Mapping",
  headline: "NailLab Studio",
  subtitle: "De Vorm & Kleur van je Droomnagels. Direct in AR.",
  primaryCta: "Probeer Demo Live",
  studioLink: "Bekijk de Studio →",
  navDemo: "Live demo",
  language: "Taal",
  checks: [
    "Direct Vorm- & Kleuradvies",
    "Real-time AR",
    "Geen App Nodig",
    "QR Export",
  ],
  matchBadge: "97% Match",
  scanBadge: "5sec AI Scan",
  stepsEyebrow: "De flow",
  stepsTitle: "In slechts 3 stappen",
  stepsSubtitle: "Van scan tot meeneemadvies, aan de stoel.",
  steps: [
    {
      index: "01",
      title: "Live Hand Scan",
      body: "AI hand-mapping in real time.",
      image: "/screenshots/homepagess.png",
      alt: "NailLab Studio startscherm voor de live handscan",
    },
    {
      index: "02",
      title: "Instant Advies & Match",
      body: "Vorm, proportie en kleur op de eigen hand.",
      image: "/screenshots/resultscreen.png",
      alt: "Resultaatscherm met aanbevolen nagelvorm en kleuren",
    },
    {
      index: "03",
      title: "Bewaar & Neem Mee",
      body: "QR-export naar de telefoon van de klant.",
      image: "/screenshots/sharescreen.png",
      alt: "Deelmodal met QR-code van de gekozen look",
    },
  ],
  pillarsEyebrow: "Waarom NailLab",
  pillars: [
    {
      index: "01",
      title: "Snellere Consultaties",
      body: "Voorkom twijfels aan de stoel en bespaar 5-10 minuten per klant.",
    },
    {
      index: "02",
      title: "Virtuele Kleurstudio",
      body: "Klanten zien hun droomnagels en -kleur live op hun eigen hand voor de behandeling.",
    },
    {
      index: "03",
      title: "QR-Code Export",
      body: "Klanten nemen hun persoonlijke adviesprofiel direct mee op hun eigen telefoon.",
    },
  ],
  footerEyebrow: "Voor salonhouders",
  footerHeadline: "Zet NailLab aan de stoel.",
  footerBody:
    "Probeer de live demo, of vraag een abonnement aan voor jouw salon.",
  footerPrimary: "Probeer Demo Live",
  footerSecondary: "Vraag salonabonnement",
  copyright: "NailLab Studio",
};

const EN: LandingCopy = {
  ticker: "✨ NEW: NAILLAB STUDIO  •  REAL-TIME AI HAND ANALYSIS",
  rating: "✨ Next-Gen AI Hand Mapping",
  headline: "NailLab Studio",
  subtitle: "The shape and colour of your dream nails. Instantly, in AR.",
  primaryCta: "Try Live Demo",
  studioLink: "View the Studio →",
  navDemo: "Live demo",
  language: "Language",
  checks: [
    "Instant shape & colour advice",
    "Real-time AR",
    "No app required",
    "QR export",
  ],
  matchBadge: "97% Match",
  scanBadge: "5sec AI Scan",
  stepsEyebrow: "The flow",
  stepsTitle: "In only 3 steps",
  stepsSubtitle: "From scan to takeaway advice, at the chair.",
  steps: [
    {
      index: "01",
      title: "Live Hand Scan",
      body: "AI hand-mapping in real time.",
      image: "/screenshots/homepagess.png",
      alt: "NailLab Studio start screen for the live hand scan",
    },
    {
      index: "02",
      title: "Instant Advice & Match",
      body: "Shape, proportion and colour on their own hand.",
      image: "/screenshots/resultscreen.png",
      alt: "Result screen with recommended nail shape and colours",
    },
    {
      index: "03",
      title: "Save & Take Away",
      body: "QR export to the client’s phone.",
      image: "/screenshots/sharescreen.png",
      alt: "Share modal with a QR code of the chosen look",
    },
  ],
  pillarsEyebrow: "Why NailLab",
  pillars: [
    {
      index: "01",
      title: "Faster Consultations",
      body: "Remove indecision at the chair and save 5–10 minutes per client.",
    },
    {
      index: "02",
      title: "Virtual Colour Studio",
      body: "Clients see their dream nails and colour live on their own hand before treatment.",
    },
    {
      index: "03",
      title: "QR-Code Export",
      body: "Clients take their personal advice profile with them on their own phone.",
    },
  ],
  footerEyebrow: "For salon owners",
  footerHeadline: "Put NailLab at the chair.",
  footerBody: "Try the live demo, or request a subscription for your salon.",
  footerPrimary: "Try Live Demo",
  footerSecondary: "Request salon access",
  copyright: "NailLab Studio",
};

export const LANDING: Record<Language, LandingCopy> = { nl: NL, en: EN };

export function scannerHref(language: Language): string {
  return `/app?lang=${language}&start=scan`;
}

export function studioHref(language: Language): string {
  return `/app?lang=${language}`;
}

export const SALON_MAIL =
  "mailto:?subject=NailLab%20Studio%20salonabonnement&body=Ik%20wil%20graag%20meer%20weten%20over%20een%20salonabonnement%20voor%20NailLab%20Studio.";
