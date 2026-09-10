"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  ArrowLeftRight,
  Check,
  Eye,
  Info,
  X,
} from "lucide-react";
import {
  getWcagReport,
  parseColor,
  parseHex,
  rgbToHex,
  type RGB,
  type WcagReport,
} from "../lib/color";

const PRESETS = [
  { name: "Default High Contrast", fg: "#ffffff", bg: "#020617" },
  { name: "Terminal Cyan", fg: "#38bdf8", bg: "#0b1220" },
  { name: "Amber on Black", fg: "#fbbf24", bg: "#000000" },
  { name: "Dark Text on White", fg: "#0f172a", bg: "#ffffff" },
  { name: "Brand Blue on Dark", fg: "#60a5fa", bg: "#020617" },
  { name: "Low Contrast (Failing)", fg: "#64748b", bg: "#334155" },
];

export default function ContrastChecker() {
  // Master RGB states (always valid)
  const [fgRgb, setFgRgb] = useState<RGB>({ r: 255, g: 255, b: 255, a: 1 });
  const [bgRgb, setBgRgb] = useState<RGB>({ r: 2, g: 6, b: 23, a: 1 }); // slate-950

  // Raw input strings to allow free editing without destroying state on temporary invalid inputs
  const [rawFg, setRawFg] = useState("#ffffff");
  const [rawBg, setRawBg] = useState("#020617");
  const [fgError, setFgError] = useState<string | null>(null);
  const [bgError, setBgError] = useState<string | null>(null);

  const fgHex = rgbToHex(fgRgb);
  const bgHex = rgbToHex(bgRgb);

  // Pure standards-correct WCAG calculation
  const report: WcagReport = getWcagReport(fgRgb, bgRgb);

  const handleFgChange = (val: string) => {
    setRawFg(val);
    const parsed = parseColor(val);
    if (parsed) {
      setFgRgb(parsed);
      setFgError(null);
    } else {
      setFgError("Invalid format. Use HEX, rgb(), or hsl()");
    }
  };

  const handleBgChange = (val: string) => {
    setRawBg(val);
    const parsed = parseColor(val);
    if (parsed) {
      setBgRgb(parsed);
      setBgError(null);
    } else {
      setBgError("Invalid format. Use HEX, rgb(), or hsl()");
    }
  };

  const handleFgPicker = (hex: string) => {
    setRawFg(hex);
    const parsed = parseHex(hex);
    if (parsed) {
      setFgRgb(parsed);
      setFgError(null);
    }
  };

  const handleBgPicker = (hex: string) => {
    setRawBg(hex);
    const parsed = parseHex(hex);
    if (parsed) {
      setBgRgb(parsed);
      setBgError(null);
    }
  };

  const swapColors = () => {
    const tempRgb = fgRgb;
    const tempRaw = rawFg;
    setFgRgb(bgRgb);
    setRawFg(rawBg);
    setBgRgb(tempRgb);
    setRawBg(tempRaw);
    setFgError(null);
    setBgError(null);
  };

  const applyPreset = (fg: string, bg: string) => {
    setRawFg(fg);
    setRawBg(bg);
    const parsedFg = parseColor(fg);
    const parsedBg = parseColor(bg);
    if (parsedFg) setFgRgb(parsedFg);
    if (parsedBg) setBgRgb(parsedBg);
    setFgError(null);
    setBgError(null);
  };

  const criteriaList = [
    { key: "normalAA", data: report.normalTextAA },
    { key: "normalAAA", data: report.normalTextAAA },
    { key: "largeAA", data: report.largeTextAA },
    { key: "largeAAA", data: report.largeTextAAA },
    { key: "uiAA", data: report.uiComponentsAA },
  ];

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Pickers & Inputs Row */}
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        {/* Foreground Input */}
        <div>
          <label htmlFor="fg-text-input" className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            Foreground Color (Text / UI)
          </label>
          <div className="mt-1 flex items-center gap-2">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-inner">
              <input
                id="fg-color-picker"
                type="color"
                value={fgHex.slice(0, 7)}
                onChange={(e) => handleFgPicker(e.target.value)}
                aria-label="Foreground native color picker"
                className="absolute -left-2 -top-2 h-16 w-16 cursor-pointer opacity-0"
              />
              <div
                className="h-full w-full rounded-lg transition-colors"
                style={{ backgroundColor: fgHex }}
                aria-hidden="true"
              />
            </div>

            <div className="flex-1">
              <input
                id="fg-text-input"
                type="text"
                value={rawFg}
                onChange={(e) => handleFgChange(e.target.value)}
                spellCheck={false}
                aria-describedby={fgError ? "fg-error-msg" : undefined}
                className={`w-full rounded-lg border bg-slate-900/90 px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:ring-1 ${
                  fgError
                    ? "border-red-500/70 focus:border-red-500 focus:ring-red-500"
                    : "border-slate-800 focus:border-blue-500 focus:ring-blue-500"
                }`}
              />
            </div>
          </div>
          {fgError && (
            <p id="fg-error-msg" className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
              <AlertCircle size={11} /> {fgError}
            </p>
          )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center pb-0.5">
          <button
            type="button"
            onClick={swapColors}
            title="Swap foreground and background (Alt+S)"
            aria-label="Swap foreground and background colors"
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <ArrowLeftRight size={14} />
            <span className="hidden sm:inline text-[11px]">Swap</span>
          </button>
        </div>

        {/* Background Input */}
        <div>
          <label htmlFor="bg-text-input" className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            Background Color
          </label>
          <div className="mt-1 flex items-center gap-2">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-inner">
              <input
                id="bg-color-picker"
                type="color"
                value={bgHex.slice(0, 7)}
                onChange={(e) => handleBgPicker(e.target.value)}
                aria-label="Background native color picker"
                className="absolute -left-2 -top-2 h-16 w-16 cursor-pointer opacity-0"
              />
              <div
                className="h-full w-full rounded-lg transition-colors"
                style={{ backgroundColor: bgHex }}
                aria-hidden="true"
              />
            </div>

            <div className="flex-1">
              <input
                id="bg-text-input"
                type="text"
                value={rawBg}
                onChange={(e) => handleBgChange(e.target.value)}
                spellCheck={false}
                aria-describedby={bgError ? "bg-error-msg" : undefined}
                className={`w-full rounded-lg border bg-slate-900/90 px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:ring-1 ${
                  bgError
                    ? "border-red-500/70 focus:border-red-500 focus:ring-red-500"
                    : "border-slate-800 focus:border-blue-500 focus:ring-blue-500"
                }`}
              />
            </div>
          </div>
          {bgError && (
            <p id="bg-error-msg" className="mt-1 flex items-center gap-1 text-[11px] text-red-400">
              <AlertCircle size={11} /> {bgError}
            </p>
          )}
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] uppercase tracking-wider text-slate-600">Presets:</span>
        {PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => applyPreset(p.fg, p.bg)}
            className="flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-[11px] text-slate-300 transition-colors hover:border-slate-700 hover:text-white focus-visible:ring-1 focus-visible:ring-blue-400"
          >
            <span
              className="h-2 w-2 rounded-full border border-white/20"
              style={{ backgroundColor: p.fg }}
              aria-hidden="true"
            />
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      {/* Live Contrast Hero Metric */}
      <div
        role="region"
        aria-label="Contrast Ratio Results"
        className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center shadow-lg backdrop-blur-xs"
      >
        <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
          Calculated WCAG 2.1 Contrast Ratio
        </p>

        <div className="mt-2 flex items-baseline justify-center gap-2">
          <span
            className="text-5xl font-extrabold text-white sm:text-6xl tracking-tight"
            aria-label={`Contrast ratio ${report.ratio} to 1`}
          >
            {report.ratio.toFixed(2)}
          </span>
          <span className="text-2xl text-slate-500 font-bold" aria-hidden="true">
            : 1
          </span>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-bold ${
              report.ratio >= 7.0
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : report.ratio >= 4.5
                  ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                  : report.ratio >= 3.0
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                    : "border-red-500/40 bg-red-500/10 text-red-300"
            }`}
          >
            {report.summary}
          </span>
        </div>
      </div>

      {/* Visual Preview Area */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Eye size={14} className="text-blue-400" />
          <h3 className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            Live Visual Preview
          </h3>
        </div>

        <div
          role="region"
          aria-label="Color preview container"
          className="rounded-xl border border-slate-800 p-6 shadow-xl transition-colors md:p-8"
          style={{ backgroundColor: bgHex, color: fgHex }}
        >
          {/* Large text heading */}
          <h4 className="text-2xl font-bold tracking-tight md:text-3xl">
            Large Heading Text (24px / 18pt)
          </h4>

          {/* Regular body copy */}
          <p className="mt-3 max-w-2xl text-sm leading-relaxed opacity-95">
            This paragraph demonstrates body copy legibility. WCAG AA requires at least 4.5:1 for
            regular text below 18pt (or bold below 14pt). High contrast prevents fatigue and ensures
            accessibility in bright sunlight or low-contrast screens.
          </p>

          {/* Interactive UI Mockups */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {/* Outline Button */}
            <button
              type="button"
              tabIndex={-1}
              className="rounded-lg border px-4 py-2 text-xs font-bold transition-opacity"
              style={{ borderColor: fgHex, color: fgHex }}
            >
              Outlined Action
            </button>

            {/* Inverted Solid Button */}
            <button
              type="button"
              tabIndex={-1}
              className="rounded-lg px-4 py-2 text-xs font-bold shadow transition-opacity"
              style={{ backgroundColor: fgHex, color: bgHex }}
            >
              Inverted Solid Action
            </button>

            {/* Input component simulation */}
            <div
              className="flex items-center rounded-lg border px-3 py-2 text-xs"
              style={{ borderColor: fgHex }}
            >
              <span>Form Input Field</span>
            </div>
          </div>
        </div>
      </div>

      {/* WCAG Compliance Criteria Matrix (Not dependent on color alone) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-blue-400" />
            <h3 className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              WCAG 2.1 Criteria Matrix
            </h3>
          </div>
          <span className="text-[10px] text-slate-500">Includes AA & AAA standards</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {criteriaList.map((item) => {
            const isPass = item.data.passed;

            return (
              <div
                key={item.key}
                className={`flex flex-col justify-between rounded-xl border p-4 transition-colors ${
                  isPass
                    ? "border-emerald-500/30 bg-emerald-950/20"
                    : "border-red-500/30 bg-red-950/20"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{item.data.name}</span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 font-mono">
                      Level {item.data.level}
                    </span>
                  </div>

                  <p className="mt-1.5 text-[11px] text-slate-400 leading-relaxed">
                    {item.data.notes}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3">
                  <span className="text-[10px] text-slate-500">
                    Target: {item.data.requiredRatio.toFixed(1)}:1
                  </span>

                  {/* Status Indicator: Uses explicit TEXT badge + distinct ICON + high contrast */}
                  {isPass ? (
                    <span
                      role="status"
                      aria-label={`${item.data.name} Level ${item.data.level}: Pass`}
                      className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/50 bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300"
                    >
                      <Check size={13} className="stroke-[2.5]" aria-hidden="true" />
                      <span>PASS</span>
                    </span>
                  ) : (
                    <span
                      role="status"
                      aria-label={`${item.data.name} Level ${item.data.level}: Fail`}
                      className="inline-flex items-center gap-1.5 rounded-md border border-red-500/50 bg-red-500/20 px-2.5 py-1 text-xs font-bold text-red-300"
                    >
                      <X size={13} className="stroke-[2.5]" aria-hidden="true" />
                      <span>FAIL</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pure Mathematical Standards Documentation */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-[11px] text-slate-400 leading-relaxed">
        <p className="font-bold text-slate-300">
          {"//"} Standards-Compliant Relative Luminance:
        </p>
        <p className="mt-1">
          Luminance is calculated using the official W3C formula: sRGB channels are linearized via{" "}
          <code className="text-slate-300">C &le; 0.04045 ? C / 12.92 : ((C + 0.055) / 1.055)^2.4</code>,
          weighted as <code className="text-slate-300">0.2126 R + 0.7152 G + 0.0722 B</code>, and
          evaluated via <code className="text-slate-300">(L1 + 0.05) / (L2 + 0.05)</code>.
        </p>
      </div>
    </div>
  );
}
