import assert from "node:assert/strict";
import {
  detectNumericUnit,
  getRelativeTime,
  parseTimestampInput,
} from "./timestamp.ts";

console.log("── TIMESTAMP CONVERTER & PARSER ──");

// 1. Seconds vs Milliseconds detection
assert.equal(detectNumericUnit(1700000000), "seconds");
assert.equal(detectNumericUnit(1700000000000), "milliseconds");
assert.equal(detectNumericUnit(-14182940), "seconds"); // 1969
assert.equal(detectNumericUnit(-14182940000), "milliseconds");
console.log("  ok   detectNumericUnit properly categorizes seconds vs milliseconds");

// 2. Pre-1970 negative Unix timestamps (e.g. Apollo 11 moon landing: July 20, 1969)
const pre1970Result = parseTimestampInput("-14182980");
assert.ok(pre1970Result.valid);
if (pre1970Result.valid) {
  assert.equal(pre1970Result.parsed.unixSeconds, -14182980);
  assert.equal(pre1970Result.parsed.isBefore1970, true);
  assert.ok(pre1970Result.parsed.iso8601.startsWith("1969-07-20"));
}
console.log("  ok   parses pre-1970 negative timestamps accurately");

// 3. ISO 8601 parsing
const isoInput = "2026-09-09T18:00:00Z";
const isoResult = parseTimestampInput(isoInput);
assert.ok(isoResult.valid);
if (isoResult.valid) {
  assert.equal(isoResult.detectedType, "iso");
  assert.equal(isoResult.parsed.iso8601, "2026-09-09T18:00:00.000Z");
  assert.equal(isoResult.parsed.unixSeconds, 1788976800);
}
console.log("  ok   parses ISO 8601 string to exact Unix timestamp");

// 4. Relative time
const now = new Date("2026-09-09T18:00:00Z");
const past = new Date("2026-09-09T17:50:00Z"); // 10 mins ago
const future = new Date("2026-09-11T18:00:00Z"); // in 2 days

assert.ok(getRelativeTime(past, now).includes("10") || getRelativeTime(past, now).includes("minute"));
assert.ok(getRelativeTime(future, now).includes("2") || getRelativeTime(future, now).includes("day"));
console.log("  ok   computes accurate past and future relative time");

// 5. Invalid date handling
const invalid = parseTimestampInput("not a valid date at all");
assert.equal(invalid.valid, false);
assert.ok(invalid.error.includes("Unrecognized date"));
console.log("  ok   rejects malformed dates with clean error");

console.log("\nall checks passed");

