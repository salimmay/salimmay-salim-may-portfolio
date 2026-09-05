"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  // Kept in a ref rather than state: nothing renders it, and as state it
  // re-rendered this component on every keypress anywhere on the page.
  const sequenceRef = useRef("");

  // 1. Detect "SUDO" typing. Activation happens here, in the event handler,
  // rather than in an effect reacting to the sequence changing.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      sequenceRef.current = (sequenceRef.current + e.key.toLowerCase()).slice(-4);
      if (sequenceRef.current === "sudo") {
        sequenceRef.current = "";
        setIsActive(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Turn off after 5 seconds. The previous version called setTimeout without
  // ever clearing it, so unmounting mid-run left a timer firing at a component
  // that no longer existed.
  useEffect(() => {
    if (!isActive) return;
    const id = window.setTimeout(() => setIsActive(false), 5000);
    return () => window.clearTimeout(id);
  }, [isActive]);

  // 2. Canvas Logic
  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%";
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let x = 0; x < columns; x++) drops[x] = 1;

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0F0";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = letters.charAt(Math.floor(Math.random() * letters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] pointer-events-none bg-black"
        >
          <canvas ref={canvasRef} className="block" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 p-4 border border-green-500 text-green-500 font-mono text-xl">
            ACCESS GRANTED
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}