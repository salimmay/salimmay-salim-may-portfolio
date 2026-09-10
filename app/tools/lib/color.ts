/**
 * Pure color conversion and WCAG accessibility contrast utilities.
 *
 * Runs anywhere — Node, browser, Web Worker — zero DOM or external dependencies.
 * Used by Colour Converter and Contrast Checker tools.
 */

export type RGB = { r: number; g: number; b: number; a?: number };
export type HSL = { h: number; s: number; l: number; a?: number };
export type OKLCH = { l: number; c: number; h: number; a?: number };

/** Clamps a number between min and max */
export const clamp = (val: number, min: number, max: number): number =>
  Math.min(Math.max(val, min), max);

/** Parses 3, 4, 6, or 8-digit hex strings into an RGB object */
export function parseHex(hex: string): RGB | null {
  const clean = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]+$/.test(clean)) return null;

  if (clean.length === 3) {
    const [r, g, b] = clean.split("").map((c) => parseInt(c + c, 16));
    return { r, g, b, a: 1 };
  }
  if (clean.length === 4) {
    const [r, g, b, a] = clean.split("").map((c) => parseInt(c + c, 16));
    return { r, g, b, a: Number((a / 255).toFixed(3)) };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return { r, g, b, a: 1 };
  }
  if (clean.length === 8) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    const a = parseInt(clean.slice(6, 8), 16);
    return { r, g, b, a: Number((a / 255).toFixed(3)) };
  }

  return null;
}

/** Formats RGB values to 6 or 8-digit hex string */
export function rgbToHex({ r, g, b, a = 1 }: RGB): string {
  const toHex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  const base = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  if (a !== undefined && a < 1) {
    const alphaHex = clamp(Math.round(a * 255), 0, 255).toString(16).padStart(2, "0");
    return `${base}${alphaHex}`;
  }
  return base;
}

/** Converts RGB (0-255) to HSL (h: 0-360, s: 0-100, l: 0-100) */
export function rgbToHsl({ r, g, b, a = 1 }: RGB): HSL {
  const rNorm = clamp(r, 0, 255) / 255;
  const gNorm = clamp(g, 0, 255) / 255;
  const bNorm = clamp(b, 0, 255) / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) * 60;
        break;
      case gNorm:
        h = ((bNorm - rNorm) / delta + 2) * 60;
        break;
      case bNorm:
        h = ((rNorm - gNorm) / delta + 4) * 60;
        break;
    }
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a,
  };
}

/** Converts HSL to RGB */
export function hslToRgb({ h, s, l, a = 1 }: HSL): RGB {
  const hDeg = ((h % 360) + 360) % 360;
  const sNorm = clamp(s, 0, 100) / 100;
  const lNorm = clamp(l, 0, 100) / 100;

  if (sNorm === 0) {
    const val = Math.round(lNorm * 255);
    return { r: val, g: val, b: val, a };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tAdj = t;
    if (tAdj < 0) tAdj += 1;
    if (tAdj > 1) tAdj -= 1;
    if (tAdj < 1 / 6) return p + (q - p) * 6 * tAdj;
    if (tAdj < 1 / 2) return q;
    if (tAdj < 2 / 3) return p + (q - p) * (2 / 3 - tAdj) * 6;
    return p;
  };

  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;

  const r = Math.round(hue2rgb(p, q, hDeg / 360 + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, hDeg / 360) * 255);
  const b = Math.round(hue2rgb(p, q, hDeg / 360 - 1 / 3) * 255);

  return { r, g, b, a };
}

/**
 * Converts sRGB to OKLCH per CSS Color 4 specification.
 * sRGB -> Linear sRGB -> OKLab -> OKLCH
 */
export function rgbToOklch({ r, g, b, a = 1 }: RGB): OKLCH {
  const toLinear = (c: number) => {
    const norm = clamp(c, 0, 255) / 255;
    return norm <= 0.04045 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
  };

  const rLin = toLinear(r);
  const gLin = toLinear(g);
  const bLin = toLinear(b);

  // sRGB to LMS
  const l = 0.4122214708 * rLin + 0.5363325363 * gLin + 0.0514459929 * bLin;
  const m = 0.2119034982 * rLin + 0.6806995451 * gLin + 0.1073969566 * bLin;
  const s = 0.0883024619 * rLin + 0.2817188376 * gLin + 0.6299787005 * bLin;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  // LMS to OKLab
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const oklabA = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const oklabB = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  // OKLab to OKLCH
  const C = Math.sqrt(oklabA * oklabA + oklabB * oklabB);
  let h = (Math.atan2(oklabB, oklabA) * 180) / Math.PI;
  if (h < 0) h += 360;

  return {
    l: Number(L.toFixed(4)),
    c: Number(C.toFixed(4)),
    h: Number(h.toFixed(1)),
    a,
  };
}

