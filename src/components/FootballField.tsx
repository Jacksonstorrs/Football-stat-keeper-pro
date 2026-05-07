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

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-xs font-bold text-muted-foreground px-2">
        <span>HOME</span>
        <span>AWAY</span>
      </div>
      <div 
        className="relative h-32 w-full bg-emerald-600 rounded-lg border-4 border-white/20 overflow-hidden cursor-crosshair shadow-inner"
        onClick={handleClick}
      >
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
            <span className="text-[10px] text-white/40 font-bold select-none mt-20">
              {yard === 0 || yard === 100 ? "" : yard > 50 ? 100 - yard : yard}
            </span>
          </div>
        ))}

        {/* Grass Texture Effect */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[repeating-linear-gradient(90deg,transparent,transparent_10%,rgba(0,0,0,0.1)_10%,rgba(0,0,0,0.1)_20%)]" />

        {/* Ball Marker */}
        <div 
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-4 h-6 bg-amber-800 rounded-full border-2 border-white shadow-lg transition-all duration-300 ease-out",
            possession === "Home" ? "rotate-12" : "-rotate-12"
          )}
          style={{ left: `calc(${ballPosition}% - 8px)` }}
        >
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/50" />
        </div>
      </div>
      <div className="text-center text-sm font-medium text-emerald-700">
        Ball at: {ballPosition > 50 ? `Away ${100 - ballPosition}` : ballPosition === 50 ? "50" : `Home ${ballPosition}`}
      </div>
    </div>
  );
};

export default FootballField;