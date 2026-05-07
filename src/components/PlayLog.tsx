"use client";

import React from 'react';
import { Play } from "@/types/football";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { History } from "lucide-react";

interface PlayLogProps {
  plays: Play[];
}

const PlayLog: React.FC<PlayLogProps> = ({ plays }) => {
  return (
    <Card className="flex flex-col h-full overflow-hidden border-none shadow-lg">
      <div className="p-4 bg-slate-50 border-b flex items-center gap-2">
        <History className="w-5 h-5 text-slate-500" />
        <h3 className="font-bold text-slate-700">Play-by-Play</h3>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {plays.length === 0 ? (
            <div className="text-center py-10 text-slate-400 italic">
              No plays recorded yet.
            </div>
          ) : (
            plays.map((play, idx) => (
              <div 
                key={play.id} 
                className="flex gap-3 items-start animate-in slide-in-from-left-2 duration-300"
              >
                <div className="flex flex-col items-center min-w-[40px]">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    {play.possession === "Home" ? "HOM" : "AWY"}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border">
                    {plays.length - idx}
                  </div>
                </div>
                <div className="flex-1 bg-white p-3 rounded-lg border shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-primary uppercase">
                      {play.type}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(play.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-tight">
                    {play.player ? <span className="font-bold">#{play.player.number} {play.player.name}</span> : "Team"} {play.result}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-medium">
                      {play.down} & {play.distance === 0 ? "Goal" : play.distance}
                    </span>
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-medium">
                      at {play.yardLine > 50 ? `AWY ${100 - play.yardLine}` : `HOM ${play.yardLine}`}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default PlayLog;