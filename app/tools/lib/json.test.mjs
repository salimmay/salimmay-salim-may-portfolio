import assert from "node:assert/strict";
import {
  formatJson,
  minifyJson,
  sortObjectKeys,
  sortAndFormatJson,
  validateJson,
  indexToLineColumn,
} from "./json.ts";

console.log("── JSON FORMATTER & VALIDATOR ──");

// 1. Line and column mapping from index
const sampleText = "line 1\nline 2 is longer\nline 3";
assert.deepEqual(indexToLineColumn(sampleText, 0), { line: 1, column: 1 });
assert.deepEqual(indexToLineColumn(sampleText, 7), { line: 2, column: 1 });
assert.deepEqual(indexToLineColumn(sampleText, 14), { line: 2, column: 8 });
console.log("  ok   indexToLineColumn accurately maps character index to line & column");

// 2. formatJson and minifyJson
const unformatted = '{"b": 2,  "a":1, "c": [ 3,  4 ] }';
const formatted = formatJson(unformatted, 2);
assert.equal(formatted, '{\n  "b": 2,\n  "a": 1,\n  "c": [\n    3,\n    4\n  ]\n}');
const minified = minifyJson(unformatted);
assert.equal(minified, '{"b":2,"a":1,"c":[3,4]}');
console.log("  ok   formatJson and minifyJson produce clean formatting and compression");

// 3. Key sorting (shallow vs deep)
const nested = {
  z: 1,
  a: {
    y: 2,
    b: 3,
  },
  m: [{ d: 4, c: 5 }],
};

const shallowSorted = sortObjectKeys(nested, false);
assert.deepEqual(Object.keys(shallowSorted), ["a", "m", "z"]);
assert.deepEqual(Object.keys(shallowSorted.a), ["y", "b"]); // Subkeys unchanged

const deepSorted = sortObjectKeys(nested, true);
assert.deepEqual(Object.keys(deepSorted), ["a", "m", "z"]);
assert.deepEqual(Object.keys(deepSorted.a), ["b", "y"]); // Subkeys sorted
assert.deepEqual(Object.keys(deepSorted.m[0]), ["c", "d"]); // Array object keys sorted

const sortedFormatted = sortAndFormatJson(JSON.stringify(nested), true, 2);
assert.ok(sortedFormatted.includes('"b": 3'));
console.log("  ok   sortObjectKeys and sortAndFormatJson support shallow and deep key sorting");

// 4. validateJson valid payload
const validResult = validateJson('{"name": "Salim", "tools": [1, 2, 3]}');
assert.equal(validResult.valid, true);
if (validResult.valid) {
  assert.equal(validResult.stats.type, "object");
  assert.equal(validResult.stats.keysCount, 2);
}
console.log("  ok   validateJson returns structured metadata for valid documents");

// 5. validateJson error location on invalid payload
const invalidJson = '{\n  "name": "Salim",\n  "broken": ,\n  "ok": 1\n}';
const invalidResult = validateJson(invalidJson);
assert.equal(invalidResult.valid, false);
if (!invalidResult.valid) {
  assert.equal(invalidResult.line, 3);
  assert.ok(invalidResult.column !== undefined);
  assert.ok(invalidResult.snippet.includes("broken"));
}
console.log("  ok   validateJson pinpoint exact line, column, and snippet of syntax error");

console.log("\nall checks passed");
