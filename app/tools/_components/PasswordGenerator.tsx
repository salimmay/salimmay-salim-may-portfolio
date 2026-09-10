"use client";

import React, { useCallback, useState } from "react";
import {
  Check,
  Copy,
  KeyRound,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  evaluateStrength,
  generatePassword,
  type PasswordOptions,
  type PasswordStrength,
} from "../lib/password";

const DEFAULT_OPTIONS: PasswordOptions = {
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  avoidAmbiguous: false,
};

export default function PasswordGenerator() {
  const [options, setOptions] = useState<PasswordOptions>(DEFAULT_OPTIONS);
  const [password, setPassword] = useState<string>(() => {
    try {
      return generatePassword(DEFAULT_OPTIONS);
    } catch {
      return "";
    }
  });
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasAnyGroup =
    options.uppercase || options.lowercase || options.numbers || options.symbols;

  const updateOptions = (patch: Partial<PasswordOptions>) => {
    const next = { ...options, ...patch };
    setOptions(next);
    const hasGroup = next.uppercase || next.lowercase || next.numbers || next.symbols;
    if (!hasGroup) {
      setError("Please select at least one character set.");
      setPassword("");
    } else {
      setError(null);
      try {
        setPassword(generatePassword(next));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate password");
      }
    }
  };

  const handleGenerate = useCallback(() => {
    setError(null);
    if (!hasAnyGroup) {
      setError("Please select at least one character set.");
      setPassword("");
      return;
    }

    try {
      const generated = generatePassword(options);
      setPassword(generated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate password");
    }
  }, [hasAnyGroup, options]);

  const copyPassword = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const strength: PasswordStrength | null = password
    ? evaluateStrength(password, options)
    : null;

  const strengthColor =
    strength?.score === 4
      ? "bg-emerald-500 text-emerald-300 border-emerald-500/40"
      : strength?.score === 3
        ? "bg-blue-500 text-blue-300 border-blue-500/40"
        : strength?.score === 2
          ? "bg-amber-500 text-amber-300 border-amber-500/40"
          : "bg-red-500 text-red-300 border-red-500/40";

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Primary Password Display Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5">
            <KeyRound size={13} className="text-blue-400" />
            Generated Secure Password
          </span>
          {strength && (
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${strengthColor}`}
            >
              {strength.label} ({strength.entropyBits} bits)
            </span>
          )}
        </div>

        {/* Display Box */}
        <div className="mt-3 flex flex-col sm:flex-row items-stretch gap-2">
          <div className="flex-1 flex items-center overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm font-bold text-slate-100 tracking-wider break-all select-all">
            {password || (error ? "Configuration Invalid" : "Generating…")}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={!password}
              onClick={copyPassword}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-3 font-bold text-white transition-colors hover:bg-blue-500 disabled:opacity-40"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-300" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleGenerate}
              aria-label="Regenerate password"
              className="inline-flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900 p-3 text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Visual Strength Progress Bar */}
        {strength && (
          <div className="mt-4 space-y-1.5">
            <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-slate-800">
              {[0, 1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-full flex-1 transition-all ${
                    step <= strength.score ? strengthColor.split(" ")[0] : "bg-transparent"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
              <span>Estimated Crack Time:</span>
              <span className="font-bold text-slate-300">{strength.crackTimeEstimate}</span>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-3 text-[11px] text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Configuration Controls */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-5">
        <h3 className="font-bold text-slate-200">Password Configuration</h3>

        {/* Length Slider & Number Input */}
        <div>
          <div className="flex items-center justify-between text-[11px]">
            <label htmlFor="length-slider" className="uppercase tracking-wider text-slate-400 font-bold">
              Password Length
            </label>
            <span className="rounded bg-slate-800 px-2.5 py-0.5 text-sm font-bold text-white">
              {options.length} characters
            </span>
          </div>
          <input
            id="length-slider"
            type="range"
            min={8}
            max={64}
            value={options.length}
            onChange={(e) =>
              updateOptions({ length: parseInt(e.target.value, 10) })
            }
            className="mt-2.5 w-full accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
            <span>8 (Minimum)</span>
            <span>16 (Standard)</span>
            <span>24 (Recommended)</span>
            <span>64 (Maximum)</span>
          </div>
        </div>

        {/* Character Set Toggles */}
        <div className="space-y-3 pt-1">
          <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            Character Groups (At least one required)
          </span>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-slate-300 cursor-pointer hover:border-slate-700">
              <div>
                <span className="block font-bold">Uppercase Letters</span>
                <span className="block text-[10px] text-slate-500">A-Z</span>
              </div>
              <input
                type="checkbox"
                checked={options.uppercase}
                onChange={(e) =>
                  updateOptions({ uppercase: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 accent-blue-500"
              />
            </label>

            <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-slate-300 cursor-pointer hover:border-slate-700">
              <div>
                <span className="block font-bold">Lowercase Letters</span>
                <span className="block text-[10px] text-slate-500">a-z</span>
              </div>
              <input
                type="checkbox"
                checked={options.lowercase}
                onChange={(e) =>
                  updateOptions({ lowercase: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 accent-blue-500"
              />
            </label>

            <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-slate-300 cursor-pointer hover:border-slate-700">
              <div>
                <span className="block font-bold">Numbers</span>
                <span className="block text-[10px] text-slate-500">0-9</span>
              </div>
              <input
                type="checkbox"
                checked={options.numbers}
                onChange={(e) =>
                  updateOptions({ numbers: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 accent-blue-500"
              />
            </label>

            <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-slate-300 cursor-pointer hover:border-slate-700">
              <div>
                <span className="block font-bold">Symbols & Punctuation</span>
                <span className="block text-[10px] text-slate-500">!@#$%^&*()_+-=[]{}|;:...</span>
              </div>
              <input
                type="checkbox"
                checked={options.symbols}
                onChange={(e) =>
                  updateOptions({ symbols: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 accent-blue-500"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 pt-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={options.avoidAmbiguous}
              onChange={(e) =>
                updateOptions({ avoidAmbiguous: e.target.checked })
              }
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 accent-blue-500"
            />
            <span>
              Avoid ambiguous characters (excludes{" "}
              <code className="text-slate-400">0, O, o, 1, l, I, |</code> for easier transcription)
            </span>
          </label>
        </div>
      </div>

      {/* Privacy Guarantee Box */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-emerald-300/90">
        <div className="flex items-center gap-2 font-bold text-emerald-400">
          <ShieldCheck size={14} />
          <span>Local Cryptographic Guarantee</span>
        </div>
        <p className="mt-1.5 leading-relaxed text-emerald-200/80">
          Passwords are synthesized locally using the browser&apos;s CSPRNG (
          <code className="text-emerald-300">window.crypto.getRandomValues</code>) with unbiased
          Fisher-Yates shuffling. No math-random, no network requests, and zero telemetry. Generated
          values exist solely in memory and are discarded when you navigate away.
        </p>
      </div>
    </div>
  );
}
