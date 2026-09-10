import assert from "node:assert/strict";
import {
  hexToRgba,
  serializeLayer,
  serializeBoxShadow,
  generateCssSnippet,
} from "./shadow.ts";

console.log("── CSS BOX SHADOW SERIALIZATION ──");

// 1. hexToRgba
assert.equal(hexToRgba("#000000", 0.5), "rgba(0, 0, 0, 0.5)");
assert.equal(hexToRgba("#3b82f6", 1), "rgba(59, 130, 246, 1)");
assert.equal(hexToRgba("#fff", 0.2), "rgba(255, 255, 255, 0.2)");
console.log("  ok   hexToRgba converts 3 and 6 digit hex with opacity clamping");

// 2. serializeLayer
const standardLayer = {
  id: "1",
  horizontal: 0,
  vertical: 4,
  blur: 6,
  spread: -1,
  color: "#000000",
  opacity: 0.1,
  inset: false,
  active: true,
};
assert.equal(serializeLayer(standardLayer), "0px 4px 6px -1px rgba(0, 0, 0, 0.1)");
console.log("  ok   serializeLayer formats standard outer shadow");

const insetLayer = {
  id: "2",
  horizontal: -2,
  vertical: 2,
  blur: 4,
  spread: 0,
  color: "#38bdf8",
  opacity: 0.8,
  inset: true,
  active: true,
};
assert.equal(serializeLayer(insetLayer), "inset -2px 2px 4px 0px rgba(56, 189, 248, 0.8)");
console.log("  ok   serializeLayer handles inset keyword and negative offsets");

// 3. serializeBoxShadow multi-layer and inactive filtering
const inactiveLayer = {
  ...standardLayer,
  id: "3",
  active: false,
};
const combined = serializeBoxShadow([standardLayer, inactiveLayer, insetLayer]);
assert.ok(!combined.includes("id: 3"));
assert.ok(combined.includes("0px 4px 6px -1px rgba(0, 0, 0, 0.1)"));
assert.ok(combined.includes("inset -2px 2px 4px 0px rgba(56, 189, 248, 0.8)"));
console.log("  ok   serializeBoxShadow omits inactive layers and joins with comma");

assert.equal(serializeBoxShadow([]), "none");
assert.equal(serializeBoxShadow([inactiveLayer]), "none");
console.log("  ok   serializeBoxShadow returns 'none' when no active layers exist");

// 4. generateCssSnippet
const snippet = generateCssSnippet([standardLayer]);
assert.equal(snippet, "box-shadow: 0px 4px 6px -1px rgba(0, 0, 0, 0.1);");
console.log("  ok   generateCssSnippet produces valid CSS rule");

console.log("\nall checks passed");

