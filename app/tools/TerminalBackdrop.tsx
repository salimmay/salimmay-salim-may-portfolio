"use client";

import { useEffect, useRef } from "react";

/**
 * Backdrop for /tools.
 *
 * Deliberately not the homepage's nebula-and-planet treatment — that belongs to
 * the hero and repeating it here would make this page read as a copy. This is a
 * phosphor field instead: sparse drifting glyphs behind a CRT vignette, which
 * suits a terminal and is unmistakably a different room in the same house.
 *
 * Everything is drawn on a canvas rather than as DOM nodes, so a few hundred
 * glyphs cost one element instead of a few hundred. It is purely decorative and
 * carries aria-hidden — there is nothing here for a screen reader.
 */

const GLYPHS = "01{}[]()<>/\\|=+-*&^%$#@!?;:~";

type Mote = { x: number; y: number; speed: number; char: string; alpha: number; size: number };

export default function TerminalBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Respect the OS setting: render one static frame and stop.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let motes: Mote[] = [];
    let raf = 0;

    const seed = () => {
      // Density scales with area so a wide monitor isn't sparse and a phone
      // isn't a soup.
      const count = Math.round((width * height) / 26000);
      motes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 4 + Math.random() * 14,
        char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        alpha: 0.05 + Math.random() * 0.16,
        size: 10 + Math.random() * 6,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    let last = performance.now();

    const draw = (now: number) => {
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;

      ctx.clearRect(0, 0, width, height);
      ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";

      for (const mote of motes) {
        mote.y += mote.speed * delta;
        if (mote.y > height + 12) {
          mote.y = -12;
          mote.x = Math.random() * width;
          mote.char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        ctx.fillStyle = `rgba(96, 165, 250, ${mote.alpha})`;
        ctx.font = `${mote.size}px ui-monospace, SFMono-Regular, Menlo, monospace`;
        ctx.fillText(mote.char, mote.x, mote.y);
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);

    if (reduceMotion) {
      // One frame, then leave it alone.
      ctx.font = "12px ui-monospace, monospace";
      for (const mote of motes) {
        ctx.fillStyle = `rgba(96, 165, 250, ${mote.alpha})`;
        ctx.fillText(mote.char, mote.x, mote.y);
      }
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,#0a1120_0%,#020617_60%)]" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* CRT scanlines — 3px pitch, low contrast so it reads as texture. */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* A single bright line sweeping down, like a refresh. */}
      <div className="absolute inset-x-0 top-0 h-16 animate-sweep bg-gradient-to-b from-transparent via-blue-400/[0.045] to-transparent" />

      {/* Vignette, to bend the edges of the "screen". */}
      <div className="absolute inset-0 bg-[radial-gradient(100%_100%_at_50%_50%,transparent_55%,rgba(2,6,23,0.85)_100%)]" />
    </div>
  );
}
