import assert from "node:assert/strict";
import {
  getSecureRandomInt,
  secureShuffle,
  generatePassword,
  calculateEntropy,
  evaluateStrength,
} from "./password.ts";

console.log("── CRYPTOGRAPHIC PASSWORD GENERATOR ──");

// 1. getSecureRandomInt bounds
for (let i = 0; i < 50; i++) {
  const n = getSecureRandomInt(10);
  assert.ok(n >= 0 && n < 10);
}
console.log("  ok   getSecureRandomInt stays strictly within [0, max)");

// 2. Fisher-Yates secureShuffle
const arr = [1, 2, 3, 4, 5, 6, 7, 8];
const shuffled = secureShuffle([...arr]);
assert.equal(shuffled.length, arr.length);
assert.deepEqual([...shuffled].sort(), [...arr].sort());
console.log("  ok   secureShuffle preserves all elements without duplication");

// 3. Guaranteed character group inclusion
const optsAll = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  avoidAmbiguous: false,
};

for (let i = 0; i < 20; i++) {
  const pass = generatePassword(optsAll);
  assert.equal(pass.length, 16);
  assert.ok(/[A-Z]/.test(pass), "Must contain uppercase");
  assert.ok(/[a-z]/.test(pass), "Must contain lowercase");
  assert.ok(/[0-9]/.test(pass), "Must contain number");
  assert.ok(/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(pass), "Must contain symbol");
}
console.log("  ok   guarantees at least one character from every enabled group");

// 4. Avoid ambiguous characters
const optsNoAmbiguous = {
  length: 32,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  avoidAmbiguous: true,
};

for (let i = 0; i < 20; i++) {
  const pass = generatePassword(optsNoAmbiguous);
  // Excluded characters: I, O, l, o, 0, 1, |
  assert.ok(!/[IOlo01|]/.test(pass), `Should not contain ambiguous characters, got ${pass}`);
}
console.log("  ok   strictly excludes ambiguous characters when option enabled");

// 5. Invalid configuration rejection
assert.throws(
  () =>
    generatePassword({
      length: 12,
      uppercase: false,
      lowercase: false,
      numbers: false,
      symbols: false,
      avoidAmbiguous: false,
    }),
  /At least one character group/
);
console.log("  ok   rejects empty character group configuration with descriptive error");

// 6. Entropy calculation
// 16 chars from 94 printable ASCII pool -> 16 * log2(94) ≈ 104.9 bits
const entropy = calculateEntropy(16, 94);
assert.ok(entropy > 100 && entropy < 110);
const strength = evaluateStrength("aB3!eK9#mQ2$pL7*", optsAll);
assert.equal(strength.label, "Very Strong");
console.log("  ok   calculates accurate Shannon entropy and strength tier");

console.log("\nall checks passed");

