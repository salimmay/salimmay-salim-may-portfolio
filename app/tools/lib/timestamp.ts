/**
 * Pure date & Unix timestamp parsing, formatting, and boundary normalization.
 *
 * Reliably handles:
 * - Pure numeric Unix seconds vs Unix milliseconds detection
 * - Negative timestamps for historical dates before 1970
 * - ISO 8601 and standard date string inputs
 * - Relative time calculations ("x minutes ago", "in 2 days")
 * - User's local timezone formatting via Intl APIs
 */

export type ParsedTimestamp = {
  date: Date;
  unixSeconds: number;
  unixMilliseconds: number;
  iso8601: string;
  utcString: string;
  relativeTime: string;
  isBefore1970: boolean;
};

export type ParseResult =
  | { valid: true; parsed: ParsedTimestamp; detectedType: "seconds" | "milliseconds" | "iso" }
  | { valid: false; error: string };

/**
 * Disambiguates whether a numeric timestamp string represents seconds or milliseconds.
 * Timestamps with <= 11 digits in magnitude (< 100 billion seconds, year ~5138) are seconds.
 * Timestamps with >= 12 digits are milliseconds.
 */
export function detectNumericUnit(num: number): "seconds" | "milliseconds" {
  const abs = Math.abs(num);
  // 10 billion seconds corresponds to November 2286.
  // Any timestamp >= 10,000,000,000 is milliseconds (e.g. 13-digit modern or 11+ digit 20th century).
  return abs < 10_000_000_000 ? "seconds" : "milliseconds";
}

/**
 * Calculates human-friendly relative time (e.g. "5 minutes ago", "in 3 days").
 */
export function getRelativeTime(target: Date, base: Date = new Date()): string {
  const diffMs = target.getTime() - base.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  const diffMonth = Math.round(diffDay / 30.44);
  const diffYear = Math.round(diffDay / 365.25);

  if (typeof Intl !== "undefined" && typeof Intl.RelativeTimeFormat !== "undefined") {
    try {
      const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
      if (Math.abs(diffSec) < 45) return rtf.format(diffSec, "second");
      if (Math.abs(diffMin) < 45) return rtf.format(diffMin, "minute");
      if (Math.abs(diffHour) < 22) return rtf.format(diffHour, "hour");
      if (Math.abs(diffDay) < 26) return rtf.format(diffDay, "day");
      if (Math.abs(diffMonth) < 11) return rtf.format(diffMonth, "month");
      return rtf.format(diffYear, "year");
    } catch {
      // Fallback below
    }
  }

  // Fallback if Intl is unavailable
  if (Math.abs(diffSec) < 60) return diffSec >= 0 ? `in ${diffSec}s` : `${Math.abs(diffSec)}s ago`;
  if (Math.abs(diffMin) < 60) return diffMin >= 0 ? `in ${diffMin}m` : `${Math.abs(diffMin)}m ago`;
  if (Math.abs(diffHour) < 24) return diffHour >= 0 ? `in ${diffHour}h` : `${Math.abs(diffHour)}h ago`;
  return diffDay >= 0 ? `in ${diffDay}d` : `${Math.abs(diffDay)}d ago`;
}

/**
 * Formats a Date using the environment's local timezone.
 */
export function formatLocalTime(date: Date): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeStyle: "long",
    }).format(date);
  } catch {
    return date.toString();
  }
}

/**
 * Returns the name of the active local timezone.
 */
export function getLocalTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
  } catch {
    return "Local";
  }
}

/**
 * Parses user input into a normalized ParsedTimestamp.
 */
export function parseTimestampInput(
  input: string,
  baseDate: Date = new Date()
): ParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, error: "Please enter a timestamp or date string." };
  }

  let date: Date;
  let detectedType: "seconds" | "milliseconds" | "iso" = "iso";

  // 1. Check if input is purely an integer (can be negative for pre-1970)
  if (/^-?\d+$/.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    if (!Number.isSafeInteger(num)) {
      return { valid: false, error: "Numeric timestamp is beyond safe integer range." };
    }

    const unit = detectNumericUnit(num);
    detectedType = unit;
    const ms = unit === "seconds" ? num * 1000 : num;
    date = new Date(ms);
  } else {
    // 2. Parse as ISO 8601 or standard date format
    const parsedMs = Date.parse(trimmed);
    if (isNaN(parsedMs)) {
      return {
        valid: false,
        error: "Unrecognized date format. Use Unix seconds/ms or ISO 8601 (YYYY-MM-DDTHH:mm:ssZ).",
      };
    }
    date = new Date(parsedMs);
    detectedType = "iso";
  }

  if (isNaN(date.getTime())) {
    return { valid: false, error: "Invalid calendar date specified." };
  }

  const unixMilliseconds = date.getTime();
  const unixSeconds = Math.floor(unixMilliseconds / 1000);
  const isBefore1970 = unixMilliseconds < 0;

  return {
    valid: true,
    detectedType,
    parsed: {
      date,
      unixSeconds,
      unixMilliseconds,
      iso8601: date.toISOString(),
      utcString: date.toUTCString(),
      relativeTime: getRelativeTime(date, baseDate),
      isBefore1970,
    },
  };
}
