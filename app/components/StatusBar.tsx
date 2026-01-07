"use client";

import React, { useState, useEffect } from "react";
import { GitBranch, Wifi, Clock, Activity, AlertCircle } from "lucide-react";

export default function StatusBar() {
  const [time, setTime] = useState("");
  const [ping, setPing] = useState(24);
  const [isOnline, setIsOnline] = useState(true);

  // 1. Live Clock (Tunis Time)
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en-US", {
        timeZone: "Africa/Tunis",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Simulated Latency Fluctuation
  useEffect(() => {
    const pingTimer = setInterval(() => {
      // Random ping between 20ms and 60ms
      setPing(Math.floor(Math.random() * 40) + 20);
    }, 3000);
    
    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(pingTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-8 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800 flex items-center justify-between px-4 text-[10px] md:text-xs font-mono text-zinc-500 z-50 select-none">
      
      {/* Left: Git Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors cursor-pointer">
          <GitBranch size={12} />
          <span>main*</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5">
          <AlertCircle size={12} className="text-zinc-600" />
          <span>0 errors, 0 warnings</span>
        </div>
      </div>

      {/* Center: Copyright (Mobile only shows this or hides it) */}
      <div className="hidden md:block opacity-50">
        © {new Date().getFullYear()} Salim May // SYSTEM: ONLINE
      </div>

      {/* Right: Network & Time */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 min-w-[60px]">
          <Activity size={12} className={ping > 100 ? "text-yellow-500" : "text-green-500"} />
          <span>{ping}ms</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wifi size={12} className={isOnline ? "text-blue-500" : "text-red-500"} />
          <span className="hidden md:inline">{isOnline ? "UTF-8" : "OFFLINE"}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-300">
          <Clock size={12} />
          <span>{time} TN</span>
        </div>
      </div>
    </div>
  );
}