export type Undertone = "warm" | "cool" | "neutral";

export type Finish =
  | { kind: "creme" }
  | { kind: "sheer"; opacity: number }
  | { kind: "chrome"; tint: string }
  | { kind: "glazed"; pearl: string }
  | { kind: "french"; tip: string; depth: number }
  | { kind: "ombre"; to: string }
  | { kind: "aura"; glow: string }
  | { kind: "glitter"; flake: string; density: number }
  | { kind: "marble"; vein: string }
  | { kind: "cateye"; band: string };

export type CategoryId = "solid" | "chrome" | "french" | "trending";

export type Category = { id: CategoryId; label: string };

export const CATEGORIES: Category[] = [
  { id: "solid", label: "Solid Colors" },
  { id: "chrome", label: "Chrome & Glazed" },
  { id: "french", label: "French & Minimal" },
  { id: "trending", label: "Trending Designs" },
];

export type Polish = {
  id: string;
  name: string;
  category: CategoryId;
  base: string;
  finish: Finish;
  flatters: Undertone[];
  /** CSS background for the swatch button, when a flat colour won't do. */
  swatch?: string;
};

export const POLISHES: Polish[] = [
  // Solid Colors
  {
    id: "bare-silk",
    name: "Bare Silk",
    category: "solid",
    base: "#e6d2c4",
    finish: { kind: "creme" },
    flatters: ["warm", "neutral"],
  },
  {
    id: "ballet-blush",
    name: "Ballet Blush",
    category: "solid",
    base: "#f0d9d6",
    finish: { kind: "creme" },
    flatters: ["cool", "neutral"],
  },
  {
    id: "cafe-creme",
    name: "Café Crème",
    category: "solid",
    base: "#c39a7c",
    finish: { kind: "creme" },
    flatters: ["warm"],
  },
  {
    id: "rosewater",
    name: "Rosewater",
    category: "solid",
    base: "#dfaaa6",
    finish: { kind: "creme" },
    flatters: ["cool"],
  },
  {
    id: "terracotta",
    name: "Terracotta Noir",
    category: "solid",
    base: "#9b5744",
    finish: { kind: "creme" },
    flatters: ["warm"],
  },
  {
    id: "bordeaux",
    name: "Bordeaux",
    category: "solid",
    base: "#6b2032",
    finish: { kind: "creme" },
    flatters: ["cool", "neutral"],
  },
  {
    id: "espresso",
    name: "Espresso",
    category: "solid",
    base: "#4a342b",
    finish: { kind: "creme" },
    flatters: ["warm", "neutral"],
  },
  {
    id: "noir",
    name: "Noir Absolu",
    category: "solid",
    base: "#1b1719",
    finish: { kind: "creme" },
    flatters: ["cool", "neutral"],
  },

  // Chrome & Glazed
  {
    id: "pearl-glaze",
    name: "Pearl Glaze",
    category: "chrome",
    base: "#e9dcd6",
    finish: { kind: "glazed", pearl: "#fdf6ef" },
    flatters: ["warm", "cool", "neutral"],
    swatch: "linear-gradient(135deg,#f7ece5,#e0cdc4 60%,#f4e6dd)",
  },
  {
    id: "champagne-chrome",
    name: "Champagne Chrome",
    category: "chrome",
    base: "#d3b78f",
    finish: { kind: "chrome", tint: "#fff3d6" },
    flatters: ["warm"],
    swatch: "linear-gradient(135deg,#f6e6c4,#c2a273 55%,#f1dfba)",
  },
  {
    id: "silver-mirror",
    name: "Silver Mirror",
    category: "chrome",
    base: "#c3c9d1",
    finish: { kind: "chrome", tint: "#ffffff" },
    flatters: ["cool"],
    swatch: "linear-gradient(135deg,#eef1f5,#a8b0ba 55%,#e3e8ee)",
  },
  {
    id: "rose-chrome",
    name: "Rose Chrome",
    category: "chrome",
    base: "#d7a3a0",
    finish: { kind: "chrome", tint: "#ffe4e0" },
    flatters: ["cool", "neutral"],
    swatch: "linear-gradient(135deg,#f6dcd8,#c78d8a 55%,#efd0cb)",
  },
  {
    id: "lilac-aura",
    name: "Lilac Aura",
    category: "chrome",
    base: "#bfb2d6",
    finish: { kind: "chrome", tint: "#f0e9ff" },
    flatters: ["cool"],
    swatch: "linear-gradient(135deg,#e8e0f6,#a596c2 55%,#ded3f0)",
  },
  {
    id: "mocha-chrome",
    name: "Mocha Chrome",
    category: "chrome",
    base: "#a5876f",
    finish: { kind: "chrome", tint: "#f5dfc6" },
    flatters: ["warm", "neutral"],
    swatch: "linear-gradient(135deg,#e0c6ad,#8b6d57 55%,#d6bda3)",
  },
  {
    id: "iced-vanilla",
    name: "Iced Vanilla",
    category: "chrome",
    base: "#f0e5d7",
    finish: { kind: "glazed", pearl: "#ffffff" },
    flatters: ["warm", "neutral"],
    swatch: "linear-gradient(135deg,#fffaf0,#e4d5c1 60%,#fbf3e6)",
  },

  // French & Minimal
  {
    id: "classic-french",
    name: "Classic French",
    category: "french",
    base: "#ead2c6",
    finish: { kind: "french", tip: "#fffdfb", depth: 0.24 },
    flatters: ["warm", "cool", "neutral"],
    swatch: "linear-gradient(180deg,#ead2c6 60%,#fffdfb 60%)",
  },
  {
    id: "micro-french",
    name: "Micro French",
    category: "french",
    base: "#e8d0c4",
    finish: { kind: "french", tip: "#ffffff", depth: 0.11 },
    flatters: ["warm", "cool", "neutral"],
    swatch: "linear-gradient(180deg,#e8d0c4 78%,#ffffff 78%)",
  },
  {
    id: "cocoa-french",
    name: "Cocoa French",
    category: "french",
    base: "#eedcd1",
    finish: { kind: "french", tip: "#77543f", depth: 0.2 },
    flatters: ["warm"],
    swatch: "linear-gradient(180deg,#eedcd1 62%,#77543f 62%)",
  },
  {
    id: "milky-white",
    name: "Milky White",
    category: "french",
    base: "#f6eee8",
    finish: { kind: "sheer", opacity: 0.78 },
    flatters: ["warm", "cool", "neutral"],
  },
  {
    id: "baby-boomer",
    name: "Baby Boomer",
    category: "french",
    base: "#e7cec2",
    finish: { kind: "ombre", to: "#fffaf6" },
    flatters: ["warm", "neutral"],
    swatch: "linear-gradient(180deg,#e7cec2,#fffaf6)",
  },
  {
    id: "bare-gloss",
    name: "Bare Gloss",
    category: "french",
    base: "#ecd9cd",
    finish: { kind: "sheer", opacity: 0.55 },
    flatters: ["warm", "cool", "neutral"],
  },

  // Trending Designs
  {
    id: "glazed-donut",
    name: "Glazed Donut",
    category: "trending",
    base: "#e7d5cd",
    finish: { kind: "glazed", pearl: "#fff8f2" },
    flatters: ["warm", "cool", "neutral"],
    swatch: "linear-gradient(135deg,#f9ece4,#dcc4b8 55%,#fdf5ef)",
  },
  {
    id: "chrome-ombre",
    name: "Chrome Ombré",
    category: "trending",
    base: "#d3b78f",
    finish: { kind: "ombre", to: "#8a6a4c" },
    flatters: ["warm"],
    swatch: "linear-gradient(180deg,#e3c9a4,#8a6a4c)",
  },
  {
    id: "velvet-cateye",
    name: "Velvet Cat-Eye",
    category: "trending",
    base: "#3b4a6b",
    finish: { kind: "cateye", band: "#b9c6e6" },
    flatters: ["cool"],
    swatch: "linear-gradient(120deg,#2c3852,#9fb0d8 50%,#2c3852)",
  },
  {
    id: "marble-mocha",
    name: "Marble Mocha",
    category: "trending",
    base: "#e8dbcf",
    finish: { kind: "marble", vein: "#9d7f66" },
    flatters: ["warm", "neutral"],
    swatch: "linear-gradient(115deg,#efe4d9,#c7ab93 45%,#efe4d9)",
  },
  {
    id: "sugar-glitter",
    name: "Sugar Glitter",
    category: "trending",
    base: "#e9cfc7",
    finish: { kind: "glitter", flake: "#fff3e2", density: 1 },
    flatters: ["warm", "neutral"],
    swatch: "radial-gradient(circle at 30% 30%,#fff6ec,#e0bfb4)",
  },
  {
    id: "aura-blush",
    name: "Aura Blush",
    category: "trending",
    base: "#e2c3c6",
    finish: { kind: "aura", glow: "#fff0f3" },
    flatters: ["cool", "neutral"],
    swatch: "radial-gradient(circle at 50% 65%,#fff1f3,#cf9ea4)",
  },
  {
    id: "midnight-chrome",
    name: "Midnight Chrome",
    category: "trending",
    base: "#2b3140",
    finish: { kind: "chrome", tint: "#9fb2d4" },
    flatters: ["cool"],
    swatch: "linear-gradient(135deg,#586a8c,#20242f 55%,#4a5a7a)",
  },
];

export const DEFAULT_POLISH_ID = "bare-silk";

export function polishById(id: string): Polish {
  return POLISHES.find((p) => p.id === id) ?? POLISHES[0];
}

export function swatchBackground(polish: Polish): string {
  return polish.swatch ?? polish.base;
}

export type Rgb = { r: number; g: number; b: number };

export function hexToRgb(hex: string): Rgb {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  const int = Number.parseInt(full, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

export function rgbToCss({ r, g, b }: Rgb, alpha = 1): string {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
}

export function mixHex(a: string, b: string, t: number): Rgb {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return {
    r: ca.r + (cb.r - ca.r) * t,
    g: ca.g + (cb.g - ca.g) * t,
    b: ca.b + (cb.b - ca.b) * t,
  };
}

export function lighten(hex: string, t: number): string {
  return rgbToCss(mixHex(hex, "#ffffff", t));
}

export function darken(hex: string, t: number): string {
  return rgbToCss(mixHex(hex, "#000000", t));
}

export function withAlpha(hex: string, alpha: number): string {
  return rgbToCss(hexToRgb(hex), alpha);
}

export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
