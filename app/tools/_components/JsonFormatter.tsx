"use client";

import React, { useId, useState } from "react";
import {
  AlertCircle,
  ArrowDownAZ,
  Check,
  Code,
  Copy,
  Download,
  FileCheck,
  Minimize2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  formatJson,
  minifyJson,
  sortAndFormatJson,
  validateJson,
  type JsonValidationResult,
} from "../lib/json";

const SAMPLE_JSON = `{
  "portfolio": "Salim May",
  "role": "Software Engineer",
  "toolsSuite": {
    "version": "2.0.0",
    "zeroRemoteDependencies": true,
    "privacy": "100% client-side",
    "readyToolsCount": 11
  },
  "tags": ["typescript", "nextjs", "react", "performance"]
}`;

const formatBytes = (bytes: number) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1048576).toFixed(2)} MB`;

export default function JsonFormatter() {
  const [jsonText, setJsonText] = useState<string>(SAMPLE_JSON);
  const [indentOption, setIndentOption] = useState<number | "\t">(2);
  const [copied, setCopied] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const editorId = useId();

  const validation: JsonValidationResult = validateJson(jsonText);

  const notify = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 2000);
  };

  const handleFormat = () => {
    try {
      const res = formatJson(jsonText, indentOption);
      setJsonText(res);
      notify("Formatted JSON");
    } catch {
      // Keep state, validation card reflects syntax error
    }
  };

  const handleMinify = () => {
    try {
      const res = minifyJson(jsonText);
      setJsonText(res);
      notify("Minified JSON");
    } catch {
      // Keep state
    }
  };

  const handleSortKeys = (deep: boolean) => {
    try {
      const res = sortAndFormatJson(jsonText, deep, indentOption);
      setJsonText(res);
      notify(deep ? "Deeply sorted all keys" : "Sorted top-level keys");
    } catch {
      // Keep state
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleClear = () => {
    setJsonText("");
    notify("Cleared editor");
  };

  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 font-mono text-xs">
      {/* Editor Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Format */}
          <button
            type="button"
            disabled={!validation.valid}
            onClick={handleFormat}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-500 disabled:opacity-40"
          >
            <Code size={13} />
            <span>Format</span>
          </button>

          {/* Minify */}
          <button
            type="button"
            disabled={!validation.valid}
            onClick={handleMinify}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-700 hover:text-white disabled:opacity-40"
          >
            <Minimize2 size={13} />
            <span>Minify</span>
          </button>

          {/* Sort Keys Dropdown / Actions */}
          <button
            type="button"
            disabled={!validation.valid}
            onClick={() => handleSortKeys(false)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-700 hover:text-white disabled:opacity-40"
            title="Sort object keys alphabetically at the root level"
          >
            <ArrowDownAZ size={13} />
            <span>Sort Keys (Top)</span>
          </button>

          <button
            type="button"
            disabled={!validation.valid}
            onClick={() => handleSortKeys(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-700 hover:text-white disabled:opacity-40"
            title="Recursively sort all nested object keys"
          >
            <ArrowDownAZ size={13} />
            <span>Sort Keys (Deep)</span>
          </button>

          {/* Indent option */}
          <select
            value={indentOption === "\t" ? "tab" : indentOption}
            onChange={(e) => {
              const val = e.target.value === "tab" ? "\t" : parseInt(e.target.value, 10);
              setIndentOption(val);
            }}
            aria-label="Indentation spacing"
            className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-300 outline-none"
          >
            <option value={2}>2 Spaces</option>
            <option value={4}>4 Spaces</option>
            <option value="tab">Tabs</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {statusNotice && (
            <span className="text-[11px] text-blue-400 font-bold animate-fade-in">
              {statusNotice}
            </span>
          )}

          {/* Copy */}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            aria-label="Download document.json"
            className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 transition-colors hover:border-slate-700 hover:text-white"
            title="Download document.json"
          >
            <Download size={13} />
          </button>

          {/* Clear */}
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear document text"
            className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-500 transition-colors hover:text-red-400"
            title="Clear text"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Editor Main Text Area */}
      <div className="relative">
        <label htmlFor={editorId} className="sr-only">
          JSON Document Source Editor
        </label>
        <textarea
          id={editorId}
          rows={16}
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder="Paste or type JSON document here..."
          spellCheck={false}
          className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-[12px] leading-relaxed text-slate-200 outline-none transition focus:border-blue-500"
        />
      </div>

      {/* Validation Status & Detailed Metrics Bar */}
      {validation.valid ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-emerald-300">
          <div className="flex items-center gap-2">
            <FileCheck size={16} className="text-emerald-400 shrink-0" />
            <span className="font-bold">Valid JSON Document</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-emerald-400/80">
            <span>Size: {formatBytes(validation.stats.bytes)}</span>
            <span>·</span>
            <span>Lines: {validation.stats.lines}</span>
            <span>·</span>
            <span>
              Root: {validation.stats.type} ({validation.stats.keysCount}{" "}
              {validation.stats.type === "array" ? "items" : "keys"})
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-red-500/40 bg-red-950/20 p-4 text-red-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-red-400">
            <AlertCircle size={15} className="shrink-0" />
            <span>JSON Syntax Error</span>
            {validation.line !== undefined && (
              <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px]">
                Line {validation.line}
                {validation.column !== undefined ? `, Col ${validation.column}` : ""}
              </span>
            )}
          </div>

          <p className="text-[11px] text-red-300/90 leading-relaxed">
            {validation.error}
          </p>

          {validation.snippet && (
            <div className="rounded bg-red-950/40 border border-red-500/20 p-2 font-mono text-[11px] text-red-200">
              <code>{validation.snippet}</code>
            </div>
          )}
        </div>
      )}

      {/* Privacy Guarantee Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-[11px] text-slate-400 leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-slate-300">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>Local Memory & Zero Telemetry Notice</span>
        </div>
        <p className="mt-1">
          JSON formatting, sorting, and syntax parsing are executed 100% inside your browser session.
          No document content or keystrokes are transmitted over the network or logged anywhere.
        </p>
      </div>
    </div>
  );
}
