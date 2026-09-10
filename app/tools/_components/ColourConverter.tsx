"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  Check,
  Copy,
  Eye,
  RefreshCw,
} from "lucide-react";
import {
  contrastRatio,
  formatHsl,
  formatOklch,
  formatRgb,
  parseHex,
  parseHslString,
  parseOklchString,
  parseRgbString,
  parseColor,
  rgbToHex,
  rgbToHsl,
  rgbToOklch,
  oklchToRgb,
  hslToRgb,
  type RGB,
} from "../lib/color";

type ColorFormatKey = "hex" | "rgb" | "hsl" | "oklch";

const PRESETS = [
  { name: "Electric Blue", hex: "#3b82f6" },
  { name: "Neon Emerald", hex: "#10b981" },
  { name: "Cyber Violet", hex: "#8b5cf6" },
  { name: "Amber Flame", hex: "#f59e0b" },
  { name: "Hot Rose", hex: "#f43f5e" },
  { name: "Teal Matrix", hex: "#06b6d4" },
  { name: "Terminal Green", hex: "#22c55e" },
];

export default function ColourConverter() {
  // Master color source of truth (always valid)
  const [color, setColor] = useState<RGB>({ r: 59, g: 130, b: 246, a: 1 });

  // Separate input strings for each format so users can edit any field without destruction
  const [rawHex, setRawHex] = useState("#3b82f6");
  const [rawRgb, setRawRgb] = useState("rgb(59, 130, 246)");
  const [rawHsl, setRawHsl] = useState("hsl(217, 91%, 60%)");
  const [rawOklch, setRawOklch] = useState("oklch(0.623 0.188 259.8)");
  const [omniInput, setOmniInput] = useState("");

  // Validation errors per field
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Computed values
  const hexVal = rgbToHex(color);
  const hslObj = rgbToHsl(color);
  const oklchObj = rgbToOklch(color);

  // Synchronise all input strings from an RGB object
  const syncInputsFromRgb = (next: RGB) => {
    setColor(next);
    setRawHex(rgbToHex(next));
    setRawRgb(formatRgb(next));
    setRawHsl(formatHsl(rgbToHsl(next)));
    setRawOklch(formatOklch(rgbToOklch(next)));
    setErrors({});
  };

  // 1. Native Color Picker
  const handlePickerChange = (hex: string) => {
    const parsed = parseHex(hex);
    if (parsed) syncInputsFromRgb(parsed);
  };

  // 2. Omni-input: accepts ANY valid CSS color notation
  const handleOmniChange = (val: string) => {
    setOmniInput(val);
    if (!val.trim()) {
      setErrors((prev) => ({ ...prev, omni: null }));
      return;
    }
    const parsed = parseColor(val);
    if (parsed) {
      syncInputsFromRgb(parsed);
      setErrors((prev) => ({ ...prev, omni: null }));
    } else {
      setErrors((prev) => ({
        ...prev,
        omni: "Unrecognized format. Enter HEX (#...), rgb(...), hsl(...), or oklch(...)",
      }));
    }
  };

  // 3. HEX field editing
  const handleHexChange = (val: string) => {
    setRawHex(val);
    const parsed = parseHex(val);
    if (parsed) {
      setColor(parsed);
      setRawRgb(formatRgb(parsed));
      setRawHsl(formatHsl(rgbToHsl(parsed)));
      setRawOklch(formatOklch(rgbToOklch(parsed)));
      setErrors((prev) => ({ ...prev, hex: null }));
    } else {
      setErrors((prev) => ({
        ...prev,
        hex: "Invalid HEX notation (e.g. #fff, #3b82f6, #3b82f680)",
      }));
    }
  };

  // 4. RGB field editing
  const handleRgbChange = (val: string) => {
    setRawRgb(val);
    const parsed = parseRgbString(val);
    if (parsed) {
      setColor(parsed);
      setRawHex(rgbToHex(parsed));
      setRawHsl(formatHsl(rgbToHsl(parsed)));
      setRawOklch(formatOklch(rgbToOklch(parsed)));
      setErrors((prev) => ({ ...prev, rgb: null }));
    } else {
      setErrors((prev) => ({
        ...prev,
        rgb: "Invalid RGB notation (e.g. rgb(59, 130, 246) or rgb(59 130 246 / 0.8))",
      }));
    }
  };

  // 5. HSL field editing
  const handleHslChange = (val: string) => {
    setRawHsl(val);
    const parsed = parseHslString(val);
    if (parsed) {
      const nextRgb = hslToRgb(parsed);
      setColor(nextRgb);
      setRawHex(rgbToHex(nextRgb));
      setRawRgb(formatRgb(nextRgb));
      setRawOklch(formatOklch(rgbToOklch(nextRgb)));
      setErrors((prev) => ({ ...prev, hsl: null }));
    } else {
      setErrors((prev) => ({
        ...prev,
        hsl: "Invalid HSL notation (e.g. hsl(217, 91%, 60%) or hsl(217 91% 60% / 0.8))",
      }));
    }
  };

  // 6. OKLCH field editing
  const handleOklchChange = (val: string) => {
    setRawOklch(val);
    const parsed = parseOklchString(val);
    if (parsed) {
      const nextRgb = oklchToRgb(parsed);
      setColor(nextRgb);
      setRawHex(rgbToHex(nextRgb));
      setRawRgb(formatRgb(nextRgb));
      setRawHsl(formatHsl(rgbToHsl(nextRgb)));
      setErrors((prev) => ({ ...prev, oklch: null }));
    } else {
      setErrors((prev) => ({
        ...prev,
        oklch: "Invalid OKLCH notation (e.g. oklch(0.623 0.188 259.8) or oklch(62% 0.19 260))",
      }));
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const randomize = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    syncInputsFromRgb({ r, g, b, a: 1 });
    setOmniInput("");
  };

  // Contrast calculations for sample text
  const whiteRgb: RGB = { r: 255, g: 255, b: 255, a: 1 };
  const blackRgb: RGB = { r: 0, g: 0, b: 0, a: 1 };
  const darkBgRgb: RGB = { r: 2, g: 6, b: 23, a: 1 }; // slate-950
  const lightBgRgb: RGB = { r: 248, g: 250, b: 252, a: 1 }; // slate-50

  const ratioOnWhite = contrastRatio(color, whiteRgb);
  const ratioOnBlack = contrastRatio(color, blackRgb);
  const ratioAsFgDark = contrastRatio(color, darkBgRgb);
  const ratioAsFgLight = contrastRatio(color, lightBgRgb);

  const formatList: {
    key: ColorFormatKey;
    label: string;
    value: string;
    onChange: (v: string) => void;
    standard: string;
  }[] = [
    {
      key: "hex",
      label: "HEX",
      value: rawHex,
      onChange: handleHexChange,
      standard: "Standard 6/8-digit hexadecimal",
    },
    {
      key: "rgb",
      label: "RGB / RGBA",
      value: rawRgb,
      onChange: handleRgbChange,
      standard: "Red, Green, Blue (0-255) + Alpha",
    },
    {
      key: "hsl",
      label: "HSL / HSLA",
      value: rawHsl,
      onChange: handleHslChange,
      standard: "Hue (0-360°), Saturation & Lightness (%)",
    },
    {
      key: "oklch",
      label: "OKLCH",
      value: rawOklch,
      onChange: handleOklchChange,
      standard: "CSS Color 4 Perceptually Uniform Gamut",
    },
  ];

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Omni-Input & Native Picker Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        {/* Color picker preview tile */}
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-md">
            <input
              type="color"
              value={hexVal.slice(0, 7)}
              onChange={(e) => handlePickerChange(e.target.value)}
              aria-label="Native color picker"
              className="absolute -left-2 -top-2 h-16 w-16 cursor-pointer opacity-0"
            />
            <div
              className="h-full w-full rounded-xl transition-colors"
              style={{ backgroundColor: hexVal }}
            />
          </div>

          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-500">
              Active Color
            </span>
            <span className="text-sm font-bold text-white">{hexVal.toUpperCase()}</span>
          </div>
        </div>

        {/* Universal Paste Field */}
        <div className="flex-1">
          <label className="block text-[11px] uppercase tracking-wider text-slate-500">
            Paste Any CSS Color
          </label>
          <input
            type="text"
            value={omniInput}
            onChange={(e) => handleOmniChange(e.target.value)}
            placeholder="Paste e.g. #3b82f6, rgb(59 130 246), hsl(217 91% 60%), oklch(0.62 0.19 260)..."
            spellCheck={false}
            className={`mt-1 w-full rounded-lg border bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-200 outline-none transition ${
              errors.omni
                ? "border-red-500/70 focus:border-red-500"
                : "border-slate-800 focus:border-blue-500"
            }`}
          />
          {errors.omni && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
              <AlertCircle size={11} /> {errors.omni}
            </p>
          )}
        </div>

        {/* Random button */}
        <button
          type="button"
          onClick={randomize}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
        >
          <RefreshCw size={13} />
          <span>Random</span>
        </button>
      </div>

      {/* Preset Swatches */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] uppercase tracking-wider text-slate-600">Presets:</span>
        {PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => {
              const parsed = parseHex(p.hex);
              if (parsed) syncInputsFromRgb(parsed);
              setOmniInput("");
            }}
            className="flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900/80 px-2 py-1 text-[11px] text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
          >
            <span
              className="h-2.5 w-2.5 rounded-full border border-white/20"
              style={{ backgroundColor: p.hex }}
            />
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      {/* Large Visual Swatch Preview */}
      <div
        className="flex min-h-[160px] flex-col justify-between rounded-xl border border-slate-800 p-6 shadow-2xl transition-colors md:min-h-[180px]"
        style={{ backgroundColor: hexVal }}
      >
        <div className="flex items-center justify-between">
          <span className="rounded bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
            STANDARDS-COMPLIANT sRGB & OKLCH
          </span>
          <span className="rounded bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
            ALPHA: {color.a ?? 1}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-white drop-shadow-md">
          <div className="rounded-lg bg-black/50 px-3 py-1.5 text-xs backdrop-blur-md">
            <span className="opacity-75">sRGB: </span>
            <span className="font-bold">
              {color.r}, {color.g}, {color.b}
            </span>
          </div>
          <div className="rounded-lg bg-black/50 px-3 py-1.5 text-xs backdrop-blur-md">
            <span className="opacity-75">HSL: </span>
            <span className="font-bold">
              {hslObj.h}°, {hslObj.s}%, {hslObj.l}%
            </span>
          </div>
          <div className="rounded-lg bg-black/50 px-3 py-1.5 text-xs backdrop-blur-md">
            <span className="opacity-75">OKLCH L: </span>
            <span className="font-bold">{(oklchObj.l * 100).toFixed(1)}%</span>
            <span className="opacity-75"> C: </span>
            <span className="font-bold">{oklchObj.c}</span>
          </div>
        </div>
      </div>

      {/* Synchronized Editable Formats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Synchronized Editable Notations
          </p>
          <span className="text-[10px] text-slate-600">Edit any field to convert</span>
        </div>

        <div className="grid gap-3">
          {formatList.map((f) => {
            const hasError = !!errors[f.key];
            const isCopied = copiedKey === f.key;

            return (
              <div
                key={f.key}
                className={`rounded-lg border bg-slate-900/60 p-3 transition-colors ${
                  hasError ? "border-red-500/50" : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="w-24 shrink-0 font-bold text-slate-400">{f.label}</span>

                  <input
                    type="text"
                    value={f.value}
                    onChange={(e) => f.onChange(e.target.value)}
                    spellCheck={false}
                    aria-label={`${f.label} value`}
                    className="flex-1 bg-transparent text-sm font-semibold text-slate-200 outline-none placeholder:text-slate-700"
                  />

                  <button
                    type="button"
                    onClick={() => copyToClipboard(f.value, f.key)}
                    className="flex items-center gap-1.5 rounded bg-slate-800/80 px-2.5 py-1 text-[11px] text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                    title={`Copy ${f.label}`}
                  >
                    {isCopied ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-600">
                  <span>{f.standard}</span>
                  {hasError && <span className="text-red-400">{errors[f.key]}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sample Text Showcase: Foreground & Background */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <Eye size={14} className="text-blue-400" />
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            Live Sample Text Legibility
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Mode 1: Active color used as BACKGROUND */}
          <div
            className="rounded-xl border border-slate-800 p-5 space-y-4"
            style={{ backgroundColor: hexVal }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-black/60 drop-shadow-sm">
              Color as Background
            </p>

            {/* White text on this color */}
            <div className="rounded-lg bg-black/20 p-3.5 backdrop-blur-xs">
              <div className="flex items-center justify-between text-white">
                <span className="text-xs font-bold">White Sample Text</span>
                <span className="text-[10px] rounded bg-black/40 px-2 py-0.5">
                  {ratioOnWhite}:1
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-white/90">
                The quick brown fox jumps over the lazy dog. 1234567890.
              </p>
            </div>

            {/* Black text on this color */}
            <div className="rounded-lg bg-white/20 p-3.5 backdrop-blur-xs">
              <div className="flex items-center justify-between text-black">
                <span className="text-xs font-bold">Black Sample Text</span>
                <span className="text-[10px] rounded bg-white/40 px-2 py-0.5">
                  {ratioOnBlack}:1
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-black/90">
                The quick brown fox jumps over the lazy dog. 1234567890.
              </p>
            </div>
          </div>

          {/* Mode 2: Active color used as FOREGROUND */}
          <div className="space-y-3">
            {/* On Dark Surface (slate-950) */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-slate-500">
                  Foreground on Dark (slate-950)
                </span>
                <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] text-slate-400">
                  {ratioAsFgDark}:1
                </span>
              </div>
              <h4 className="mt-2 text-sm font-bold" style={{ color: hexVal }}>
                Primary Heading Text
              </h4>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: hexVal }}>
                Readable UI copy, code tokens, and highlight elements on dark interfaces.
              </p>
            </div>

            {/* On Light Surface (slate-50) */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-slate-600">
                  Foreground on Light (slate-50)
                </span>
                <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] text-slate-700">
                  {ratioAsFgLight}:1
                </span>
              </div>
              <h4 className="mt-2 text-sm font-bold" style={{ color: hexVal }}>
                Primary Heading Text
              </h4>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: hexVal }}>
                Readable UI copy, code tokens, and highlight elements on light interfaces.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
