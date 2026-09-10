/**
 * Pure SVG optimization and sanitization utilities.
 *
 * Implements conservative, safe local transformations on SVG markup:
 * - Strips XML comments and doctype declarations
 * - Strips editor namespaces and attributes (Inkscape, Sodipodi, Sketch, Illustrator)
 * - Strips non-rendering metadata tags (<metadata>, <desc>)
 * - Completely purges <script> tags, inline on* handlers, and javascript: links for security
 * - Eliminates empty structural groups (<g></g>, <defs></defs>)
 * - Collapses redundant whitespace and formatting padding
 */

export type SvgOptimizeOptions = {
  stripComments?: boolean;
  stripMetadata?: boolean;
  stripEditorData?: boolean;
  stripEmptyContainers?: boolean;
  collapseWhitespace?: boolean;
  removeScriptsAndHandlers?: boolean;
};

export type SvgOptimizeResult = {
  original: string;
  optimized: string;
  originalBytes: number;
  optimizedBytes: number;
  savingsBytes: number;
  savingsPercent: number;
  appliedPasses: string[];
};

const DEFAULT_OPTIONS: Required<SvgOptimizeOptions> = {
  stripComments: true,
  stripMetadata: true,
  stripEditorData: true,
  stripEmptyContainers: true,
  collapseWhitespace: true,
  removeScriptsAndHandlers: true,
};

export function optimizeSvg(
  rawSvg: string,
  options: SvgOptimizeOptions = {}
): SvgOptimizeResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const passes: string[] = [];
  let code = rawSvg.trim();

  // Validate basic SVG structure
  if (!code.includes("<svg") || !code.includes("</svg>")) {
    if (!code.includes("<svg")) {
      throw new Error("Invalid SVG: missing <svg> root element");
    }
  }

  // 1. Mandatory Security Pass: Strip <script> tags and contents completely
  if (opts.removeScriptsAndHandlers) {
    const beforeScript = code;
    code = code.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi, "");
    // Remove self-closing scripts if any
    code = code.replace(/<script\b[^>]*\/>/gi, "");

    // Remove inline event handlers (onload, onclick, onerror, onmouseover, etc.)
    code = code.replace(/\s+on[a-zA-Z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");

    // Sanitize javascript: in href or xlink:href
    code = code.replace(/(href|xlink:href)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '$1=""');

    if (code !== beforeScript) {
      passes.push("Purged active scripts, event handlers, and javascript: URIs");
    }
  }

  // 2. Strip XML prolog (<?xml ...?>) and DOCTYPE declarations (<!DOCTYPE ...>)
  const beforeProlog = code;
  code = code.replace(/<\?xml[\s\S]*?\?>/gi, "");
  code = code.replace(/<!DOCTYPE[\s\S]*?>/gi, "");
  if (code !== beforeProlog) {
    passes.push("Removed XML prolog and DOCTYPE header");
  }

  // 3. Strip XML comments
  if (opts.stripComments) {
    const beforeComments = code;
    code = code.replace(/<!--[\s\S]*?-->/g, "");
    if (code !== beforeComments) {
      passes.push("Stripped XML comments");
    }
  }

  // 4. Strip <metadata>, <desc>, <title> blocks if requested
  if (opts.stripMetadata) {
    const beforeMeta = code;
    code = code.replace(/<metadata\b[^<]*(?:(?!<\/metadata>)<[^<]*)*<\/metadata\s*>/gi, "");
    code = code.replace(/<metadata\b[^>]*\/>/gi, "");
    code = code.replace(/<desc\b[^<]*(?:(?!<\/desc>)<[^<]*)*<\/desc\s*>/gi, "");
    code = code.replace(/<desc\b[^>]*\/>/gi, "");
    if (code !== beforeMeta) {
      passes.push("Removed non-rendering metadata and descriptions");
    }
  }

  // 5. Strip editor namespaces and editor-specific attributes
  if (opts.stripEditorData) {
    const beforeEditor = code;
    // Strip namespace declarations
    code = code.replace(/\s+xmlns:(?:inkscape|sodipodi|sketch|adobe|i)\s*=\s*(?:"[^"]*"|'[^']*')/gi, "");
    // Strip editor-namespaced attributes
    code = code.replace(/\s+(?:inkscape|sodipodi|sketch|adobe|i):[a-zA-Z0-9_-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
    // Strip sodipodi:namedview blocks
    code = code.replace(/<sodipodi:namedview\b[\s\S]*?(?:\/>|<\/sodipodi:namedview\s*>)/gi, "");
    if (code !== beforeEditor) {
      passes.push("Cleaned Inkscape, Sodipodi, Sketch, and Adobe editor metadata");
    }
  }

  // 6. Strip empty container groups (<g></g>, <defs></defs>)
  if (opts.stripEmptyContainers) {
    const beforeEmpty = code;
    // Repeat up to 3 passes to handle nested empty groups
    for (let i = 0; i < 3; i++) {
      code = code.replace(/<g\b[^>]*>\s*<\/g\s*>/gi, "");
      code = code.replace(/<defs\b[^>]*>\s*<\/defs\s*>/gi, "");
    }
    if (code !== beforeEmpty) {
      passes.push("Removed empty <g> and <defs> containers");
    }
  }

  // 7. Collapse whitespace between tags and redundant spaces inside tags
  if (opts.collapseWhitespace) {
    const beforeWs = code;
    // Remove whitespace between tags
    code = code.replace(/>\s+</g, "><");
    // Collapse multi-spaces inside tags to a single space
    code = code.replace(/<([^>]+)>/g, (_, inner) => `<${inner.replace(/\s+/g, " ").trim()}>`);
    if (code !== beforeWs) {
      passes.push("Collapsed redundant whitespace and formatting tabs");
    }
  }

  code = code.trim();

  const originalBytes = new TextEncoder().encode(rawSvg).length;
  const optimizedBytes = new TextEncoder().encode(code).length;
  const savingsBytes = Math.max(0, originalBytes - optimizedBytes);
  const savingsPercent =
    originalBytes > 0 ? Math.round((savingsBytes / originalBytes) * 1000) / 10 : 0;

  return {
    original: rawSvg,
    optimized: code,
    originalBytes,
    optimizedBytes,
    savingsBytes,
    savingsPercent,
    appliedPasses: passes,
  };
}

