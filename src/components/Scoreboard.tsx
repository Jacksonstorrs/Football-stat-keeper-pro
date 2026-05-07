"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ScoreboardProps {
  homeScore: number;
  awayScore: number;
  possession: "Home" | "Away";
  down: number;
  distance: number;
  quarter: number;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ homeScore, awayScore, possession, down, distance, quarter }) => {
  const getDownSuffix = (d: number) => {
    if (d === 1) return "st";
    if (d === 2) return "nd";
    if (d === 3) return "rd";
    return "th";
  };

  return (
    <Card className="p-6 bg-slate-900 text-white border-none shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-2">
        <Badge variant="outline" className="text-white border-white/20">Q{quarter}</Badge>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="text-center flex-1">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Home</div>
          <div className="text-5xl font-black tabular-nums">{homeScore}</div>
          {possession === "Home" && <div className="w-2 h-2 bg-amber-400 rounded-full mx-auto mt-2 animate-pulse" />}
        </div>
        
        <div className="px-4 text-2xl font-bold text-slate-600">VS</div>
        
        <div className="text-center flex-1">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Away</div>
          <div className="text-5xl font-black tabular-nums">{awayScore}</div>
          {possession === "Away" && <div className="w-2 h-2 bg-amber-400 rounded-full mx-auto mt-2 animate-pulse" />}
        </div>
      </div>

      <div className="bg-white/10 rounded-lg p-3 flex justify-around items-center">
        <div className="text-center">
          <div className="text-[10px] uppercase text-slate-400 font-bold">Down</div>
          <div className="text-xl font-bold">{down}{getDownSuffix(down)}</div>
        </div>
        <div className="h-8 w-[1px] bg-white/10" />
        <div className="text-center">
          <div className="text-[10px] uppercase text-slate-400 font-bold">To Go</div>
          <div className="text-xl font-bold">{distance === 0 ? "Goal" : distance}</div>
        </div>
      </div>
    </Card>
  );
};

export default Scoreboard;