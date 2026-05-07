"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ScoreboardProps {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  homeTimeouts: number;
  awayTimeouts: number;
  possession: "Home" | "Away";
  down: number;
  distance: number;
  quarter: number;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ 
  homeTeam, awayTeam, homeScore, awayScore, 
  homeTimeouts, awayTimeouts, possession, 
  down, distance, quarter 
}) => {
  const getDownSuffix = (d: number) => {
    if (d === 1) return "st";
    if (d === 2) return "nd";
    if (d === 3) return "rd";
    return "th";
  };

  const TimeoutDots = ({ count }: { count: number }) => (
    <div className="flex gap-1 mt-1 justify-center">
      {[...Array(3)].map((_, i) => (
        <div 
          key={i} 
          className={cn(
            "w-2 h-2 rounded-full border border-white/20",
            i < count ? "bg-amber-400" : "bg-slate-700"
          )} 
        />
      ))}
    </div>
  );

  return (
    <Card className="p-6 bg-slate-900 text-white border-none shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-2">
        <Badge variant="outline" className="text-white border-white/20 font-mono">Q{quarter}</Badge>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="text-center flex-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 truncate">{homeTeam}</div>
          <div className="text-6xl font-black tabular-nums tracking-tighter">{homeScore}</div>
          <TimeoutDots count={homeTimeouts} />
          {possession === "Home" && <div className="w-full h-1 bg-amber-400 mt-3 rounded-full animate-pulse" />}
        </div>
        
        <div className="px-6 flex flex-col items-center">
          <div className="text-xl font-bold text-slate-700">VS</div>
          <div className="mt-2 text-[10px] font-mono text-slate-500">LIVE</div>
        </div>
        
        <div className="text-center flex-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 truncate">{awayTeam}</div>
          <div className="text-6xl font-black tabular-nums tracking-tighter">{awayScore}</div>
          <TimeoutDots count={awayTimeouts} />
          {possession === "Away" && <div className="w-full h-1 bg-amber-400 mt-3 rounded-full animate-pulse" />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center border border-white/5">
          <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Down</div>
          <div className="text-2xl font-black">{down}<span className="text-sm font-normal text-slate-400 ml-0.5">{getDownSuffix(down)}</span></div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 flex flex-col items-center border border-white/5">
          <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">To Go</div>
          <div className="text-2xl font-black">{distance === 0 ? "Goal" : distance}</div>
        </div>
      </div>
    </Card>
  );
};

export default Scoreboard;