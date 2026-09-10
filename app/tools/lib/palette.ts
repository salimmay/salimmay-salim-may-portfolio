/**
 * Pure palette extraction utilities using Median Cut Quantization (MMCQ).
 *
 * Runs locally without DOM dependencies so it can be unit-tested in Node.
 * Downsampled pixel arrays (Uint8ClampedArray) are partitioned in RGB space
 * to extract prominent, diverse color swatches while ignoring transparent pixels.
 */

export type RGB = { r: number; g: number; b: number; a?: number };

export const rgbToHex = ({ r, g, b }: RGB): string => {
  const toHex = (n: number) => Math.min(255, Math.max(0, Math.round(n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export type PaletteColor = {
  hex: string;
  rgb: RGB;
  population: number;
  percentage: number;
};

type Pixel = [number, number, number];

class ColorBox {
  pixels: Pixel[];

  constructor(pixels: Pixel[]) {
    this.pixels = pixels;
  }

  get count(): number {
    return this.pixels.length;
  }

  bounds(): { minR: number; maxR: number; minG: number; maxG: number; minB: number; maxB: number } {
    let minR = 255, maxR = 0;
    let minG = 255, maxG = 0;
    let minB = 255, maxB = 0;

    for (let i = 0; i < this.pixels.length; i++) {
      const [r, g, b] = this.pixels[i];
      if (r < minR) minR = r;
      if (r > maxR) maxR = r;
      if (g < minG) minG = g;
      if (g > maxG) maxG = g;
      if (b < minB) minB = b;
      if (b > maxB) maxB = b;
    }

    return { minR, maxR, minG, maxG, minB, maxB };
  }

  longestAxis(): "r" | "g" | "b" {
    const { minR, maxR, minG, maxG, minB, maxB } = this.bounds();
    const rRange = maxR - minR;
    const gRange = maxG - minG;
    const bRange = maxB - minB;

    if (rRange >= gRange && rRange >= bRange) return "r";
    if (gRange >= rRange && gRange >= bRange) return "g";
    return "b";
  }

  split(): [ColorBox, ColorBox] {
    if (this.pixels.length <= 1) return [this, new ColorBox([])];

    const axis = this.longestAxis();
    const axisIdx = axis === "r" ? 0 : axis === "g" ? 1 : 2;

    this.pixels.sort((a, b) => a[axisIdx] - b[axisIdx]);

    const min = this.pixels[0][axisIdx];
    const max = this.pixels[this.pixels.length - 1][axisIdx];
    const mid = (min + max) / 2;

    let splitIdx = this.pixels.findIndex((p) => p[axisIdx] > mid);
    if (splitIdx <= 0 || splitIdx >= this.pixels.length) {
      splitIdx = Math.floor(this.pixels.length / 2);
    }

    const part1 = this.pixels.slice(0, splitIdx);
    const part2 = this.pixels.slice(splitIdx);

    return [new ColorBox(part1), new ColorBox(part2)];
  }

  average(): RGB {
    if (!this.pixels.length) return { r: 0, g: 0, b: 0, a: 1 };
    let sumR = 0, sumG = 0, sumB = 0;

    for (let i = 0; i < this.pixels.length; i++) {
      sumR += this.pixels[i][0];
      sumG += this.pixels[i][1];
      sumB += this.pixels[i][2];
    }

    const n = this.pixels.length;
    return {
      r: Math.round(sumR / n),
      g: Math.round(sumG / n),
      b: Math.round(sumB / n),
      a: 1,
    };
  }
}

/**
 * Extracts a palette of `count` (5-8) representative colours from RGBA pixel data.
 * Transparent pixels (alpha < minAlpha) are ignored.
 */
export function extractPalette(
  data: Uint8ClampedArray | Uint8Array,
  count: number = 6,
  options: { minAlpha?: number } = {}
): PaletteColor[] {
  const minAlpha = options.minAlpha ?? 128;
  const targetCount = Math.max(2, Math.min(count, 16));
  const pixels: Pixel[] = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a >= minAlpha) {
      pixels.push([r, g, b]);
    }
  }

  if (!pixels.length) return [];

  const totalOpaquePixels = pixels.length;
  const boxes: ColorBox[] = [new ColorBox(pixels)];

  // Iteratively split boxes until target count is reached
  while (boxes.length < targetCount) {
    // Pick box with largest population * range
    let bestIdx = -1;
    let maxScore = -1;

    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      if (box.count <= 1) continue;

      const { minR, maxR, minG, maxG, minB, maxB } = box.bounds();
      const range = Math.max(maxR - minR, maxG - minG, maxB - minB);
      const score = box.count * range;

      if (score > maxScore) {
        maxScore = score;
        bestIdx = i;
      }
    }

    if (bestIdx === -1) break; // Cannot split further

    const [boxToSplit] = boxes.splice(bestIdx, 1);
    const [b1, b2] = boxToSplit.split();
    if (b1.count > 0) boxes.push(b1);
    if (b2.count > 0) boxes.push(b2);
  }

  // Calculate representatives and populations
  const rawPalette: PaletteColor[] = boxes.map((box) => {
    const avgRgb = box.average();
    return {
      hex: rgbToHex(avgRgb),
      rgb: avgRgb,
      population: box.count,
      percentage: Number(((box.count / totalOpaquePixels) * 100).toFixed(1)),
    };
  });

  // Sort palette by population (descending)
  rawPalette.sort((a, b) => b.population - a.population);

  return rawPalette;
}

/**
 * Formats a palette as ready-to-use CSS Custom Properties.
 */
export function paletteToCssVariables(palette: PaletteColor[], prefix: string = "color"): string {
  const lines = palette.map((c, i) => `  --${prefix}-${i + 1}: ${c.hex}; /* ${c.percentage}% */`);
  return `:root {\n${lines.join("\n")}\n}`;
}

/**
 * Formats a palette as a JSON array of color objects.
 */
export function paletteToJson(palette: PaletteColor[]): string {
  return JSON.stringify(
    palette.map((c, i) => ({
      index: i + 1,
      hex: c.hex,
      rgb: `rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})`,
      percentage: c.percentage,
    })),
    null,
    2
  );
}

/**
 * Formats a palette as a simple array of hex strings.
 */
export function paletteToHexList(palette: PaletteColor[]): string[] {
  return palette.map((c) => c.hex);
}
