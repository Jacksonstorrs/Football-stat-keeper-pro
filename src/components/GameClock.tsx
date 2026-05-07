"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameClockProps {
  seconds: number;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onNextQuarter: () => void;
  quarter: number;
}

const GameClock: React.FC<GameClockProps> = ({ 
  seconds, isRunning, onToggle, onReset, onNextQuarter, quarter 
}) => {
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-between border border-slate-800 shadow-lg">
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Game Clock</span>
        <div className={cn(
          "text-4xl font-mono font-black tabular-nums transition-colors",
          isRunning ? "text-amber-400" : "text-white"
        )}>
          {formatTime(seconds)}
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          variant={isRunning ? "destructive" : "default"}
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={onToggle}
        >
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
        </Button>
        
        <div className="flex flex-col gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-6 text-[10px] font-bold uppercase bg-transparent text-slate-400 border-slate-700 hover:text-white"
            onClick={onReset}
          >
            <RotateCcw className="w-3 h-3 mr-1" /> Reset
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-6 text-[10px] font-bold uppercase bg-transparent text-slate-400 border-slate-700 hover:text-white"
            onClick={onNextQuarter}
          >
            Q{quarter} <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameClock;