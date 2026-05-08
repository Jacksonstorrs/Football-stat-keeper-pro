"use client";

import React from 'react';
import { Drive } from "@/types/football";
import { Card } from "@/components/ui/card";
import { MapPin, Clock, Zap } from "lucide-react";

interface DriveTrackerProps {
  currentDrive?: Drive;
  teamName: string;
}

const DriveTracker: React.FC<DriveTrackerProps> = ({ currentDrive, teamName }) => {
  if (!currentDrive) return null;

  return (
    <Card className="p-4 bg-slate-900/80 border-white/10 text-white backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Drive</span>
        </div>
        <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded uppercase">{teamName}</span>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Plays</div>
          <div className="text-xl font-black">{currentDrive.plays}</div>
        </div>
        <div className="text-center border-x border-white/10">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Yards</div>
          <div className="text-xl font-black">{currentDrive.yards}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Start</div>
          <div className="text-xl font-black">
            {currentDrive.startYardLine > 50 ? `AWY ${100 - currentDrive.startYardLine}` : `HOM ${currentDrive.startYardLine}`}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DriveTracker;