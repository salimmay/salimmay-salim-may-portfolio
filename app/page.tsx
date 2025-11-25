"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, LayoutGrid } from "lucide-react";

import StoryLayout from "./components/layouts/StoryLayout";
import BentoLayout from "./components/layouts/BentoLayout";

// Removed 'resume' since you mentioned you are keeping only System and Story
type LayoutType = 'story' | 'bento';

export default function PortfolioRouter() {
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('story');
  const [mounted, setMounted] = useState(false);

  // 1. Handle Hydration & Persistence
  useEffect(() => {
    const savedLayout = localStorage.getItem('portfolio-pref') as LayoutType;
    if (savedLayout && (savedLayout === 'story' || savedLayout === 'bento')) {
      setCurrentLayout(savedLayout);
    }
    setMounted(true);
  }, []);

  const switchLayout = (layout: LayoutType) => {
    setCurrentLayout(layout);
    localStorage.setItem('portfolio-pref', layout);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Prevent hydration mismatch on first render
  if (!mounted) return <div className="min-h-screen bg-slate-950" />;

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-300 selection:bg-blue-500/30">
      
      {/* --- FLOATING TOGGLE SWITCH (UPDATED: BOTTOM CENTER) --- */}
      {/* Changed: top-6 -> bottom-8, z-50 -> z-[60], added centering logic */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex justify-center pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-1.5 rounded-full shadow-2xl pointer-events-auto flex gap-1">
          <ToggleButton 
            isActive={currentLayout === 'story'} 
            onClick={() => switchLayout('story')} 
            icon={<BookOpen size={14} />} 
            label="Story" 
          />
          <ToggleButton 
            isActive={currentLayout === 'bento'} 
            onClick={() => switchLayout('bento')} 
            icon={<LayoutGrid size={14} />} 
            label="System" 
          />
        </div>
      </div>

      {/* --- LAYOUT RENDERER --- */}
      <AnimatePresence mode="wait">
        
        {currentLayout === 'story' && (
          <motion.div 
            key="story"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <StoryLayout />
          </motion.div>
        )}

        {currentLayout === 'bento' && (
          <motion.div 
            key="bento"
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
          >
            <BentoLayout />
          </motion.div>
        )}

      </AnimatePresence>

      {/* --- SHARED FOOTER --- */}
      <footer className="fixed bottom-4 right-4 text-[10px] text-slate-600 pointer-events-none opacity-50 z-40 hidden md:block">
        Mode: {currentLayout.toUpperCase()}
      </footer>

    </main>
  );
}

// --- HELPER COMPONENT FOR THE BUTTON ---
const ToggleButton = ({ isActive, onClick, icon, label }: { isActive: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`
      relative px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all duration-300
      ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}
    `}
  >
    {isActive && (
      <motion.div 
        layoutId="active-pill"
        className="absolute inset-0 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
    <span className="relative z-10 flex items-center gap-2">{icon} {label}</span>
  </button>
);