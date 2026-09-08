"use client";

import React, { useCallback, useRef, useState } from "react";
import { Check, Download, ImageIcon, Loader2, Upload } from "lucide-react";

import {
  ICO_SIZES,
  PACK_PNG_SIZES,
  WEBMANIFEST,
  buildIco,
  buildSvgWrapper,
  buildZip,
} from "../lib/encode";

/**
 * Image converter. Everything happens on the client — no upload, no server.
 *
 * The file-format writing lives in ../lib/encode.ts as pure functions so it can
 * be unit-tested in Node against real bytes (it is: CRC32 against the standard
 * vector, ICO directory offsets, and a zip round-tripped through Windows'
 * Expand-Archive byte-for-byte). This file is only the canvas work and the UI.
 */

type Format = "ico" | "png" | "jpeg" | "webp" | "svg" | "pack";

const FORMATS: { id: Format; label: string; note: string }[] = [
  { id: "ico", label: ".ico", note: "multi-size favicon, 16 → 256" },
  { id: "pack", label: "favicon pack", note: "ico + apple touch + PWA + manifest, zipped" },
  { id: "png", label: ".png", note: "lossless, single size" },
  { id: "jpeg", label: ".jpeg", note: "lossy, no transparency" },
  { id: "webp", label: ".webp", note: "smaller than both, well supported" },
  { id: "svg", label: ".svg", note: "wraps the bitmap — does not vectorise" },
];

const SINGLE_SIZES = [16, 32, 64, 128, 256, 512, 1024];

