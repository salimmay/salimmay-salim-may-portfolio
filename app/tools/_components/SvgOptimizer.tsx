"use client";

import React, { useId, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  FileCode,
  Info,
  Shield,
  Upload,
  Zap,
} from "lucide-react";
import {
  optimizeSvg,
  type SvgOptimizeOptions,
} from "../lib/svg";

const SAMPLE_SVG = `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape">
  <!-- Generator: Hand-crafted SVG Sample -->
  <metadata id="meta">
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <rdf:Description />
    </rdf:RDF>
  </metadata>
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#6366f1" />
    </linearGradient>
  </defs>
  <g id="empty-wrapper"></g>
  <g inkscape:groupmode="layer" inkscape:label="Artwork">
    <circle cx="60" cy="60" r="48" fill="url(#grad)" />
    <path d="M 40 60 L 55 75 L 82 45" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>`;

const formatBytes = (bytes: number) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1048576).toFixed(2)} MB`;

export default function SvgOptimizer() {
  const [inputSvg, setInputSvg] = useState<string>(SAMPLE_SVG);
  const [filename, setFilename] = useState<string>("sample.svg");
  const [options, setOptions] = useState<SvgOptimizeOptions>({
    stripComments: true,
    stripMetadata: true,
    stripEditorData: true,
    stripEmptyContainers: true,
    collapseWhitespace: true,
    removeScriptsAndHandlers: true,
  });
  const [copied, setCopied] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();

  // Compute optimization result synchronously during render
  const { result, error } = useMemo(() => {
    if (!inputSvg.trim()) {
      return { result: null, error: null };
    }
    try {
      const res = optimizeSvg(inputSvg, options);
      return { result: res, error: null };
    } catch (err) {
      return {
        result: null,
        error: err instanceof Error ? err.message : "Failed to optimize SVG",
      };
    }
  }, [inputSvg, options]);

  // Pure sandboxed data URL for safe <img> preview — no state, no effects, no leaks
  const previewDataUrl = result?.optimized
    ? `data:image/svg+xml;utf8,${encodeURIComponent(result.optimized)}`
    : null;

  const handleFileDrop = (incoming: File) => {
    setFileError(null);
    if (!incoming.name.match(/\.svg$/i) && incoming.type !== "image/svg+xml") {
      setFileError("Please select a valid .svg file.");
      return;
    }
    setFilename(incoming.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setInputSvg(content);
        setFileError(null);
      }
    };
    reader.onerror = () => setFileError("Could not read SVG file.");
    reader.readAsText(incoming);
  };

  const copyCode = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  const downloadOptimized = () => {
    if (!result) return;
    const blob = new Blob([result.optimized], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const base = filename.replace(/\.svg$/i, "") || "optimized";
    a.download = `${base}-min.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* File Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const dropped = e.dataTransfer.files?.[0];
          if (dropped) handleFileDrop(dropped);
        }}
        onClick={() => fileInputRef.current?.click()}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        aria-label="Upload an SVG file to optimize"
        className={`flex min-h-[110px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-all focus-within:ring-2 focus-within:ring-blue-500 ${
          dragging
            ? "border-blue-500 bg-blue-500/10 text-white"
            : "border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60"
        }`}
      >
        <input
          id={fileInputId}
          ref={fileInputRef}
          type="file"
          accept=".svg,image/svg+xml"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileDrop(file);
          }}
        />
        <div className="flex items-center gap-2">
          <Upload size={16} className="text-blue-400" />
          <span className="font-bold text-white">
            Drop an SVG file here or click to browse
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Or paste markup directly into the editor below · 100% processed in browser
        </p>
      </div>

      {/* Safety & Optimization Controls */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="font-bold text-slate-300 flex items-center gap-1.5">
            <Zap size={13} className="text-blue-400" />
            Optimization & Security Rules
          </h3>
          <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-300">
            Safe Static Output
          </span>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={options.removeScriptsAndHandlers}
              onChange={(e) =>
                setOptions({ ...options, removeScriptsAndHandlers: e.target.checked })
              }
              className="rounded border-slate-700 bg-slate-900 accent-blue-500"
            />
            <span>Purge scripts & on* handlers</span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={options.stripComments}
              onChange={(e) =>
                setOptions({ ...options, stripComments: e.target.checked })
              }
              className="rounded border-slate-700 bg-slate-900 accent-blue-500"
            />
            <span>Strip XML comments</span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={options.stripMetadata}
              onChange={(e) =>
                setOptions({ ...options, stripMetadata: e.target.checked })
              }
              className="rounded border-slate-700 bg-slate-900 accent-blue-500"
            />
            <span>Strip &lt;metadata&gt; & &lt;desc&gt;</span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={options.stripEditorData}
              onChange={(e) =>
                setOptions({ ...options, stripEditorData: e.target.checked })
              }
              className="rounded border-slate-700 bg-slate-900 accent-blue-500"
            />
            <span>Clean editor namespaces</span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={options.stripEmptyContainers}
              onChange={(e) =>
                setOptions({ ...options, stripEmptyContainers: e.target.checked })
              }
              className="rounded border-slate-700 bg-slate-900 accent-blue-500"
            />
            <span>Remove empty &lt;g&gt; / &lt;defs&gt;</span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={options.collapseWhitespace}
              onChange={(e) =>
                setOptions({ ...options, collapseWhitespace: e.target.checked })
              }
              className="rounded border-slate-700 bg-slate-900 accent-blue-500"
            />
            <span>Collapse extra whitespace</span>
          </label>
        </div>
      </div>

      {/* Metrics Banner */}
      {result && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              Original Size
            </span>
            <p className="mt-1 text-lg font-bold text-slate-300">
              {formatBytes(result.originalBytes)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              Optimized Size
            </span>
            <p className="mt-1 text-lg font-bold text-emerald-400">
              {formatBytes(result.optimizedBytes)}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
              Savings
            </span>
            <p className="mt-1 text-lg font-bold text-emerald-300">
              -{result.savingsPercent}%{" "}
              <span className="text-xs text-emerald-400/80 font-normal">
                ({formatBytes(result.savingsBytes)})
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Applied Passes Breakdown */}
      {result && result.appliedPasses.length > 0 && (
        <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold">
            <Shield size={12} className="text-emerald-400" />
            <span>Applied Optimizations:</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {result.appliedPasses.map((pass, i) => (
              <span
                key={i}
                className="rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300"
              >
                {pass}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Dual Pane: Code vs Visual Preview */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Pane: Code Editor */}
        <div className="space-y-2 lg:col-span-7">
          <div className="flex items-center justify-between">
            <label className="text-[11px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <FileCode size={13} className="text-blue-400" />
              SVG Markup (Editable)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => copyCode(result?.optimized || inputSvg, "opt-code")}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
              >
                {copied === "opt-code" ? (
                  <Check size={11} className="text-emerald-400" />
                ) : (
                  <Copy size={11} />
                )}
                <span>{copied === "opt-code" ? "Copied" : "Copy Optimized"}</span>
              </button>
            </div>
          </div>

          <textarea
            rows={14}
            value={inputSvg}
            onChange={(e) => setInputSvg(e.target.value)}
            spellCheck={false}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] leading-relaxed text-slate-200 outline-none transition focus:border-blue-500"
          />

          {(fileError || error) && (
            <p className="text-[11px] text-red-400" role="alert">
              {fileError || error}
            </p>
          )}
        </div>

        {/* Right Pane: Safe Visual Preview & Download */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl lg:col-span-5 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Sandboxed Visual Render
              </span>
              <span className="text-[10px] text-slate-500">
                Safe static rendering
              </span>
            </div>

            {/* Checkered Canvas Preview Box */}
            <div className="mt-3 flex min-h-[220px] items-center justify-center rounded-xl border border-slate-800 bg-slate-950 p-4">
              {previewDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewDataUrl}
                  alt="Optimized SVG preview"
                  className="max-h-48 max-w-full object-contain"
                />
              ) : (
                <span className="text-slate-600">Provide SVG markup to preview</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              disabled={!result}
              onClick={downloadOptimized}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-blue-500 disabled:opacity-40"
            >
              <Download size={14} />
              <span>Download Optimized SVG</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setInputSvg(SAMPLE_SVG);
                setFilename("sample.svg");
              }}
              className="flex w-full items-center justify-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 py-1"
            >
              <Info size={12} />
              <span>Load sample vector</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security Disclaimer Notice */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-amber-300/90">
        <div className="flex items-center gap-2 font-bold text-amber-400">
          <AlertTriangle size={14} />
          <span>Security & Static Asset Notice</span>
        </div>
        <p className="mt-1.5 leading-relaxed text-amber-200/80">
          This optimizer strips executable scripts, event handlers, and remote references to
          ensure that downloaded files are clean and safe for web delivery. The resulting file is
          a <strong>safe static vector</strong>; interactive animations or JavaScript triggers are
          deliberately eliminated.
        </p>
      </div>
    </div>
  );
}
