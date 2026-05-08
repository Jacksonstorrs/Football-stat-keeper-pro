"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Radio } from "lucide-react";

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
    <div className="flex gap-1.5 mt-2 justify-center">
      {[...Array(3)].map((_, i) => (
        <div 
          key={i} 
          className={cn(
            "w-2.5 h-1 rounded-full transition-all duration-500",
            i < count ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "bg-slate-800"
          )} 
        />
      ))}
    </div>
  );

  return (
    <Card className="bg-slate-950 text-white border-none shadow-2xl overflow-hidden relative">
      {/* Top Bar */}
      <div className="bg-slate-900/50 border-b border-white/5 px-6 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Live Broadcast</span>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-white/10 text-slate-400">
            Quarter {quarter}
          </Badge>
        </div>
      </div>
      
      <div className="p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Home Team */}
        <div className="flex-1 text-center md:text-right w-full">
          <div className="flex flex-col md:items-end">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Home</div>
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-1 truncate">{homeTeam}</h2>
            <div className="text-7xl md:text-8xl font-black tabular-nums tracking-tighter leading-none mb-4">
              {homeScore}
            </div>
            <TimeoutDots count={homeTimeouts} />
            {possession === "Home" && (
              <div className="mt-4 flex items-center justify-center md:justify-end gap-2 text-amber-400">
                <Radio className="w-4 h-4 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Possession</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Center Info */}
        <div className="flex flex-col items-center justify-center px-8 py-4 bg-white/5 rounded-3xl border border-white/5 min-w-[160px]">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Game Info</div>
          <div className="space-y-4 w-full">
            <div className="text-center">
              <div className="text-[10px] font-black text-slate-500 uppercase mb-1">Down</div>
              <div className="text-3xl font-black">
                {down}<span className="text-sm font-bold text-slate-500 ml-0.5">{getDownSuffix(down)}</span>
              </div>
            </div>
            <div className="h-[1px] w-full bg-white/5" />
            <div className="text-center">
              <div className="text-[10px] font-black text-slate-500 uppercase mb-1">To Go</div>
              <div className="text-3xl font-black">{distance === 0 ? "Goal" : distance}</div>
            </div>
          </div>
        </div>
        
        {/* Away Team */}
        <div className="flex-1 text-center md:text-left w-full">
          <div className="flex flex-col md:items-start">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Away</div>
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-1 truncate">{awayTeam}</h2>
            <div className="text-7xl md:text-8xl font-black tabular-nums tracking-tighter leading-none mb-4">
              {awayScore}
            </div>
            <TimeoutDots count={awayTimeouts} />
            {possession === "Away" && (
              <div className="mt-4 flex items-center justify-center md:justify-start gap-2 text-amber-400">
                <Radio className="w-4 h-4 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Possession</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 opacity-50" />
    </Card>
  );
};

export default Scoreboard;