"use client";

import React from 'react';
import { Play } from "@/types/football";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { History, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayLogProps {
  plays: Play[];
}

const PlayLog: React.FC<PlayLogProps> = ({ plays }) => {
  // Group plays by driveId
  const drives = plays.reduce((acc, play) => {
    const driveId = play.driveId;
    if (!acc[driveId]) acc[driveId] = [];
    acc[driveId].push(play);
    return acc;
  }, {} as Record<string, Play[]>);

  const driveIds = Object.keys(drives).reverse();

  return (
    <Card className="flex flex-col h-full overflow-hidden border-none shadow-lg bg-white dark:bg-slate-900">
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-slate-500" />
          <h3 className="font-bold text-slate-700 dark:text-slate-200">Game Log</h3>
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {plays.length} Plays
        </span>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {driveIds.length === 0 ? (
            <div className="text-center py-10 text-slate-400 italic text-sm">
              No plays recorded yet.
            </div>
          ) : (
            driveIds.map((driveId) => {
              const drivePlays = drives[driveId];
              const possession = drivePlays[0].possession;
              
              return (
                <div key={driveId} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                      possession === "Home" ? "bg-blue-600 text-white" : "bg-red-600 text-white"
                    )}>
                      {possession} Drive
                    </div>
                    <div className="h-[1px] flex-1 bg-slate-100 dark:bg-white/5" />
                  </div>
                  
                  <div className="space-y-2 pl-2 border-l-2 border-slate-100 dark:border-white/5">
                    {drivePlays.map((play) => (
                      <div 
                        key={play.id} 
                        className="flex gap-3 items-start animate-in slide-in-from-left-2 duration-300"
                      >
                        <div className="flex-1 bg-slate-50 dark:bg-white/5 p-3 rounded-lg border dark:border-white/5 shadow-sm">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-primary uppercase">
                                {play.type}
                              </span>
                              {play.isScoringPlay && <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {play.down}&{play.distance === 0 ? "G" : play.distance}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-tight">
                            {play.player ? <span className="font-bold">#{play.player.number}</span> : "Team"} {play.result}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default PlayLog;