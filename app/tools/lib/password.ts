/**
 * Pure cryptographically secure password generation and entropy analysis.
 *
 * Uses `crypto.getRandomValues` exclusively with rejection sampling
 * to eliminate modulo bias. Guarantees inclusion of at least one character
 * from every enabled character group, followed by a secure Fisher-Yates shuffle.
 */

export type PasswordOptions = {
  length: number; // 8 to 128
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  avoidAmbiguous: boolean;
};

export type PasswordStrength = {
  entropyBits: number;
  label: "Very Weak" | "Weak" | "Reasonable" | "Strong" | "Very Strong";
  crackTimeEstimate: string;
  score: number; // 0 to 4
};

const POOLS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  upperNoAmbiguous: "ABCDEFGHJKLMNPQRSTUVWXYZ", // Excludes I, O
  lower: "abcdefghijklmnopqrstuvwxyz",
  lowerNoAmbiguous: "abcdefghijkmnpqrstuvwxyz", // Excludes l, o
  numbers: "0123456789",
  numbersNoAmbiguous: "23456789", // Excludes 0, 1
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  symbolsNoAmbiguous: "!@#$%^&*()_+-=[]{};:.<>?", // Excludes |
};

/**
 * Returns a cryptographically unbiased integer in [0, max) using rejection sampling.
 */
export function getSecureRandomInt(max: number): number {
  if (max <= 0) return 0;
  if (max === 1) return 0;

  // Find largest multiple of max that fits in a 32-bit uint
  const limit = Math.floor(0x100000000 / max) * max;
  const buffer = new Uint32Array(1);

  while (true) {
    crypto.getRandomValues(buffer);
    const val = buffer[0];
    if (val < limit) {
      return val % max;
    }
  }
}

/**
 * In-place Fisher-Yates shuffle using cryptographically secure random integers.
 */
export function secureShuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

export function getCharacterPools(options: PasswordOptions): {
  activeGroups: string[];
  combinedPool: string;
} {
  const activeGroups: string[] = [];

  if (options.uppercase) {
    activeGroups.push(options.avoidAmbiguous ? POOLS.upperNoAmbiguous : POOLS.upper);
  }
  if (options.lowercase) {
    activeGroups.push(options.avoidAmbiguous ? POOLS.lowerNoAmbiguous : POOLS.lower);
  }
  if (options.numbers) {
    activeGroups.push(options.avoidAmbiguous ? POOLS.numbersNoAmbiguous : POOLS.numbers);
  }
  if (options.symbols) {
    activeGroups.push(options.avoidAmbiguous ? POOLS.symbolsNoAmbiguous : POOLS.symbols);
  }

  return {
    activeGroups,
    combinedPool: activeGroups.join(""),
  };
}

/**
 * Generates a secure password matching the requested configuration.
 * Throws if no character sets are enabled.
 */
export function generatePassword(options: PasswordOptions): string {
  const length = Math.max(4, Math.min(128, options.length));
  const { activeGroups, combinedPool } = getCharacterPools(options);

  if (!activeGroups.length) {
    throw new Error("At least one character group must be selected.");
  }

  const resultChars: string[] = [];

  // Guarantee at least one character from each selected pool
  for (const group of activeGroups) {
    const charIdx = getSecureRandomInt(group.length);
    resultChars.push(group[charIdx]);
  }

  // Fill remaining length from combined pool
  while (resultChars.length < length) {
    const charIdx = getSecureRandomInt(combinedPool.length);
    resultChars.push(combinedPool[charIdx]);
  }

  // Securely shuffle to eliminate prefix ordering bias
  return secureShuffle(resultChars).join("");
}

/**
 * Calculates Shannon / NIST entropy in bits: length * log2(poolSize)
 */
export function calculateEntropy(length: number, poolSize: number): number {
  if (length <= 0 || poolSize <= 0) return 0;
  return Math.round(length * Math.log2(poolSize) * 10) / 10;
}

/**
 * Evaluates password strength and human-friendly crack time estimate
 * assuming an attacker attempting 100 billion hashes/sec (modern GPU rig).
 */
export function evaluateStrength(
  password: string,
  options: PasswordOptions
): PasswordStrength {
  const { combinedPool } = getCharacterPools(options);
  const poolSize = combinedPool.length || 1;
  const entropy = calculateEntropy(password.length, poolSize);

  let label: PasswordStrength["label"];
  let crackTime: string;
  let score: number;

  if (entropy < 36) {
    label = "Very Weak";
    crackTime = "Instant (< 1 second)";
    score = 0;
  } else if (entropy < 60) {
    label = "Weak";
    crackTime = "A few seconds to hours";
    score = 1;
  } else if (entropy < 80) {
    label = "Reasonable";
    crackTime = "Months to decades";
    score = 2;
  } else if (entropy < 100) {
    label = "Strong";
    crackTime = "Centuries";
    score = 3;
  } else {
    label = "Very Strong";
    crackTime = "Trillions of years";
    score = 4;
  }

  return {
    entropyBits: entropy,
    label,
    crackTimeEstimate: crackTime,
    score,
  };
}
