// Run with: node app/tools/lib/color.test.mjs

const {
  parseHex,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToOklch,
  oklchToRgb,
  parseRgbString,
  parseHslString,
  parseOklchString,
  parseColor,
  relativeLuminance,
  contrastRatio,
  evaluateWcag,
  getWcagReport,
} = await import("./color.ts");

let failures = 0;
const check = (name, cond, extra = "") => {
  console.log(`${cond ? "  ok  " : "  FAIL"} ${name}${extra ? "  " + extra : ""}`);
  if (!cond) failures++;
};

console.log("── HEX PARSING & FORMATTING ──");
const whiteHex = parseHex("#fff");
check("parseHex short #fff", whiteHex && whiteHex.r === 255 && whiteHex.g === 255 && whiteHex.b === 255);

const blueHex = parseHex("#3b82f6");
check("parseHex 6-digit #3b82f6", blueHex && blueHex.r === 59 && blueHex.g === 130 && blueHex.b === 246);

const alphaHex = parseHex("#00000080");
check("parseHex 8-digit with alpha", alphaHex && alphaHex.r === 0 && alphaHex.g === 0 && alphaHex.b === 0 && Math.abs(alphaHex.a - 0.5) < 0.02);

check("parseHex rejects invalid string", parseHex("not-a-color") === null);
check("rgbToHex formats correctly", rgbToHex({ r: 59, g: 130, b: 246 }) === "#3b82f6");
check("rgbToHex preserves white/black", rgbToHex({ r: 0, g: 0, b: 0 }) === "#000000" && rgbToHex({ r: 255, g: 255, b: 255 }) === "#ffffff");

console.log("\n── HSL CONVERSION & ROUND TRIP ──");
const redRgb = { r: 255, g: 0, b: 0, a: 1 };
const redHsl = rgbToHsl(redRgb);
check("rgbToHsl for pure red", redHsl.h === 0 && redHsl.s === 100 && redHsl.l === 50);

const backRed = hslToRgb(redHsl);
check("hslToRgb round-trip for red", backRed.r === 255 && backRed.g === 0 && backRed.b === 0);

const sampleRgb = { r: 59, g: 130, b: 246, a: 1 };
const sampleHsl = rgbToHsl(sampleRgb);
const sampleBack = hslToRgb(sampleHsl);
// HSL round-trip tolerance due to integer rounding
const diffR = Math.abs(sampleBack.r - sampleRgb.r);
const diffG = Math.abs(sampleBack.g - sampleRgb.g);
const diffB = Math.abs(sampleBack.b - sampleRgb.b);
check("hslToRgb round-trip within integer round tolerance (<= 2)", diffR <= 2 && diffG <= 2 && diffB <= 2);

console.log("\n── OKLCH CONVERSION & ROUND TRIP ──");
const blackOklch = rgbToOklch({ r: 0, g: 0, b: 0 });
check("black OKLCH has L=0 and C=0", blackOklch.l === 0 && blackOklch.c === 0);

const whiteOklch = rgbToOklch({ r: 255, g: 255, b: 255 });
check("white OKLCH has L=1 and C=0", whiteOklch.l === 1 && whiteOklch.c === 0);

const blueOklch = rgbToOklch(sampleRgb);
check("blue #3b82f6 has reasonable lightness and chroma", blueOklch.l > 0.5 && blueOklch.l < 0.7 && blueOklch.c > 0.15);

const backBlueRgb = oklchToRgb(blueOklch);
const diffOklchR = Math.abs(backBlueRgb.r - sampleRgb.r);
const diffOklchG = Math.abs(backBlueRgb.g - sampleRgb.g);
const diffOklchB = Math.abs(backBlueRgb.b - sampleRgb.b);
check("oklchToRgb round-trip accurate within 2 RGB units", diffOklchR <= 2 && diffOklchG <= 2 && diffOklchB <= 2);

console.log("\n── PARSE COLOR (MODERN & LEGACY CSS NOTATIONS) ──");
check("parseColor parses hex", parseColor("#ff0000")?.r === 255);
check("parseColor parses legacy comma rgb()", parseColor("rgb(0, 128, 255)")?.b === 255);
check("parseRgbString parses modern space rgb(r g b / a)", parseRgbString("rgb(0 128 255 / 0.8)")?.b === 255);
check("parseColor parses legacy comma hsl()", parseColor("hsl(120, 100%, 50%)")?.g === 255);
check("parseHslString parses modern space hsl(h s% l% / a)", parseHslString("hsl(120 100% 50% / 0.5)")?.h === 120);
check("parseColor parses CSS Color 4 oklch()", parseColor("oklch(0.623 0.188 259.8)")?.b !== undefined);
check("parseOklchString parses percentage lightness", parseOklchString("oklch(62.3% 0.188 259.8)")?.l === 0.623);

console.log("\n── WCAG LUMINANCE & CONTRAST RATIO ──");
const black = { r: 0, g: 0, b: 0 };
const white = { r: 255, g: 255, b: 255 };

check("black relative luminance is 0", relativeLuminance(black) === 0);
check("white relative luminance is 1", relativeLuminance(white) === 1);

const bwRatio = contrastRatio(black, white);
check("black on white contrast ratio is 21:1", bwRatio === 21);

const sameRatio = contrastRatio(white, white);
check("identical color contrast ratio is 1:1", sameRatio === 1);

const rating = evaluateWcag(white, { r: 15, g: 23, b: 42 }); // slate-900 background
check("white on slate-900 passes normalTextAA", rating.normalTextAA);
check("white on slate-900 passes normalTextAAA", rating.normalTextAAA);

const lowContrast = evaluateWcag({ r: 100, g: 100, b: 100 }, { r: 110, g: 110, b: 110 });
check("similar greys fail AA and AAA", !lowContrast.normalTextAA && !lowContrast.largeTextAA);

console.log("\n── WCAG DETAILED REPORT & THRESHOLDS ──");
const fullReport = getWcagReport(white, black);
check("fullReport has ratio 21", fullReport.ratio === 21);
check("normalTextAA requiredRatio is 4.5", fullReport.normalTextAA.requiredRatio === 4.5);
check("normalTextAAA requiredRatio is 7.0", fullReport.normalTextAAA.requiredRatio === 7.0);
check("largeTextAA requiredRatio is 3.0", fullReport.largeTextAA.requiredRatio === 3.0);
check("largeTextAAA requiredRatio is 4.5", fullReport.largeTextAAA.requiredRatio === 4.5);
check("uiComponentsAA requiredRatio is 3.0", fullReport.uiComponentsAA.requiredRatio === 3.0);
check("fullReport passes all for black/white", fullReport.normalTextAA.passed && fullReport.normalTextAAA.passed && fullReport.largeTextAA.passed);

// Boundary checks:
// Pure blue (#0000ff, L ≈ 0.0722) on pure white (#ffffff, L = 1.0)
// ratio = (1.0 + 0.05) / (0.0722 + 0.05) ≈ 1.05 / 0.1222 ≈ 8.59 (passes AAA)
const blueReport = getWcagReport({ r: 0, g: 0, b: 255 }, white);
check("blue on white passes normal text AAA", blueReport.normalTextAAA.passed);

console.log(`\n${failures ? failures + " FAILURE(S)" : "all checks passed"}`);
process.exit(failures ? 1 : 0);

