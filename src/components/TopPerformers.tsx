"use client";

import React from 'react';
import { Player, PlayerStats } from "@/types/football";
import { Card } from "@/components/ui/card";
import { Target, TrendingUp, Star } from "lucide-react";

interface TopPerformersProps {
  stats: Record<string, PlayerStats>;
  roster: { home: Player[], away: Player[] };
}

const TopPerformers: React.FC<TopPerformersProps> = ({ stats, roster }) => {
  const allPlayers = [...roster.home, ...roster.away];
  
  const topPasser = allPlayers
    .map(p => ({ ...p, s: stats[p.id] }))
    .filter(p => p.s && p.s.passYds > 0)
    .sort((a, b) => (b.s?.passYds || 0) - (a.s?.passYds || 0))[0];

  const topRusher = allPlayers
    .map(p => ({ ...p, s: stats[p.id] }))
    .filter(p => p.s && p.s.rushYds > 0)
    .sort((a, b) => (b.s?.rushYds || 0) - (a.s?.rushYds || 0))[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {topPasser && (
        <Card className="p-4 bg-blue-900/20 border-blue-500/20 text-white flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-black text-blue-400 uppercase">Top Passer</div>
            <div className="font-bold text-sm">{topPasser.name}</div>
            <div className="text-xs text-slate-400">{topPasser.s?.passYds} YDS • {topPasser.s?.passTDs} TD</div>
          </div>
        </Card>
      )}
      {topRusher && (
        <Card className="p-4 bg-emerald-900/20 border-emerald-500/20 text-white flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-black text-emerald-400 uppercase">Top Rusher</div>
            <div className="font-bold text-sm">{topRusher.name}</div>
            <div className="text-xs text-slate-400">{topRusher.s?.rushYds} YDS • {topRusher.s?.rushTDs} TD</div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TopPerformers;