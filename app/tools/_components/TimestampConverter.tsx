"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  Check,
  Clock,
  Copy,
  Globe,
  History,
  RotateCcw,
  Timer,
} from "lucide-react";
import {
  formatLocalTime,
  getLocalTimeZone,
  parseTimestampInput,
  type ParseResult,
} from "../lib/timestamp";

export default function TimestampConverter() {
  // Live ticking clock state
  const [now, setNow] = useState<Date | null>(() => (typeof window !== "undefined" ? new Date() : null));

  // User input initialized to current epoch seconds
  const [inputValue, setInputValue] = useState<string>(() =>
    Math.floor(Date.now() / 1000).toString()
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const localTz = getLocalTimeZone();
  const parseResult: ParseResult = parseTimestampInput(inputValue, now || new Date());

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const setPreset = (val: string | number) => {
    setInputValue(val.toString());
  };

  const currentSeconds = now ? Math.floor(now.getTime() / 1000) : 0;
  const currentMillis = now ? now.getTime() : 0;

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Live Current Epoch Clock Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-slate-300 font-bold">
            <Timer size={15} className="text-emerald-400 animate-pulse" />
            <span>Current Epoch Clock (Live)</span>
          </div>
          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
            {localTz}
          </span>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* Current Unix Seconds */}
          <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3">
            <div>
              <span className="block text-[10px] uppercase text-slate-500 font-bold">
                Unix Seconds
              </span>
              <span className="text-base font-bold text-emerald-400">
                {currentSeconds || "…"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(currentSeconds.toString(), "now-sec")}
              className="rounded p-2 text-slate-500 transition-colors hover:text-white"
              title="Copy current seconds"
            >
              {copiedKey === "now-sec" ? (
                <Check size={13} className="text-emerald-400" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          </div>

          {/* Current Unix Milliseconds */}
          <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3">
            <div>
              <span className="block text-[10px] uppercase text-slate-500 font-bold">
                Unix Milliseconds
              </span>
              <span className="text-base font-bold text-emerald-400">
                {currentMillis || "…"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(currentMillis.toString(), "now-ms")}
              className="rounded p-2 text-slate-500 transition-colors hover:text-white"
              title="Copy current milliseconds"
            >
              {copiedKey === "now-ms" ? (
                <Check size={13} className="text-emerald-400" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Input Field & Shortcuts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
            <Clock size={13} className="text-blue-400" />
            Timestamp or ISO Date Input
          </label>
          {parseResult.valid && (
            <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-300 font-bold">
              Detected: {parseResult.detectedType}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. 1788976800, 1788976800000, 2026-09-09T18:00:00Z..."
            className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => setInputValue(Math.floor(Date.now() / 1000).toString())}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs font-bold text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Set to Now</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] uppercase text-slate-500 font-bold">Presets:</span>
          <button
            type="button"
            onClick={() => setPreset(Math.floor(Date.now() / 1000) - 3600)}
            className="rounded border border-slate-800 bg-slate-900/60 px-2 py-0.5 text-[11px] text-slate-400 hover:text-white"
          >
            -1 Hour
          </button>
          <button
            type="button"
            onClick={() => setPreset(Math.floor(Date.now() / 1000) - 86400)}
            className="rounded border border-slate-800 bg-slate-900/60 px-2 py-0.5 text-[11px] text-slate-400 hover:text-white"
          >
            Yesterday
          </button>
          <button
            type="button"
            onClick={() => setPreset(0)}
            className="rounded border border-slate-800 bg-slate-900/60 px-2 py-0.5 text-[11px] text-slate-400 hover:text-white"
          >
            Epoch (1970)
          </button>
          <button
            type="button"
            onClick={() => setPreset(-14182980)} // July 20, 1969
            className="rounded border border-slate-800 bg-slate-900/60 px-2 py-0.5 text-[11px] text-slate-400 hover:text-white"
          >
            Moon Landing (1969)
          </button>
        </div>
      </div>

      {/* Conversion Output Grid */}
      {parseResult.valid ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-200 flex items-center gap-1.5">
              <Calendar size={13} className="text-blue-400" />
              Converted Representations
            </h3>
            <span className="text-xs text-slate-400">
              {parseResult.parsed.relativeTime}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* UTC Date String */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-slate-500 font-bold flex items-center gap-1">
                  <Globe size={11} className="text-blue-400" />
                  UTC (Coordinated Universal Time)
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(parseResult.parsed.utcString, "utc")}
                  className="text-slate-500 hover:text-white"
                >
                  {copiedKey === "utc" ? (
                    <Check size={12} className="text-emerald-400" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>
              <p className="text-xs font-bold text-white">
                {parseResult.parsed.utcString}
              </p>
            </div>

            {/* Local Timezone Date String */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-slate-500 font-bold flex items-center gap-1">
                  <Clock size={11} className="text-violet-400" />
                  Your Local Timezone ({localTz})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(formatLocalTime(parseResult.parsed.date), "local")
                  }
                  className="text-slate-500 hover:text-white"
                >
                  {copiedKey === "local" ? (
                    <Check size={12} className="text-emerald-400" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>
              <p className="text-xs font-bold text-white">
                {formatLocalTime(parseResult.parsed.date)}
              </p>
            </div>

            {/* ISO 8601 */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-slate-500 font-bold">
                  ISO 8601 Format
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(parseResult.parsed.iso8601, "iso")}
                  className="text-slate-500 hover:text-white"
                >
                  {copiedKey === "iso" ? (
                    <Check size={12} className="text-emerald-400" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>
              <p className="text-xs font-bold text-slate-200">
                {parseResult.parsed.iso8601}
              </p>
            </div>

            {/* Relative Time Breakdown */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-slate-500 font-bold flex items-center gap-1">
                  <History size={11} className="text-amber-400" />
                  Relative Time
                </span>
              </div>
              <p className="text-xs font-bold text-amber-300">
                {parseResult.parsed.relativeTime}
              </p>
            </div>

            {/* Unix Seconds */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-slate-500 font-bold">
                  Unix Timestamp (Seconds)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(parseResult.parsed.unixSeconds.toString(), "sec")
                  }
                  className="text-slate-500 hover:text-white"
                >
                  {copiedKey === "sec" ? (
                    <Check size={12} className="text-emerald-400" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>
              <p className="text-xs font-bold text-slate-200">
                {parseResult.parsed.unixSeconds}
              </p>
            </div>

            {/* Unix Milliseconds */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-slate-500 font-bold">
                  Unix Timestamp (Milliseconds)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      parseResult.parsed.unixMilliseconds.toString(),
                      "millis"
                    )
                  }
                  className="text-slate-500 hover:text-white"
                >
                  {copiedKey === "millis" ? (
                    <Check size={12} className="text-emerald-400" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>
              <p className="text-xs font-bold text-slate-200">
                {parseResult.parsed.unixMilliseconds}
              </p>
            </div>
          </div>

          {parseResult.parsed.isBefore1970 && (
            <p className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-[11px] text-blue-300">
              Note: This timestamp is negative, indicating a date prior to the Unix epoch (January 1, 1970 00:00:00 UTC).
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400" role="alert">
          {parseResult.error}
        </div>
      )}
    </div>
  );
}