/**
 * Converts OKLCH to sRGB per CSS Color 4 specification.
 */
export function oklchToRgb({ l, c, h, a = 1 }: OKLCH): RGB {
  const hRad = ((h % 360) * Math.PI) / 180;
  const aLab = c * Math.cos(hRad);
  const bLab = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * aLab + 0.2158037573 * bLab;
  const m_ = l - 0.1055613458 * aLab - 0.0638541728 * bLab;
  const s_ = l - 0.0894841775 * aLab - 1.291485548 * bLab;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const rLin = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  const toSrgb = (x: number) => {
    const val = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(Math.max(0, x), 1 / 2.4) - 0.055;
    return clamp(Math.round(val * 255), 0, 255);
  };

  return {
    r: toSrgb(rLin),
    g: toSrgb(gLin),
    b: toSrgb(bLin),
    a,
  };
}

/** Parses RGB/RGBA notation (both legacy comma and CSS Color 4 slash syntax) */
export function parseRgbString(input: string): RGB | null {
  const trimmed = input.trim();
  // Comma or space separated: rgb(255, 255, 255) or rgb(255 255 255 / 0.5)
  const match = trimmed.match(
    /^rgba?\s*\(\s*(\d{1,3}%?)\s*[, ]\s*(\d{1,3}%?)\s*[, ]\s*(\d{1,3}%?)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i
  );
  if (!match) return null;

  const parseChan = (str: string) => {
    if (str.endsWith("%")) {
      return clamp(Math.round((parseFloat(str) / 100) * 255), 0, 255);
    }
    return clamp(parseInt(str, 10), 0, 255);
  };

  const parseAlpha = (str?: string) => {
    if (!str) return 1;
    if (str.endsWith("%")) return clamp(parseFloat(str) / 100, 0, 1);
    return clamp(parseFloat(str), 0, 1);
  };

  return {
    r: parseChan(match[1]),
    g: parseChan(match[2]),
    b: parseChan(match[3]),
    a: parseAlpha(match[4]),
  };
}

/** Parses HSL/HSLA notation */
export function parseHslString(input: string): HSL | null {
  const trimmed = input.trim();
  const match = trimmed.match(
    /^hsla?\s*\(\s*(\d{1,3}(?:\.\d+)?(?:deg)?)\s*[, ]\s*(\d{1,3}(?:\.\d+)?)%\s*[, ]\s*(\d{1,3}(?:\.\d+)?)%(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i
  );
  if (!match) return null;

  const h = parseFloat(match[1]);
  const s = clamp(parseFloat(match[2]), 0, 100);
  const l = clamp(parseFloat(match[3]), 0, 100);
  let a = 1;
  if (match[4]) {
    a = match[4].endsWith("%") ? clamp(parseFloat(match[4]) / 100, 0, 1) : clamp(parseFloat(match[4]), 0, 1);
  }

  return { h: Math.round(h), s: Math.round(s), l: Math.round(l), a };
}

/** Parses OKLCH notation: oklch(L C H [/ A]) where L can be percentage or decimal */
export function parseOklchString(input: string): OKLCH | null {
  const trimmed = input.trim();
  const match = trimmed.match(
    /^oklch\s*\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:\s*[/,]\s*([\d.]+%?))?\s*\)$/i
  );
  if (!match) return null;

  let l = parseFloat(match[1]);
  if (match[1].endsWith("%")) l = l / 100;
  l = clamp(l, 0, 1);

  const c = Math.max(0, parseFloat(match[2]));
  const h = ((parseFloat(match[3]) % 360) + 360) % 360;

  let a = 1;
  if (match[4]) {
    a = match[4].endsWith("%") ? clamp(parseFloat(match[4]) / 100, 0, 1) : clamp(parseFloat(match[4]), 0, 1);
  }

  return {
    l: Number(l.toFixed(4)),
    c: Number(c.toFixed(4)),
    h: Number(h.toFixed(1)),
    a,
  };
}

/** Format RGB object to CSS string */
export function formatRgb({ r, g, b, a = 1 }: RGB): string {
  if (a < 1) return `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(2))})`;
  return `rgb(${r}, ${g}, ${b})`;
}

/** Format HSL object to CSS string */
export function formatHsl({ h, s, l, a = 1 }: HSL): string {
  if (a < 1) return `hsla(${h}, ${s}%, ${l}%, ${Number(a.toFixed(2))})`;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

/** Format OKLCH object to CSS string */
export function formatOklch({ l, c, h, a = 1 }: OKLCH): string {
  if (a < 1) return `oklch(${l} ${c} ${h} / ${Number(a.toFixed(2))})`;
  return `oklch(${l} ${c} ${h})`;
}

/** Parse any CSS color string into RGB (supports hex, rgb, rgba, hsl, hsla, oklch) */
export function parseColor(input: string): RGB | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Hex
  if (trimmed.startsWith("#") || /^[0-9a-fA-F]{3,8}$/.test(trimmed)) {
    return parseHex(trimmed);
  }

  // oklch
  if (/^oklch/i.test(trimmed)) {
    const oklch = parseOklchString(trimmed);
    if (oklch) return oklchToRgb(oklch);
  }

  // rgb/rgba
  if (/^rgba?/i.test(trimmed)) {
    return parseRgbString(trimmed);
  }

  // hsl/hsla
  if (/^hsla?/i.test(trimmed)) {
    const hsl = parseHslString(trimmed);
    if (hsl) return hslToRgb(hsl);
  }

  return null;
}

// ── WCAG Accessibility ──────────────────────────────────────────────────────

/**
 * Calculates WCAG 2.1 relative luminance for an sRGB colour (0 to 1).
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
export function relativeLuminance(rgb: RGB): number {
  const toLinear = (c: number) => {
    const s = clamp(c, 0, 255) / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  const rLin = toLinear(rgb.r);
  const gLin = toLinear(rgb.g);
  const bLin = toLinear(rgb.b);

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Calculates contrast ratio between two colors (1:1 to 21:1).
 * https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 */
export function contrastRatio(color1: RGB, color2: RGB): number {
  const l1 = relativeLuminance(color1);
  const l2 = relativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Number(ratio.toFixed(2));
}

export type WcagCriterion = {
  name: string;
  level: "AA" | "AAA";
  requiredRatio: number;
  passed: boolean;
  notes: string;
};

export type WcagRating = {
  ratio: number;
  normalTextAA: boolean; // >= 4.5:1
  normalTextAAA: boolean; // >= 7.0:1
  largeTextAA: boolean; // >= 3.0:1
  largeTextAAA: boolean; // >= 4.5:1
  uiComponentsAA: boolean; // >= 3.0:1
};

export type WcagReport = {
  ratio: number;
  normalTextAA: WcagCriterion;
  normalTextAAA: WcagCriterion;
  largeTextAA: WcagCriterion;
  largeTextAAA: WcagCriterion;
  uiComponentsAA: WcagCriterion;
  summary: string;
};

export function evaluateWcag(foreground: RGB, background: RGB): WcagRating {
  const ratio = contrastRatio(foreground, background);
  return {
    ratio,
    normalTextAA: ratio >= 4.5,
    normalTextAAA: ratio >= 7.0,
    largeTextAA: ratio >= 3.0,
    largeTextAAA: ratio >= 4.5,
    uiComponentsAA: ratio >= 3.0,
  };
}

export function getWcagReport(foreground: RGB, background: RGB): WcagReport {
  const ratio = contrastRatio(foreground, background);
  return {
    ratio,
    normalTextAA: {
      name: "Normal Text",
      level: "AA",
      requiredRatio: 4.5,
      passed: ratio >= 4.5,
      notes: "Body copy & small text (< 18pt or < 14pt bold)",
    },
    normalTextAAA: {
      name: "Normal Text Enhanced",
      level: "AAA",
      requiredRatio: 7.0,
      passed: ratio >= 7.0,
      notes: "Optimal legibility for small & fine print",
    },
    largeTextAA: {
      name: "Large Text",
      level: "AA",
      requiredRatio: 3.0,
      passed: ratio >= 3.0,
      notes: "Headings (≥ 18pt / 24px, or ≥ 14pt / 18.5px bold)",
    },
    largeTextAAA: {
      name: "Large Text Enhanced",
      level: "AAA",
      requiredRatio: 4.5,
      passed: ratio >= 4.5,
      notes: "High-contrast headings & titles",
    },
    uiComponentsAA: {
      name: "UI Components & Graphical Objects",
      level: "AA",
      requiredRatio: 3.0,
      passed: ratio >= 3.0,
      notes: "Form boundaries, button outlines & essential icons",
    },
    summary:
      ratio >= 7.0
        ? "Passes all WCAG 2.1 AA and AAA criteria"
        : ratio >= 4.5
          ? "Passes WCAG 2.1 AA for normal text and AAA for large text"
          : ratio >= 3.0
            ? "Passes WCAG 2.1 AA for large text and UI components only"
            : "Fails WCAG 2.1 contrast minimums",
  };
}

