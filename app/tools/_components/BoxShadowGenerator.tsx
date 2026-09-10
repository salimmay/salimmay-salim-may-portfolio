"use client";

import React, { useId, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Eye,
  EyeOff,
  Layers,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  generateCssSnippet,
  serializeBoxShadow,
  SHADOW_PRESETS,
  type ShadowLayer,
} from "../lib/shadow";

const DEFAULT_LAYERS: ShadowLayer[] = [
  {
    id: "layer-1",
    horizontal: 0,
    vertical: 10,
    blur: 25,
    spread: -5,
    color: "#000000",
    opacity: 0.25,
    inset: false,
    active: true,
  },
  {
    id: "layer-2",
    horizontal: 0,
    vertical: 4,
    blur: 10,
    spread: -5,
    color: "#000000",
    opacity: 0.15,
    inset: false,
    active: true,
  },
];

export default function BoxShadowGenerator() {
  const [layers, setLayers] = useState<ShadowLayer[]>(DEFAULT_LAYERS);
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_LAYERS[0].id);
  const [previewSurface, setPreviewSurface] = useState<"dark" | "light">("dark");
  const [copied, setCopied] = useState<string | null>(null);

  const activeLayer = layers.find((l) => l.id === selectedId) || layers[0];
  const colorPickerId = useId();

  const updateActiveLayer = (patch: Partial<ShadowLayer>) => {
    if (!activeLayer) return;
    setLayers((prev) =>
      prev.map((l) => (l.id === activeLayer.id ? { ...l, ...patch } : l))
    );
  };

  const addLayer = () => {
    const newLayer: ShadowLayer = {
      id: `layer-${Date.now()}`,
      horizontal: 0,
      vertical: 8,
      blur: 16,
      spread: 0,
      color: "#000000",
      opacity: 0.2,
      inset: false,
      active: true,
    };
    setLayers((prev) => [...prev, newLayer]);
    setSelectedId(newLayer.id);
  };

  const removeLayer = (id: string) => {
    if (layers.length <= 1) return; // Keep at least one
    const remaining = layers.filter((l) => l.id !== id);
    setLayers(remaining);
    if (selectedId === id) {
      setSelectedId(remaining[0].id);
    }
  };

  const toggleLayerActive = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, active: !l.active } : l))
    );
  };

  const moveLayer = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= layers.length) return;
    const clone = [...layers];
    const [moved] = clone.splice(index, 1);
    clone.splice(targetIdx, 0, moved);
    setLayers(clone);
  };

  const applyPreset = (presetLayers: Omit<ShadowLayer, "id">[]) => {
    const newLayers = presetLayers.map((l, idx) => ({
      ...l,
      id: `layer-${Date.now()}-${idx}`,
    }));
    setLayers(newLayers);
    setSelectedId(newLayers[0].id);
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  const cssProperty = serializeBoxShadow(layers);
  const cssFullRule = generateCssSnippet(layers);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Presets Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 pb-1">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1">
          <Sparkles size={11} className="text-blue-400" /> Presets:
        </span>
        {SHADOW_PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => applyPreset(p.layers)}
            className="rounded-md border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-[11px] text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
          >
            {p.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => applyPreset(DEFAULT_LAYERS)}
          className="rounded-md border border-slate-800 bg-slate-900/50 px-2 py-1 text-[11px] text-slate-500 transition-colors hover:text-slate-300"
          title="Reset to default"
        >
          <RotateCcw size={11} />
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Layer Management & Layer Controls */}
        <div className="space-y-5 lg:col-span-6">
          {/* Layer Stacking List */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-300 flex items-center gap-1.5">
                <Layers size={13} className="text-blue-400" />
                Shadow Layers ({layers.length})
              </h3>
              <button
                type="button"
                onClick={addLayer}
                className="inline-flex items-center gap-1 rounded border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-blue-300 transition-colors hover:bg-blue-500/20"
              >
                <Plus size={12} />
                <span>Add Layer</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {layers.map((l, index) => {
                const isSelected = l.id === activeLayer?.id;
                return (
                  <div
                    key={l.id}
                    onClick={() => setSelectedId(l.id)}
                    className={`flex items-center justify-between rounded-lg border p-2.5 transition-colors cursor-pointer ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/10 text-white"
                        : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"
                    } ${!l.active ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full border border-white/20"
                        style={{ backgroundColor: l.color }}
                      />
                      <span className="font-bold text-xs">
                        Layer {index + 1}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate">
                        {l.inset ? "inset " : ""}
                        {l.horizontal}px {l.vertical}px {l.blur}px {l.spread}px
                      </span>
                    </div>

                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Move Up */}
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveLayer(index, "up")}
                        aria-label={`Move Layer ${index + 1} up`}
                        className="rounded p-1 text-slate-500 hover:text-white disabled:opacity-20"
                      >
                        <ArrowUp size={12} />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        disabled={index === layers.length - 1}
                        onClick={() => moveLayer(index, "down")}
                        aria-label={`Move Layer ${index + 1} down`}
                        className="rounded p-1 text-slate-500 hover:text-white disabled:opacity-20"
                      >
                        <ArrowDown size={12} />
                      </button>

                      {/* Toggle Active */}
                      <button
                        type="button"
                        onClick={() => toggleLayerActive(l.id)}
                        aria-label={`${l.active ? "Disable" : "Enable"} Layer ${index + 1}`}
                        className="rounded p-1 text-slate-400 hover:text-white"
                      >
                        {l.active ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        disabled={layers.length <= 1}
                        onClick={() => removeLayer(l.id)}
                        aria-label={`Delete Layer ${index + 1}`}
                        className="rounded p-1 text-slate-500 hover:text-red-400 disabled:opacity-20"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Layer Param Controls */}
          {activeLayer && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-200">
                  Editing Selected Layer
                </span>
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={activeLayer.inset}
                    onChange={(e) => updateActiveLayer({ inset: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 accent-blue-500"
                  />
                  <span>Inset Shadow</span>
                </label>
              </div>

              {/* Horizontal offset */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Horizontal Offset (X)</span>
                  <span className="font-bold text-white">{activeLayer.horizontal}px</span>
                </div>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={activeLayer.horizontal}
                  onChange={(e) =>
                    updateActiveLayer({ horizontal: parseInt(e.target.value, 10) })
                  }
                  className="mt-1.5 w-full accent-blue-500"
                />
              </div>

              {/* Vertical offset */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Vertical Offset (Y)</span>
                  <span className="font-bold text-white">{activeLayer.vertical}px</span>
                </div>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={activeLayer.vertical}
                  onChange={(e) =>
                    updateActiveLayer({ vertical: parseInt(e.target.value, 10) })
                  }
                  className="mt-1.5 w-full accent-blue-500"
                />
              </div>

              {/* Blur */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Blur Radius</span>
                  <span className="font-bold text-white">{activeLayer.blur}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={activeLayer.blur}
                  onChange={(e) =>
                    updateActiveLayer({ blur: parseInt(e.target.value, 10) })
                  }
                  className="mt-1.5 w-full accent-blue-500"
                />
              </div>

              {/* Spread */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Spread Radius</span>
                  <span className="font-bold text-white">{activeLayer.spread}px</span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={activeLayer.spread}
                  onChange={(e) =>
                    updateActiveLayer({ spread: parseInt(e.target.value, 10) })
                  }
                  className="mt-1.5 w-full accent-blue-500"
                />
              </div>

              {/* Color & Opacity */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor={colorPickerId} className="block text-[10px] uppercase text-slate-400 font-bold">
                    Shadow Color
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded border border-slate-700 focus-within:ring-2 focus-within:ring-blue-400">
                      <input
                        id={colorPickerId}
                        type="color"
                        value={activeLayer.color}
                        onChange={(e) => updateActiveLayer({ color: e.target.value })}
                        className="absolute -left-2 -top-2 h-12 w-12 cursor-pointer opacity-0"
                      />
                      <div
                        className="h-full w-full"
                        style={{ backgroundColor: activeLayer.color }}
                      />
                    </div>
                    <input
                      type="text"
                      value={activeLayer.color}
                      onChange={(e) => updateActiveLayer({ color: e.target.value })}
                      className="flex-1 rounded border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] uppercase text-slate-400 font-bold">
                    <span>Opacity</span>
                    <span>{Math.round(activeLayer.opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={activeLayer.opacity}
                    onChange={(e) =>
                      updateActiveLayer({ opacity: parseFloat(e.target.value) })
                    }
                    className="mt-2.5 w-full accent-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Dual-Surface Preview & CSS Output */}
        <div className="space-y-4 lg:col-span-6">
          {/* Surface toggle bar */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Interactive Preview
            </span>
            <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-0.5">
              <button
                type="button"
                onClick={() => setPreviewSurface("dark")}
                className={`rounded px-2.5 py-1 text-xs font-bold transition-colors ${
                  previewSurface === "dark"
                    ? "bg-slate-800 text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Dark Canvas
              </button>
              <button
                type="button"
                onClick={() => setPreviewSurface("light")}
                className={`rounded px-2.5 py-1 text-xs font-bold transition-colors ${
                  previewSurface === "light"
                    ? "bg-slate-200 text-slate-900"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Light Canvas
              </button>
            </div>
          </div>

          {/* Render Stage */}
          <div
            className={`flex min-h-[300px] items-center justify-center rounded-2xl border p-8 transition-colors ${
              previewSurface === "dark"
                ? "border-slate-800 bg-slate-950"
                : "border-slate-300 bg-slate-100"
            }`}
          >
            <div
              className={`h-40 w-40 rounded-2xl border transition-all duration-150 flex flex-col items-center justify-center p-4 text-center ${
                previewSurface === "dark"
                  ? "border-slate-800 bg-slate-900 text-slate-200"
                  : "border-slate-200 bg-white text-slate-800"
              }`}
              style={{
                boxShadow: cssProperty,
              }}
            >
              <span className="text-xs font-bold">Element</span>
              <span className="text-[10px] opacity-60 mt-0.5">
                {layers.filter((l) => l.active).length} shadows
              </span>
            </div>
          </div>

          {/* Copyable CSS Code Output */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                CSS Code Output
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyText(cssProperty, "val")}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  {copied === "val" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copied === "val" ? "Copied" : "Copy Value"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => copyText(cssFullRule, "rule")}
                  className="flex items-center gap-1 rounded bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white transition-colors hover:bg-blue-500"
                >
                  {copied === "rule" ? <Check size={12} className="text-emerald-300" /> : <Copy size={12} />}
                  <span>{copied === "rule" ? "Copied Rule" : "Copy Full Rule"}</span>
                </button>
              </div>
            </div>

            <pre className="max-h-36 overflow-x-auto rounded-lg bg-slate-950 p-3 font-mono text-[11px] leading-relaxed text-blue-300/90 whitespace-pre-wrap break-all">
              <code>{cssFullRule}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

