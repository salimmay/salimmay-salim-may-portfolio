"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Download,
  FileCheck,
  FileX,
  Info,
  Loader2,
  MapPin,
  Shield,
  Upload,
} from "lucide-react";
import { detectImageMetadata, orientationLabel, type DetectedMetadata } from "../lib/metadata";

const formatBytes = (bytes: number) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1048576).toFixed(2)} MB`;

export default function MetadataStripper() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<DetectedMetadata | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [outputFormat, setOutputFormat] = useState<"image/jpeg" | "image/png" | "image/webp">("image/jpeg");
  const [quality, setQuality] = useState(0.92);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; size: number; name: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const cleanup = useCallback(() => {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setResult(null);
    setPreviewUrl(null);
    setMetadata(null);
    setDims(null);
    setError(null);
  }, []);

  const processFile = useCallback(
    async (incoming: File) => {
      cleanup();
      setError(null);

      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(incoming.type) && !incoming.name.match(/\.(jpe?g|png|webp)$/i)) {
        setError("Please select a JPEG, PNG, or WebP image file.");
        return;
      }

      setFile(incoming);

      // Set default output format to match input where appropriate
      if (incoming.type === "image/png") setOutputFormat("image/png");
      else if (incoming.type === "image/webp") setOutputFormat("image/webp");
      else setOutputFormat("image/jpeg");

      try {
        // 1. Read binary for metadata inspection
        const buffer = await incoming.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const detected = detectImageMetadata(bytes);
        setMetadata(detected);

        // 2. Prepare preview
        const preview = URL.createObjectURL(incoming);
        previewUrlRef.current = preview;
        setPreviewUrl(preview);

        // 3. Inspect visual dimensions
        if (typeof createImageBitmap !== "undefined") {
          const bitmap = await createImageBitmap(incoming, { imageOrientation: "from-image" });
          setDims({ w: bitmap.width, h: bitmap.height });
          bitmap.close();
        } else {
          const img = new Image();
          img.onload = () => setDims({ w: img.naturalWidth, h: img.naturalHeight });
          img.src = preview;
        }
      } catch (err) {
        setError("Failed to read image data: " + (err instanceof Error ? err.message : String(err)));
      }
    },
    [cleanup]
  );

  const handleStrip = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);

    try {
      let width = dims?.w || 0;
      let height = dims?.h || 0;
      let sourceElement: CanvasImageSource;

      // Use createImageBitmap with explicit imageOrientation: 'from-image'
      // This respects EXIF orientation tags (e.g. portrait phone JPEGs) and redraws pixels upright.
      if (typeof createImageBitmap !== "undefined") {
        const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
        width = bitmap.width;
        height = bitmap.height;
        sourceElement = bitmap;
      } else {
        const img = new Image();
        img.src = previewUrl || URL.createObjectURL(file);
        await img.decode();
        width = img.naturalWidth;
        height = img.naturalHeight;
        sourceElement = img;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not acquire 2D canvas context.");

      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(sourceElement, 0, 0, width, height);

      // Clean up bitmap if used
      if ("close" in sourceElement && typeof (sourceElement as ImageBitmap).close === "function") {
        (sourceElement as ImageBitmap).close();
      }

      // Re-encode freshly from pure canvas pixels — guarantees no EXIF/GPS/Device markers survive
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Canvas export failed"))),
          outputFormat,
          outputFormat === "image/png" ? undefined : quality
        );
      });

      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const ext = outputFormat === "image/jpeg" ? "jpg" : outputFormat === "image/png" ? "png" : "webp";
      const cleanName = `${baseName}-stripped.${ext}`;

      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResult({ url, size: blob.size, name: cleanName });
    } catch (err) {
      setError("Failed to strip metadata: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setBusy(false);
    }
  };

  const extBadge = (mime: string) => {
    if (mime.includes("jpeg")) return "JPEG";
    if (mime.includes("png")) return "PNG";
    if (mime.includes("webp")) return "WebP";
    return "IMAGE";
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Dropzone */}
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
            if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
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
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) processFile(e.target.files[0]);
            }}
          />
          <div className="rounded-full border border-slate-800 bg-slate-900 p-3 text-blue-400">
            <Upload size={22} />
          </div>
          <p className="mt-4 font-bold text-white">Drop a photo here, or click to browse</p>
          <p className="mt-1 text-slate-500">Accepts JPEG, PNG, or WebP. 100% processed in your browser.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3">
            <div className="flex items-center gap-3 truncate">
              <span className="rounded border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-400">
                {extBadge(file.type)}
              </span>
              <span className="truncate text-slate-200" title={file.name}>
                {file.name}
              </span>
              <span className="shrink-0 text-slate-500">({formatBytes(file.size)})</span>
              {dims && (
                <span className="hidden shrink-0 text-slate-600 sm:inline">
                  {dims.w} × {dims.h}px
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                cleanup();
                setFile(null);
              }}
              className="rounded px-2.5 py-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              Choose different file
            </button>
          </div>

          {/* Metadata Audit & Detection Breakdown */}
          {metadata && (
            <div className="rounded-xl border border-slate-800/90 bg-slate-900/50 p-5">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Shield size={14} className="text-blue-400" />
                <h3 className="font-bold text-white">Embedded Metadata Analysis</h3>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {/* GPS Coordinates */}
                <div
                  className={`flex items-start gap-3 rounded-lg border p-3 ${
                    metadata.hasGps
                      ? "border-red-500/30 bg-red-500/10 text-red-300"
                      : "border-slate-800 bg-slate-900/40 text-slate-400"
                  }`}
                >
                  <MapPin size={16} className={metadata.hasGps ? "text-red-400 shrink-0" : "text-slate-600 shrink-0"} />
                  <div>
                    <p className="font-bold">
                      {metadata.hasGps ? "GPS Coordinates Detected!" : "No GPS Metadata Found"}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed opacity-80">
                      {metadata.hasGps
                        ? "Photo contains precise location tags that reveal where it was taken."
                        : "No geolocation coordinates were embedded in the file headers."}
                    </p>
                  </div>
                </div>

                {/* Camera / Device */}
                <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3 text-slate-300">
                  <Info size={16} className="text-slate-500 shrink-0" />
                  <div>
                    <p className="font-bold">Camera & Device Hardware</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {metadata.camera ? `Identified: ${metadata.camera}` : "No specific camera model tag detected."}
                    </p>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3 text-slate-300">
                  <FileCheck size={16} className="text-slate-500 shrink-0" />
                  <div>
                    <p className="font-bold">Timestamp & Date Shot</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {metadata.dateTime ? `Recorded: ${metadata.dateTime}` : "No creation date tag found."}
                    </p>
                  </div>
                </div>

                {/* Orientation */}
                <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3 text-slate-300">
                  <FileX size={16} className="text-slate-500 shrink-0" />
                  <div>
                    <p className="font-bold">
                      EXIF Orientation: {orientationLabel(metadata.orientation).label}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {orientationLabel(metadata.orientation).desc}. Will be rendered upright in pixels.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags summary */}
              {metadata.tagsFound.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-800/80 pt-3">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">Tags identified:</span>
                  {metadata.tagsFound.map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded border border-slate-800 bg-slate-950 px-2 py-0.5 text-[10px] text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Export Controls */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-500">
                Output Format
              </label>
              <div className="mt-1.5 flex gap-2">
                {(["image/jpeg", "image/png", "image/webp"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setOutputFormat(fmt)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-center text-xs transition-colors ${
                      outputFormat === fmt
                        ? "border-blue-500 bg-blue-500/10 text-white"
                        : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {fmt.replace("image/", ".").toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {outputFormat !== "image/png" && (
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="uppercase tracking-wider">Quality</span>
                  <span>{Math.round(quality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.01"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="mt-2.5 w-full accent-blue-500"
                />
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <button
              type="button"
              disabled={busy}
              onClick={handleStrip}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-bold text-white transition-all hover:bg-blue-500 disabled:opacity-50"
            >
              {busy ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Redrawing clean pixels…</span>
                </>
              ) : (
                <>
                  <Shield size={15} />
                  <span>Strip Metadata & Recreate Image</span>
                </>
              )}
            </button>
          </div>

          {/* Success / Result Download Area */}
          {result && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Check size={16} />
                  <span>Metadata Successfully Stripped</span>
                </div>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-400">
                  0 tags remaining
                </span>
              </div>

              <p className="mt-2 text-slate-300">
                The image was re-rasterized through a fresh canvas. All EXIF segments, GPS
                coordinates, timestamps, and thumbnail records have been purged. Visual orientation
                is permanently baked into the pixels.
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-emerald-500/20 pt-4">
                <div className="text-slate-400">
                  <span>Output size: </span>
                  <span className="font-bold text-white">{formatBytes(result.size)}</span>
                  <span className="text-slate-600"> (was {formatBytes(file.size)})</span>
                </div>

                <a
                  href={result.url}
                  download={result.name}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white shadow-lg transition-colors hover:bg-emerald-500"
                >
                  <Download size={14} />
                  <span>Download Clean Image</span>
                </a>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Honest Privacy Notice */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-amber-300/90">
        <div className="flex items-center gap-2 font-bold text-amber-400">
          <AlertTriangle size={14} />
          <span>Honest Privacy Notice</span>
        </div>
        <p className="mt-1.5 leading-relaxed text-amber-200/80">
          Re-encoding draws pixels through a local browser canvas, completely eliminating embedded
          binary metadata (EXIF tags, GPS coordinates, camera serials, timestamps, and hidden thumbnails).
          However, <strong>no software can remove information physically visible inside the photo pixels</strong>
          — such as street signs, house numbers, reflective surfaces, or faces. Inspect your image
          visually before posting publicly.
        </p>
      </div>
    </div>
  );
}
