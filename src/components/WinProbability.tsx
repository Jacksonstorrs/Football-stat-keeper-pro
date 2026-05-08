"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface WinProbabilityProps {
  homeProb: number; // 0-100
  homeTeam: string;
  awayTeam: string;
}

const WinProbability: React.FC<WinProbabilityProps> = ({ homeProb, homeTeam, awayTeam }) => {
  return (
    <Card className="p-4 bg-slate-900 border-white/10 text-white">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">{homeTeam} {homeProb}%</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Win Probability</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-red-400">{awayTeam} {100 - homeProb}%</span>
      </div>
      <div className="relative h-3 w-full bg-red-900/30 rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-1000 ease-in-out"
          style={{ width: `${homeProb}%` }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-0.5 bg-white/20" />
      </div>
    </Card>
  );
};

export default WinProbability;