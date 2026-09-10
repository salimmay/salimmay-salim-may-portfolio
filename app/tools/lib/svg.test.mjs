import assert from "node:assert/strict";
import { optimizeSvg } from "./svg.ts";

console.log("── SVG OPTIMIZER & SANITIZER ──");

// 1. Script and active handler removal
const maliciousSvg = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Author comment -->
  <script>alert('xss')</script>
  <circle cx="50" cy="50" r="40" fill="red" onclick="alert(1)" onload="evil()" />
  <a href="javascript:alert('link')">Link</a>
</svg>
`;

const cleanResult = optimizeSvg(maliciousSvg);
assert.ok(!cleanResult.optimized.includes("<script"));
assert.ok(!cleanResult.optimized.includes("alert"));
assert.ok(!cleanResult.optimized.includes("onclick"));
assert.ok(!cleanResult.optimized.includes("onload"));
assert.ok(!cleanResult.optimized.includes("javascript:"));
assert.ok(cleanResult.optimized.includes("<circle"));
console.log("  ok   purges scripts, inline event handlers, and javascript: links");

// 2. XML comments and prolog removal
const bloatedSvg = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Created with Inkscape (http://www.inkscape.org/) -->
<svg viewBox="0 0 100 100"
     xmlns="http://www.w3.org/2000/svg"
     xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
     xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
     inkscape:version="1.1">
  <sodipodi:namedview id="base" pagecolor="#ffffff" />
  <metadata id="meta"><rdf:RDF>garbage</rdf:RDF></metadata>
  <g id="empty-group"></g>
  <rect x="10" y="10" width="80" height="80" fill="blue" inkscape:label="my-rect" />
</svg>`;

const optimized = optimizeSvg(bloatedSvg);
assert.ok(!optimized.optimized.includes("<?xml"));
assert.ok(!optimized.optimized.includes("<!DOCTYPE"));
assert.ok(!optimized.optimized.includes("<!-- Created"));
assert.ok(!optimized.optimized.includes("xmlns:inkscape"));
assert.ok(!optimized.optimized.includes("sodipodi:namedview"));
assert.ok(!optimized.optimized.includes("<metadata"));
assert.ok(!optimized.optimized.includes("empty-group"));
assert.ok(optimized.optimized.includes("<rect"));
assert.ok(!optimized.optimized.includes("inkscape:label"));
assert.ok(optimized.savingsBytes > 0);
assert.ok(optimized.savingsPercent > 40);
console.log("  ok   strips comments, editor namespaces, metadata, and empty groups with high byte savings");

// 3. Invalid SVG error handling
assert.throws(() => optimizeSvg("hello world"), /missing <svg>/);
console.log("  ok   rejects non-SVG content with informative error");

console.log("\nall checks passed");