const readableSize = (bytes: number) =>
  bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(2)} MB`;

/** Draw the source into a square canvas of `size`, preserving aspect and centring. */
function drawSquare(source: CanvasImageSource, size: number, naturalW: number, naturalH: number) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d context unavailable");
  ctx.imageSmoothingQuality = "high";

  const scale = Math.min(size / naturalW, size / naturalH);
  const w = naturalW * scale;
  const h = naturalH * scale;
  ctx.drawImage(source, (size - w) / 2, (size - h) / 2, w, h);
  return canvas;
}

const toBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error(`encode failed: ${type}`))), type, quality)
  );

const bytesOf = async (blob: Blob) => new Uint8Array(await blob.arrayBuffer());

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [format, setFormat] = useState<Format>("ico");
  const [size, setSize] = useState(256);
  const [quality, setQuality] = useState(0.85);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; name: string; bytes: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    setError(null);
  };

  const accept = useCallback((next: File) => {
    if (!next.type.startsWith("image/")) {
      setError(`${next.name} is not an image`);
      return;
    }
    reset();
    setFile(next);
    const url = URL.createObjectURL(next);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });

    const probe = new Image();
    probe.onload = () => setDims({ w: probe.naturalWidth, h: probe.naturalHeight });
    probe.onerror = () => setError("that file could not be decoded as an image");
    probe.src = url;
  }, []);

  const loadBitmap = async (source: File): Promise<{ img: HTMLImageElement; w: number; h: number }> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(source);
      img.onload = () => {
        // An SVG without intrinsic dimensions reports 0; fall back to a square
        // big enough that downscaling still looks clean.
        const w = img.naturalWidth || 512;
        const h = img.naturalHeight || 512;
        URL.revokeObjectURL(url);
        resolve({ img, w, h });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("could not decode that image"));
      };
      img.src = url;
    });

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    reset();

    try {
      const { img, w, h } = await loadBitmap(file);
      const base = (file.name.replace(/\.[^.]+$/, "") || "icon").replace(/[^a-z0-9-_]/gi, "-");
      let blob: Blob;
      let name: string;

      if (format === "ico") {
        const entries = await Promise.all(
          ICO_SIZES.map(async (s) => ({
            size: s,
            png: await bytesOf(await toBlob(drawSquare(img, s, w, h), "image/png")),
          }))
        );
        blob = new Blob([buildIco(entries) as BlobPart], { type: "image/x-icon" });
        name = `${base}.ico`;
      } else if (format === "pack") {
        const icoEntries = await Promise.all(
          ICO_SIZES.map(async (s) => ({
            size: s,
            png: await bytesOf(await toBlob(drawSquare(img, s, w, h), "image/png")),
          }))
        );
        const files: { name: string; data: Uint8Array }[] = [
          { name: "favicon.ico", data: buildIco(icoEntries) },
        ];
        for (const s of PACK_PNG_SIZES) {
          const png = await bytesOf(await toBlob(drawSquare(img, s, w, h), "image/png"));
          const label = s === 180 ? "apple-touch-icon.png" : `icon-${s}.png`;
          files.push({ name: label, data: png });
        }
        files.push({ name: "site.webmanifest", data: new TextEncoder().encode(WEBMANIFEST) });
        blob = new Blob([buildZip(files) as BlobPart], { type: "application/zip" });
        name = `${base}-favicons.zip`;
      } else if (format === "svg") {
        const canvas = drawSquare(img, size, w, h);
        const dataUrl = canvas.toDataURL("image/png");
        blob = new Blob([buildSvgWrapper(dataUrl, size, size)], { type: "image/svg+xml" });
        name = `${base}.svg`;
      } else {
        const mime = format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";
        const canvas = drawSquare(img, size, w, h);
        blob = await toBlob(canvas, mime, format === "png" ? undefined : quality);
        name = `${base}-${size}.${format}`;
      }

      setResult({ url: URL.createObjectURL(blob), name, bytes: blob.size });
    } catch (e) {
      setError(e instanceof Error ? e.message : "conversion failed");
    } finally {
      setBusy(false);
    }
  };

  const showQuality = format === "jpeg" || format === "webp";
  const showSize = format === "png" || format === "jpeg" || format === "webp" || format === "svg";

  return (
    <div className="space-y-6">
      {/* Drop zone */}
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
          if (dropped) accept(dropped);
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? "border-blue-500 bg-blue-500/5" : "border-slate-800 hover:border-slate-700"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const picked = e.target.files?.[0];
            if (picked) accept(picked);
          }}
        />

        {preview ? (
          <div className="flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={`Preview of ${file?.name ?? "the selected image"}`}
              className="max-h-40 rounded border border-slate-800 bg-slate-900 object-contain"
            />
            <p className="font-mono text-xs text-slate-400">
              {file?.name} · {dims ? `${dims.w}×${dims.h}` : "…"} ·{" "}
              {file ? readableSize(file.size) : ""}
            </p>
            <p className="font-mono text-[11px] text-slate-600">click to choose another</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <Upload size={22} className="text-slate-600" />
            <p className="font-mono text-sm">drop an image, or click to choose</p>
            <p className="font-mono text-[11px] text-slate-600">
              png · jpeg · webp · gif · svg — nothing leaves your browser
            </p>
          </div>
        )}
      </div>

      {/* Options */}
      <fieldset className="space-y-3">
        <legend className="font-mono text-xs uppercase tracking-widest text-slate-500">Output</legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {FORMATS.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                setFormat(option.id);
                reset();
              }}
              aria-pressed={format === option.id}
              className={`rounded-lg border p-3 text-left transition-colors ${
                format === option.id
                  ? "border-blue-500/60 bg-blue-500/10"
                  : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
              }`}
            >
              <p className="font-mono text-sm text-white">{option.label}</p>
              <p className="mt-0.5 font-mono text-[11px] leading-snug text-slate-500">{option.note}</p>
            </button>
          ))}
        </div>
      </fieldset>

      {showSize && (
        <div>
          <label className="font-mono text-xs uppercase tracking-widest text-slate-500">Size</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {SINGLE_SIZES.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSize(s);
                  reset();
                }}
                aria-pressed={size === s}
                className={`rounded border px-3 py-1.5 font-mono text-xs transition-colors ${
                  size === s
                    ? "border-blue-500/60 bg-blue-500/10 text-blue-300"
                    : "border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {showQuality && (
        <div>
          <label htmlFor="quality" className="font-mono text-xs uppercase tracking-widest text-slate-500">
            Quality — {Math.round(quality * 100)}%
          </label>
          <input
            id="quality"
            type="range"
            min={0.3}
            max={1}
            step={0.05}
            value={quality}
            onChange={(e) => {
              setQuality(Number(e.target.value));
              reset();
            }}
            className="mt-2 w-full accent-blue-500"
          />
        </div>
      )}

      {format === "svg" && (
        <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 font-mono text-[11px] leading-relaxed text-amber-300/90">
          This embeds the bitmap inside an SVG document. It is a real .svg file, but it is not
          vectorised — turning pixels into paths needs tracing, which is a different job.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={convert}
          disabled={!file || busy}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 font-mono text-sm font-bold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600"
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <ImageIcon size={15} />}
          {busy ? "converting…" : "convert"}
        </button>

        {result && (
          <a
            href={result.url}
            download={result.name}
            className="inline-flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-5 py-2.5 font-mono text-sm text-emerald-300 transition-colors hover:border-emerald-400/60"
          >
            <Download size={15} />
            {result.name} · {readableSize(result.bytes)}
          </a>
        )}

        {result && !busy && (
          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-emerald-400">
            <Check size={13} /> done
          </span>
        )}
      </div>

      {error && (
        <p role="alert" className="font-mono text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
