"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  Code,
  Copy,
  Download,
  FileJson,
  ImageIcon,
  Loader2,
  Palette,
  Sliders,
  Sparkles,
  Upload,
} from "lucide-react";
import {
  extractPalette,
  paletteToCssVariables,
  paletteToHexList,
  paletteToJson,
  type PaletteColor,
} from "../lib/palette";

const SIZES = [5, 6, 7, 8] as const;
type PaletteSize = (typeof SIZES)[number];

const formatBytes = (bytes: number) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1048576).toFixed(2)} MB`;

export default function PaletteExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [paletteSize, setPaletteSize] = useState<PaletteSize>(6);
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [rawPixelData, setRawPixelData] = useState<Uint8ClampedArray | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const cleanup = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
    setPalette([]);
    setRawPixelData(null);
    setError(null);
  }, []);

  // Extracts palette from cached downscaled pixel data when size changes
  const runExtraction = useCallback(
    (pixelData: Uint8ClampedArray, size: PaletteSize) => {
      const extracted = extractPalette(pixelData, size, { minAlpha: 128 });
      setPalette(extracted);
    },
    []
  );

  const processImage = useCallback(
    async (incoming: File) => {
      cleanup();
      setError(null);

      if (!incoming.type.startsWith("image/") && !incoming.name.match(/\.(jpe?g|png|webp|svg|gif|avif)$/i)) {
        setError("Please select an image file (JPEG, PNG, WebP, SVG, GIF).");
        return;
      }

      setFile(incoming);
      setBusy(true);

      try {
        const url = URL.createObjectURL(incoming);
        previewUrlRef.current = url;
        setPreviewUrl(url);

        // Load image into memory for downscaled canvas sampling
        const img = new Image();
        img.crossOrigin = "anonymous";

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Could not decode image."));
          img.src = url;
        });

        // Downscale to max 128px for ultra-fast, non-blocking sampling (< 5ms)
        const MAX_DIM = 128;
        let w = img.naturalWidth || 128;
        let h = img.naturalHeight || 128;

        if (w > MAX_DIM || h > MAX_DIM) {
          if (w > h) {
            h = Math.round((h * MAX_DIM) / w);
            w = MAX_DIM;
          } else {
            w = Math.round((w * MAX_DIM) / h);
            h = MAX_DIM;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, w);
        canvas.height = Math.max(1, h);
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) throw new Error("Could not create 2D canvas context.");

        ctx.drawImage(img, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);

        setRawPixelData(imgData.data);
        runExtraction(imgData.data, paletteSize);
      } catch (err) {
        setError("Failed to process image: " + (err instanceof Error ? err.message : String(err)));
      } finally {
        setBusy(false);
      }
    },
    [cleanup, paletteSize, runExtraction]
  );

  const handleSizeChange = (newSize: PaletteSize) => {
    setPaletteSize(newSize);
    if (rawPixelData) {
      runExtraction(rawPixelData, newSize);
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Dropzone Area */}
      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files?.[0]) processImage(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
            dragging
              ? "border-blue-500 bg-blue-500/10 text-white"
              : "border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) processImage(e.target.files[0]);
            }}
          />
          <div className="rounded-full border border-slate-800 bg-slate-900 p-3 text-blue-400">
            <Upload size={22} />
          </div>
          <p className="mt-4 font-bold text-white">Drop an image here, or click to browse</p>
          <p className="mt-1 text-slate-500">
            Accepts PNG, JPEG, WebP, or SVG. Pure client-side downsampling & extraction.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Header & Configuration Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3">
            <div className="flex items-center gap-3 truncate">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Uploaded thumbnail preview"
                  className="h-9 w-9 rounded-md border border-slate-700 object-cover shadow-xs"
                />
              ) : (
                <span className="rounded border border-blue-500/30 bg-blue-500/10 p-1.5 text-blue-400">
                  <ImageIcon size={14} />
                </span>
              )}
              <span className="truncate text-slate-200 font-bold" title={file.name}>
                {file.name}
              </span>
              <span className="shrink-0 text-slate-500">({formatBytes(file.size)})</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Palette Size Selector (5, 6, 7, 8) */}
              <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
                <span className="px-2 text-[10px] uppercase text-slate-500 flex items-center gap-1">
                  <Sliders size={11} /> Size:
                </span>
                {SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeChange(size)}
                    aria-label={`Extract ${size} colors`}
                    className={`rounded px-2.5 py-0.5 text-xs font-bold transition-colors ${
                      paletteSize === size
                        ? "bg-blue-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  cleanup();
                  setFile(null);
                }}
                className="rounded px-2.5 py-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                Change Image
              </button>
            </div>
          </div>

          {busy && (
            <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
              <Loader2 size={16} className="animate-spin text-blue-400" />
              <span>Downsampling pixels & computing median cuts…</span>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
              {error}
            </div>
          )}

          {!busy && palette.length > 0 && (
            <>
              {/* Unified Palette Ribbon Preview */}
              <div className="overflow-hidden rounded-xl border border-slate-800 shadow-xl">
                <div className="flex h-16 w-full sm:h-20">
                  {palette.map((swatch, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => copyText(swatch.hex, `ribbon-${idx}`)}
                      title={`Click to copy ${swatch.hex} (${swatch.percentage}%)`}
                      className="group relative flex-1 transition-all hover:flex-[1.4]"
                      style={{ backgroundColor: swatch.hex }}
                    >
                      <span className="absolute inset-x-0 bottom-1 truncate text-center text-[10px] font-bold text-white opacity-0 drop-shadow group-hover:opacity-100">
                        {copiedKey === `ribbon-${idx}` ? "Copied!" : swatch.hex}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Individual Swatches Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                    <Palette size={13} className="text-blue-400" />
                    Dominant Palette ({palette.length} Colors)
                  </h3>
                  <span className="text-[10px] text-slate-500">Sorted by prominence</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {palette.map((swatch, idx) => {
                    const isCopied = copiedKey === `card-${idx}`;

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3 transition-colors hover:border-slate-700"
                      >
                        {/* Swatch Tile */}
                        <div
                          className="h-12 w-12 shrink-0 rounded-lg border border-black/20 shadow-md"
                          style={{ backgroundColor: swatch.hex }}
                        />

                        {/* Details */}
                        <div className="flex-1 truncate">
                          <div className="flex items-baseline justify-between">
                            <span className="font-bold text-white text-sm">
                              {swatch.hex.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {swatch.percentage}%
                            </span>
                          </div>

                          <p className="mt-0.5 text-[10px] text-slate-400">
                            rgb({swatch.rgb.r}, {swatch.rgb.g}, {swatch.rgb.b})
                          </p>
                        </div>

                        {/* Copy Button */}
                        <button
                          type="button"
                          onClick={() => copyText(swatch.hex, `card-${idx}`)}
                          className="rounded p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                          title={`Copy ${swatch.hex}`}
                          aria-label={`Copy hex code ${swatch.hex}`}
                        >
                          {isCopied ? (
                            <Check size={14} className="text-emerald-400" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Export & Developer Code Generation */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                    <Code size={13} className="text-blue-400" />
                    Export CSS Custom Properties & JSON
                  </h3>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  {/* Action Toolbar */}
                  <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
                    <button
                      type="button"
                      onClick={() => copyText(paletteToCssVariables(palette), "css-vars")}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
                    >
                      {copiedKey === "css-vars" ? (
                        <>
                          <Check size={13} className="text-emerald-400" />
                          <span className="text-emerald-400">CSS Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy CSS Variables</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        downloadFile(paletteToCssVariables(palette), "palette.css", "text/css")
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
                    >
                      <Download size={13} />
                      <span>Download .css</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => copyText(paletteToJson(palette), "json-data")}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
                    >
                      {copiedKey === "json-data" ? (
                        <>
                          <Check size={13} className="text-emerald-400" />
                          <span className="text-emerald-400">JSON Copied</span>
                        </>
                      ) : (
                        <>
                          <FileJson size={13} />
                          <span>Copy JSON</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        copyText(JSON.stringify(paletteToHexList(palette)), "hex-array")
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
                    >
                      {copiedKey === "hex-array" ? (
                        <>
                          <Check size={13} className="text-emerald-400" />
                          <span className="text-emerald-400">Hex Array Copied</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} />
                          <span>Copy Hex Array</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Code Snippet Box */}
                  <pre className="mt-3 max-h-48 overflow-x-auto rounded-lg bg-slate-950 p-3 font-mono text-[11px] leading-relaxed text-blue-300/90">
                    <code>{paletteToCssVariables(palette)}</code>
                  </pre>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Local Performance & Privacy Note */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-[11px] text-slate-400 leading-relaxed">
        <p className="font-bold text-slate-300">
          {"//"} Zero-Upload Local Processing:
        </p>
        <p className="mt-1">
          Images are downsampled into an in-memory 128px canvas for immediate, non-blocking Median
          Cut Quantization. Transparent pixels are filtered out so alpha PNGs and logos yield true
          content colors. No network requests are made.
        </p>
      </div>
    </div>
  );
}
