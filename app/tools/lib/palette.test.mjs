// Run with: node app/tools/lib/palette.test.mjs
const { extractPalette, paletteToCssVariables, paletteToJson, paletteToHexList } = await import("./palette.ts");

let failures = 0;
const check = (name, cond, extra = "") => {
  console.log(`${cond ? "  ok  " : "  FAIL"} ${name}${extra ? "  " + extra : ""}`);
  if (!cond) failures++;
};

console.log("── SYNTHETIC PIXEL PALETTE EXTRACTION ──");
// Build a synthetic pixel array:
// 100 Red pixels (255, 0, 0, 255)
// 100 Blue pixels (0, 0, 255, 255)
// 100 Green pixels (0, 255, 0, 255)
// 50 Transparent pixels (0, 0, 0, 0)
const pixels = [];
for (let i = 0; i < 100; i++) pixels.push(255, 0, 0, 255);
for (let i = 0; i < 100; i++) pixels.push(0, 0, 255, 255);
for (let i = 0; i < 100; i++) pixels.push(0, 255, 0, 255);
for (let i = 0; i < 50; i++) pixels.push(0, 0, 0, 0); // Transparent

const pixelData = new Uint8Array(pixels);
const palette = extractPalette(pixelData, 3);

check("extracted 3 palette swatches", palette.length === 3);
const hexes = palette.map((p) => p.hex.toLowerCase());
check("swatches include red (#ff0000)", hexes.includes("#ff0000"));
check("swatches include blue (#0000ff)", hexes.includes("#0000ff"));
check("swatches include green (#00ff00)", hexes.includes("#00ff00"));
check("transparent pixels were ignored in total count", palette.reduce((s, c) => s + c.population, 0) === 300);

console.log("\n── PALETTE SIZE CONFIGURATION ──");
// Test extracting 5, 6, 7, 8 swatches
const multiPixels = [];
for (let r = 0; r < 256; r += 32) {
  for (let g = 0; g < 256; g += 32) {
    multiPixels.push(r, g, 128, 255);
  }
}
const multiData = new Uint8Array(multiPixels);

for (const size of [5, 6, 7, 8]) {
  const p = extractPalette(multiData, size);
  check(`extractPalette handles count ${size}`, p.length === size);
}

console.log("\n── FORMATTERS: CSS VARIABLES & JSON ──");
const css = paletteToCssVariables(palette, "swatch");
check("paletteToCssVariables outputs :root block", css.includes(":root {") && css.includes("--swatch-1: #ff0000;"));

const json = paletteToJson(palette);
const parsed = JSON.parse(json);
check("paletteToJson produces valid JSON array of length 3", Array.isArray(parsed) && parsed.length === 3);
check("paletteToHexList returns 3 hex codes", paletteToHexList(palette).length === 3);

console.log(`\n${failures ? failures + " FAILURE(S)" : "all checks passed"}`);
process.exit(failures ? 1 : 0);
