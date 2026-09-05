"use client";

import React, { useEffect, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";
import { motion } from "framer-motion";

import { DATA } from "../../data";

// ---------------------------------------------------------------------------
// Loader for the 3D layout.
//
// It reports REAL progress rather than running a decorative timer: useProgress
// reads three.js's DefaultLoadingManager, so the bar tracks the actual bytes of
// avatar.glb (3.4 MB) and the studio environment map — the two things that
// genuinely make you wait here. A fake spinner would finish at the wrong moment
// in both directions.
//
// The name resolving out of glyph noise is the same motif the hero opens with,
// so the loader reads as the first beat of the page rather than a lid over it.
// Here the resolve is driven by download progress: at 40% loaded, 40% of the
// characters have locked in.
//
// Note the deliberate absence of AnimatePresence. This overlay covers the whole
// page, and AnimatePresence only unmounts a child once its exit animation
// *completes* — so a browser that isn't running animation frames (a background
// tab, most commonly) would leave the overlay sitting on top of the site
// indefinitely. Here the fade is cosmetic and a timer does the removing, so the
// page is always reachable whether or not a single frame ever renders.
// ---------------------------------------------------------------------------

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*<>/[]{}";

// A warm cache finishes almost instantly, and a loader that appears for 80ms
// reads as a flicker. Hold it briefly so the resolve is legible.
const MIN_VISIBLE_MS = 700;
// Failsafe. If avatar.glb never arrives — 404, offline, blocked by a corporate
// proxy — the loader must not sit on top of an otherwise usable page.
const STALL_TIMEOUT_MS = 9000;
// Fade duration, and the slightly longer beat after which the node is removed
// no matter what the animation did.
const FADE_MS = 700;
const REMOVE_AFTER_MS = 850;

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function AvatarLoader() {
  const { active, progress, loaded, total, item } = useProgress();

  const [dismissed, setDismissed] = useState(false); // starts the fade
  const [removed, setRemoved] = useState(false); // takes the node out of the DOM
  const [tick, setTick] = useState(0);
  const [startedAt] = useState(() => (typeof performance !== "undefined" ? performance.now() : 0));
  const scheduled = useRef(false);

  // Churn the unresolved characters. Driven off a tick rather than Math.random()
  // in the render body, so the same tick always produces the same frame.
  useEffect(() => {
    if (dismissed) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 45);
    return () => window.clearInterval(id);
  }, [dismissed]);

  // Dismiss once loading genuinely finishes, honouring the minimum on-screen time.
  useEffect(() => {
    if (scheduled.current || dismissed) return;
    if (active || progress < 100) return;

    scheduled.current = true;
    const elapsed = performance.now() - startedAt;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    const id = window.setTimeout(() => setDismissed(true), wait);
    return () => window.clearTimeout(id);
  }, [active, progress, dismissed, startedAt]);

  // Independent bail-out, armed once on mount so a stalled download can't hold
  // the page hostage.
  useEffect(() => {
    const id = window.setTimeout(() => {
      scheduled.current = true;
      setDismissed(true);
    }, STALL_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, []);

  // Removal on a timer, not on animation completion — see the note above.
  useEffect(() => {
    if (!dismissed) return;
    // The last word on scroll position. Everything above runs while the page is
    // still assembling; this fires once it has its real height, so a restore
    // that slipped through has nothing left to fight over.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const id = window.setTimeout(() => setRemoved(true), REMOVE_AFTER_MS);
    return () => window.clearTimeout(id);
  }, [dismissed]);

  // Nothing below should scroll while the overlay is up — otherwise you can
  // scroll blindly into a page that hasn't finished assembling itself.
  useEffect(() => {
    if (dismissed) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [dismissed]);

  if (removed) return null;

  const name = DATA.personal.name;
  const locked = Math.round((progress / 100) * name.length);
  const display = name
    .split("")
    .map((char, i) => {
      if (char === " ") return " ";
      if (i < locked) return char;
      return GLYPHS[(i * 7 + tick * 3) % GLYPHS.length];
    })
    .join("");

  // item is a URL; the filename is the only informative part of it.
  const file = item ? item.split("?")[0].split("/").pop() : null;

  return (
    <motion.div
      // Scaling up very slightly on the way out reads as the overlay pulling
      // back off the page, rather than a panel being switched off.
      animate={{ opacity: dismissed ? 0 : 1, scale: dismissed ? 1.04 : 1 }}
      transition={{ duration: FADE_MS / 1000, ease: EASE }}
      // Stops intercepting clicks the instant we start fading, so the page is
      // usable during the animation rather than after it.
      style={{ pointerEvents: dismissed ? "none" : "auto" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950"
    >
      <p className="font-mono text-[10px] tracking-[0.4em] text-slate-600">AVATAR.GLB</p>

      <p
        className="mt-5 select-none bg-gradient-to-r from-blue-300 via-white to-violet-300 bg-clip-text font-bold tracking-tight text-transparent"
        style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
      >
        {display}
      </p>

      <div className="mt-9 h-px w-52 overflow-hidden bg-slate-800 md:w-72">
        <div
          className="h-full origin-left bg-gradient-to-r from-blue-400 to-violet-400 transition-transform duration-300 ease-out"
          // Floor of 2% so there's a visible mark before the first byte lands.
          style={{ transform: `scaleX(${Math.max(progress, 2) / 100})` }}
        />
      </div>

      <p className="mt-4 h-4 font-mono text-[10px] tracking-wider text-slate-600">
        {Math.round(progress)}%
        {total > 0 && ` · ${loaded}/${total}`}
        {file && ` · ${file}`}
      </p>
    </motion.div>
  );
}
