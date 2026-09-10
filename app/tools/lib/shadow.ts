/**
 * Pure utilities for CSS Box Shadow multi-layer management, serialization, and presets.
 */

export type ShadowLayer = {
  id: string;
  horizontal: number; // -100 to 100 px
  vertical: number; // -100 to 100 px
  blur: number; // 0 to 100 px
  spread: number; // -50 to 50 px
  color: string; // Hex string e.g. #000000
  opacity: number; // 0.0 to 1.0
  inset: boolean;
  active: boolean;
};

/**
 * Converts a hex color (#rgb or #rrggbb) and an opacity (0..1) to an rgba(...) string.
 */
export function hexToRgba(hex: string, opacity: number): string {
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (clean.length !== 6) {
    return `rgba(0, 0, 0, ${Math.max(0, Math.min(1, opacity))})`;
  }

  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const safeAlpha = Math.round(Math.max(0, Math.min(1, opacity)) * 1000) / 1000;

  return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
}

/**
 * Serializes a single ShadowLayer into a CSS shadow chunk.
 * Format: [inset] <offset-x> <offset-y> <blur-radius> <spread-radius> <color>
 */
export function serializeLayer(layer: ShadowLayer): string {
  const parts: string[] = [];
  if (layer.inset) parts.push("inset");
  parts.push(`${layer.horizontal}px`);
  parts.push(`${layer.vertical}px`);
  parts.push(`${layer.blur}px`);
  parts.push(`${layer.spread}px`);
  parts.push(hexToRgba(layer.color, layer.opacity));
  return parts.join(" ");
}

/**
 * Serializes an array of ShadowLayers into a complete CSS `box-shadow` property value.
 * Inactive layers are filtered out. If no active layers remain, returns "none".
 */
export function serializeBoxShadow(layers: ShadowLayer[]): string {
  const active = layers.filter((l) => l.active);
  if (!active.length) return "none";
  return active.map(serializeLayer).join(",\n  ");
}

export function generateCssSnippet(layers: ShadowLayer[]): string {
  const serialized = serializeBoxShadow(layers);
  return `box-shadow: ${serialized};`;
}

export type ShadowPreset = {
  name: string;
  layers: Omit<ShadowLayer, "id">[];
};

export const SHADOW_PRESETS: ShadowPreset[] = [
  {
    name: "Subtle Elevation",
    layers: [
      {
        horizontal: 0,
        vertical: 1,
        blur: 3,
        spread: 0,
        color: "#000000",
        opacity: 0.1,
        inset: false,
        active: true,
      },
      {
        horizontal: 0,
        vertical: 1,
        blur: 2,
        spread: -1,
        color: "#000000",
        opacity: 0.1,
        inset: false,
        active: true,
      },
    ],
  },
  {
    name: "Smooth Medium Lift",
    layers: [
      {
        horizontal: 0,
        vertical: 4,
        blur: 6,
        spread: -1,
        color: "#000000",
        opacity: 0.1,
        inset: false,
        active: true,
      },
      {
        horizontal: 0,
        vertical: 2,
        blur: 4,
        spread: -2,
        color: "#000000",
        opacity: 0.1,
        inset: false,
        active: true,
      },
    ],
  },
  {
    name: "Floating Depth",
    layers: [
      {
        horizontal: 0,
        vertical: 20,
        blur: 25,
        spread: -5,
        color: "#000000",
        opacity: 0.2,
        inset: false,
        active: true,
      },
      {
        horizontal: 0,
        vertical: 8,
        blur: 10,
        spread: -6,
        color: "#000000",
        opacity: 0.2,
        inset: false,
        active: true,
      },
    ],
  },
  {
    name: "Neon Cyber Glow",
    layers: [
      {
        horizontal: 0,
        vertical: 0,
        blur: 15,
        spread: 2,
        color: "#38bdf8",
        opacity: 0.7,
        inset: false,
        active: true,
      },
      {
        horizontal: 0,
        vertical: 0,
        blur: 30,
        spread: 6,
        color: "#6366f1",
        opacity: 0.5,
        inset: false,
        active: true,
      },
    ],
  },
  {
    name: "Inner Recessed",
    layers: [
      {
        horizontal: 0,
        vertical: 2,
        blur: 4,
        spread: 0,
        color: "#000000",
        opacity: 0.25,
        inset: true,
        active: true,
      },
      {
        horizontal: 0,
        vertical: -1,
        blur: 2,
        spread: 0,
        color: "#ffffff",
        opacity: 0.15,
        inset: true,
        active: true,
      },
    ],
  },
];

