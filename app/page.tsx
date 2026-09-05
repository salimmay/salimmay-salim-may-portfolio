"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { BookOpen, LayoutGrid, Box } from "lucide-react";
import dynamic from "next/dynamic";

// Make sure these paths match where you saved your layout files
import StoryLayout from "./components/layouts/StoryLayout"; 
import BentoLayout from "./components/layouts/BentoLayout";
// 3D relies on WebGL/canvas — load client-only, never during SSR/build.
const ModelLayout = dynamic(() => import("./components/layouts/ModelLayout"), {
  ssr: false,
  loading: () => <div className="h-screen w-full bg-slate-950" />,
});

// Shared Effect Component
import Cursor from "./components/Cursor";
import StatusBar from "./components/StatusBar";
import MatrixRain from "./components/MatrixRain"; 
type LayoutType = 'model' | 'story' | 'bento';

// --- 1. GLOBAL SPOTLIGHT COMPONENT ---
const SpotlightBackground = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
      style={{
        background: useMotionTemplate`
          radial-gradient(
            600px circle at ${mouseX}px ${mouseY}px,
            rgba(59, 130, 246, 0.08),
            transparent 80%
          )
        `,
      }}
    />
  );
};

// Never emits — the snapshot differs per environment, not over time.
const subscribeNever = () => () => {};

// --- MAIN ROUTER COMPONENT ---
export default function PortfolioRouter() {
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('model');
  // Hydration gate, done without setState-in-an-effect (which triggers a second
  // cascading render and is flagged by react-hooks/set-state-in-effect). The
  // server snapshot is false and the client snapshot is true, so React flips
  // this once — and only once — when hydration finishes.
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);

  // Every visit opens on the 3D hero. The layout used to be restored from
  // localStorage, which meant anyone who once clicked Story never saw the hero
  // again — the showcase quietly turned itself off for returning visitors.
  // The toggle still switches freely; the choice just isn't remembered.
  useEffect(() => {
    // The browser restores the previous scroll offset on reload. ModelLayout is
    // client-side only, so the document is one screen tall at that moment and
    // several screens tall a beat later — the restore then lands somewhere
    // arbitrary, which is how a reload could drop you into the projects section.
    // Belt and braces — the inline script in the root layout is what
    // actually wins the race, but this covers client-side navigations.
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // 'instant' matters: <html> carries scroll-smooth, so a plain scrollTo(0,0)
    // animates, and an animating scroll loses to the page still growing.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const switchLayout = (layout: LayoutType) => {
    setCurrentLayout(layout);
    // Jump rather than smooth-scroll: the outgoing layout unmounts underneath
    // the animation, so a smooth scroll finishes against a document that no
    // longer has the height it started with.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  if (!mounted) return <div className="min-h-screen bg-slate-950" />;

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-300 selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* 1. Global Spotlight and Cursor */}
      <MatrixRain />
      <Cursor />
      <SpotlightBackground />
      <StatusBar />

      {/* 2. Floating Toggle Switch */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex justify-center">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-1.5 rounded-full shadow-2xl flex gap-1 ring-1 ring-white/10">
          <ToggleButton 
            isActive={currentLayout === 'story'} 
            onClick={() => switchLayout('story')} 
            icon={<BookOpen size={14} />} 
            label="Story" 
          />
          <ToggleButton 
            isActive={currentLayout === 'model'} 
            onClick={() => switchLayout('model')} 
            icon={<Box size={14} />} 
            label="3D" 
          />
          <ToggleButton 
            isActive={currentLayout === 'bento'} 
            onClick={() => switchLayout('bento')} 
            icon={<LayoutGrid size={14} />} 
            label="System" 
          />
        </div>
      </div>

      {/* 3. Layout Renderer */}
      <AnimatePresence mode="wait">
        
        {currentLayout === 'story' && (
          <motion.div 
            key="story"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <StoryLayout />
          </motion.div>
        )}

        {currentLayout === 'model' && (
          <motion.div 
            key="model"
            // Opacity only, deliberately: a transform (or a filter) on this
            // wrapper would make it the containing block for the layout's
            // position:fixed 3-D stage, which would then size itself to the
            // whole page instead of the viewport.
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10"
          >
            <ModelLayout />
          </motion.div>
        )}

        {currentLayout === 'bento' && (
          <motion.div 
            key="bento"
            initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }} 
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} 
            exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative z-10"
          >
            <BentoLayout />
          </motion.div>
        )}

      </AnimatePresence>

      {/* 4. Shared Footer Status */}
      <footer className="fixed bottom-4 right-4 text-[10px] font-mono text-slate-600 pointer-events-none opacity-50 z-40 hidden md:block">
        VIEW_MODE: {currentLayout.toUpperCase()}
      </footer>

    </main>
  );
}

// --- HELPER COMPONENT ---
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
        className="absolute inset-0 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)]"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
    <span className="relative z-10 flex items-center gap-2">{icon} {label}</span>
  </button>
);