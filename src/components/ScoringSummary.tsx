"use client";

import React from 'react';
import { Play } from "@/types/football";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface ScoringSummaryProps {
  plays: Play[];
}

const ScoringSummary: React.FC<ScoringSummaryProps> = ({ plays }) => {
  const scoringPlays = plays.filter(p => p.isScoringPlay).reverse();

  return (
    <Card className="p-4 bg-white/5 border-white/10 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-4 h-4 text-amber-400" />
        <h3 className="text-xs font-black uppercase tracking-widest">Scoring Summary</h3>
      </div>
      
      <div className="space-y-3">
        {scoringPlays.length === 0 ? (
          <div className="text-center py-4 text-slate-500 text-xs italic">No scoring yet.</div>
        ) : (
          scoringPlays.map((play, i) => (
            <div key={i} className="flex items-start gap-3 text-xs border-b border-white/5 pb-2 last:border-0">
              <div className="font-black text-amber-400 min-w-[30px]">{play.possession.substring(0, 3)}</div>
              <div className="flex-1 text-slate-300">{play.result}</div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default ScoringSummary;