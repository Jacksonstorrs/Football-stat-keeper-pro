"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { Play } from "@/types/football";

interface TeamStatsProps {
  plays: Play[];
  team: "Home" | "Away";
  teamName: string;
}

const TeamStats: React.FC<TeamStatsProps> = ({ plays, team, teamName }) => {
  const teamPlays = plays.filter(p => p.possession === team);
  
  const totalYards = teamPlays.reduce((acc, p) => acc + (p.type === "Penalty" ? 0 : p.yards), 0);
  const passYards = teamPlays.filter(p => p.type === "Pass").reduce((acc, p) => acc + p.yards, 0);
  const rushYards = teamPlays.filter(p => p.type === "Run").reduce((acc, p) => acc + p.yards, 0);
  
  const thirdDowns = teamPlays.filter(p => p.down === 3);
  const thirdDownConversions = thirdDowns.filter(p => p.isFirstDown || p.isScoringPlay).length;

  const StatRow = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
      <span className="text-sm font-black text-slate-900">{value}</span>
    </div>
  );

  return (
    <Card className="p-4 border-none shadow-sm bg-white rounded-xl">
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">{teamName} Team Stats</h3>
      <div className="space-y-0.5">
        <StatRow label="Total Yards" value={totalYards} />
        <StatRow label="Passing" value={passYards} />
        <StatRow label="Rushing" value={rushYards} />
        <StatRow label="3rd Down" value={`${thirdDownConversions}/${thirdDowns.length}`} />
        <StatRow label="Avg / Play" value={teamPlays.length ? (totalYards / teamPlays.length).toFixed(1) : "0.0"} />
      </div>
    </Card>
  );
};

export default TeamStats;