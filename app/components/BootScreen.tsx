"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const bootLines = [
  "Initializing SalimOS Kernel v1.0.4...",
  "Loading core modules: [React, Next.js, Tailwind, TypeScript]...",
  "Mounting virtual file system...",
  "Connecting to remote server (Tunis, TN)... SUCCESS",
  "Verifying user permissions... ROOT ACCESS GRANTED",
  "Starting graphical user interface...",
  "Welcome, Admin."
];

export default function BootScreen() {
  const [lines, setLines] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 1. Check LocalStorage for timestamp
    const lastBoot = localStorage.getItem("boot_timestamp");
    const now = Date.now();
    const threeHoursInMs = 3 * 60 * 60 * 1000;

    // 2. If booted recently (< 3 hours), skip animation
    if (lastBoot && (now - parseInt(lastBoot) < threeHoursInMs)) {
      setIsVisible(false);
      return;
    }

    // Play boot sequence
    let delay = 0;
    bootLines.forEach((line, index) => {
      delay += Math.floor(Math.random() * 300) + 100;
      
      setTimeout(() => {
        setLines((prev) => [...prev, line]);
      }, delay);
    });

    // Finish boot
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("hasBooted", "true");
    }, delay + 800);

  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[9999] bg-black text-blue-500 font-mono text-sm md:text-base p-8 md:p-16 flex flex-col justify-end overflow-hidden cursor-wait"
        >
          <div className="max-w-2xl w-full">
            {lines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-1"
              >
                <span className="text-zinc-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                <span className={i === bootLines.length - 1 ? "text-white font-bold" : "text-blue-500"}>
                  {`> ${line}`}
                </span>
              </motion.div>
            ))}
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-2 h-4 bg-blue-500 ml-1 align-middle"
            />
          </div>
          
          {/* Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}