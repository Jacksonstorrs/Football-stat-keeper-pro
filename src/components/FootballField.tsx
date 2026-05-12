"use client";

import React from 'react';
import { cn } from "@/lib/utils";

interface FootballFieldProps {
  ballPosition: number; // 0-100
  possession: "Home" | "Away";
  onSpotBall: (yardLine: number) => void;
}

const FootballField: React.FC<FootballFieldProps> = ({ ballPosition, possession, onSpotBall }) => {
  const yardMarkers = Array.from({ length: 11 }, (_, i) => i * 10);
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.round((x / rect.width) * 100);
    onSpotBall(percentage);
  };
  const isRedZone = ballPosition <= 20 || ballPosition >= 80;

  return (
    <div className="w-full space-y-4">
      {/* End Markers */}
      <div className="flex justify-between items-center px-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Home End</span>
        {isRedZone && (
          <div className="flex items-center gap-1.5 animate-pulse">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Red Zone Alert</span>
          </div>
        )}
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Away End</span>
      </div>

      {/* Main Field */}
      <div
        className="relative h-40 w-full bg-emerald-600 dark:bg-emerald-700 rounded-2xl border-4 border-white/20 overflow-hidden cursor-crosshair shadow-2xl"
        onClick={handleClick}
      >
        {/* Red Zone Shading */}
        <div className="absolute inset-y-0 left-0 w-[20%] bg-red-500/10 border-r border-red-500/20" />
        <div className="absolute inset-y-0 right-0 w-[20%] bg-red-500/10 border-l border-red-500/20" />

        {/* Yard Lines */}
        {yardMarkers.map((yard) => (
          <div
            key={yard}
            className={cn(
              "absolute top-0 bottom-0 border-l border-white/30 flex items-center justify-center",
              yard === 50 ? "border-l-2 border-white/60" : ""
            )}
            style={{ left: `${yard}%` }}
          >
            <span className="text-[10px] text-white/40 font-black select-none mt-28">
              {yard === 0 || yard === 100 ? "" : (yard > 50 ? 100 - yard : yard)}
            </span>
          </div>
        ))}

        {/* Grass Texture Effect */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none bg-[repeating-linear-gradient(90deg,transparent,transparent_10%,rgba(0,0,0,0.1)_10%,rgba(0,0,0,0.1)_20%)]"
        />

        {/* Ball Marker */}
        <div          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-5 h-8 bg-amber-900 rounded-full border-2 border-white shadow-2xl transition-all duration-500 ease-out z-10",
            possession === "Home" ? "rotate-12" : "-rotate-12"
          )}
          style={{ left: `calc(${ballPosition}% - 10px)` }}
        >
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/30" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
        </div>

        {/* Ball Position Text */}
        <div className="flex justify-center">
          <div className="px-4 py-1.5 bg-slate-900 dark:bg-white rounded-full shadow-lg">
            <span className="text-xs font-black text-white dark:text-slate-900 uppercase tracking-widest">
              Ball at: {ballPosition > 50 ? `Away ${100 - ballPosition}` : ballPosition === 50 ? "50" : `Home ${ballPosition}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FootballField;