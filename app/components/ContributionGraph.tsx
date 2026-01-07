"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const generateData = () => {
  const data = [];
  const now = new Date();
  const daysToShow = 140;

  for (let i = 0; i < daysToShow; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (daysToShow - i));
    
    const level = Math.random() > 0.2 ? Math.floor(Math.random() * 4) + 1 : 0;
    data.push({ date, level });
  }
  return data;
};

export default function ContributionGraph() {
  const [data, setData] = useState<{ date: Date; level: number }[]>([]);

  useEffect(() => {
    setData(generateData());
  }, []);

  const getColor = (level: number) => {
    switch (level) {
      case 0: return "bg-zinc-900 border-zinc-800"; 
      case 1: return "bg-indigo-900/40 border-indigo-900/50";
      case 2: return "bg-indigo-700/60 border-indigo-700/70";
      case 3: return "bg-indigo-600 border-indigo-500";
      case 4: return "bg-indigo-400 border-indigo-300 shadow-[0_0_8px_rgba(129,140,248,0.6)]";
      default: return "bg-zinc-900";
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-between items-end mb-2">
        <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
          System Activity
        </div>
        <div className="text-[10px] text-zinc-600 font-mono">
          LAST 5 MONTHS
        </div>
      </div>

      <div className="flex flex-wrap gap-1 justify-end md:justify-start">
        {data.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.005, duration: 0.2 }}
            className={`w-3 h-3 rounded-sm border ${getColor(item.level)} transition-all hover:scale-125 hover:z-10 cursor-crosshair`}
            title={`${item.date.toDateString()}: ${item.level} contributions`}
          />
        ))}
      </div>
    </div>
  );
}