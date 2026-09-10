/**
 * Pure JSON formatting, validation, key-sorting, and error location utilities.
 */

export type JsonValidationResult =
  | {
      valid: true;
      stats: {
        bytes: number;
        lines: number;
        keysCount: number;
        type: "object" | "array" | "primitive";
      };
    }
  | {
      valid: false;
      error: string;
      line?: number;
      column?: number;
      snippet?: string;
    };

/**
 * Finds the 1-indexed line and column corresponding to a character index in text.
 */
export function indexToLineColumn(text: string, index: number): { line: number; column: number } {
  const safeIndex = Math.max(0, Math.min(index, text.length));
  const before = text.slice(0, safeIndex);
  const lines = before.split("\n");
  const line = lines.length;
  const column = lines[lines.length - 1].length + 1;
  return { line, column };
}

/**
 * Extracts line and column from a JSON.parse syntax error.
 */
export function extractJsonErrorLocation(
  err: Error,
  rawJson: string
): { line?: number; column?: number } {
  // 1. Check for err.position property
  const errAny = err as unknown as { position?: number };
  if (typeof errAny.position === "number") {
    return indexToLineColumn(rawJson, errAny.position);
  }

  const msg = err.message || "";

  // 2. Check for "position <number>" (Legacy V8 / Chrome)
  const posMatch = msg.match(/position (\d+)/i);
  if (posMatch) {
    const pos = parseInt(posMatch[1], 10);
    return indexToLineColumn(rawJson, pos);
  }

  // 3. Check for "line <number> column <number>" (Firefox / Safari)
  const lineColMatch = msg.match(/line (\d+).*?column (\d+)/i);
  if (lineColMatch) {
    return {
      line: parseInt(lineColMatch[1], 10),
      column: parseInt(lineColMatch[2], 10),
    };
  }

  // 4. Check for snippet excerpt in modern V8: ..."<snippet>"... is not valid JSON
  const snippetMatch = msg.match(/\.\.\."?([\s\S]*?)"?\.\.\./);
  if (snippetMatch && snippetMatch[1]) {
    const snip = snippetMatch[1].replace(/\\"/g, '"');
    const idx = rawJson.indexOf(snip);
    if (idx !== -1) {
      return indexToLineColumn(rawJson, idx);
    }
  }

  return {};
}

/**
 * Recursively or shallowly sorts the keys of an object or nested objects.
 * Arrays and primitives are preserved as-is.
 */
export function sortObjectKeys(obj: unknown, deep: boolean = false): unknown {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return deep ? obj.map((item) => sortObjectKeys(item, deep)) : obj;
  }

  const sortedObj: Record<string, unknown> = {};
  const keys = Object.keys(obj as Record<string, unknown>).sort();

  for (const key of keys) {
    const val = (obj as Record<string, unknown>)[key];
    sortedObj[key] = deep ? sortObjectKeys(val, deep) : val;
  }

  return sortedObj;
}

/**
 * Validates a JSON string and extracts statistics or error coordinates.
 */
export function validateJson(raw: string): JsonValidationResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { valid: false, error: "Input is empty." };
  }

  try {
    const parsed = JSON.parse(raw);
    const bytes = new TextEncoder().encode(raw).length;
    const lines = raw.split("\n").length;
    let keysCount = 0;
    let type: "object" | "array" | "primitive" = "primitive";

    if (parsed !== null && typeof parsed === "object") {
      if (Array.isArray(parsed)) {
        type = "array";
        keysCount = parsed.length;
      } else {
        type = "object";
        keysCount = Object.keys(parsed).length;
      }
    }

    return {
      valid: true,
      stats: { bytes, lines, keysCount, type },
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Syntax error in JSON";
    const { line, column } = extractJsonErrorLocation(
      err instanceof Error ? err : new Error(error),
      raw
    );

    let snippet: string | undefined;
    if (line !== undefined) {
      const allLines = raw.split("\n");
      const targetLine = allLines[line - 1];
      if (targetLine !== undefined) {
        snippet = targetLine.trim();
      }
    }

    return {
      valid: false,
      error,
      line,
      column,
      snippet,
    };
  }
}

/**
 * Formats a JSON string with indentation (spaces or tabs).
 */
export function formatJson(raw: string, indent: number | "\t" = 2): string {
  const parsed = JSON.parse(raw);
  return JSON.stringify(parsed, null, indent);
}

/**
 * Minifies a JSON string by removing all unnecessary whitespace.
 */
export function minifyJson(raw: string): string {
  const parsed = JSON.parse(raw);
  return JSON.stringify(parsed);
}

/**
 * Sorts object keys (shallow or deep) and re-serializes with specified indentation.
 */
export function sortAndFormatJson(
  raw: string,
  deep: boolean = false,
  indent: number | "\t" = 2
): string {
  const parsed = JSON.parse(raw);
  const sorted = sortObjectKeys(parsed, deep);
  return JSON.stringify(sorted, null, indent);
}
