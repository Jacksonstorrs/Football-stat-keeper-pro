"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Player, PlayType } from "@/types/football";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, RotateCcw, Hash, Zap, ShieldAlert, ArrowRightLeft } from "lucide-react";
import YardageInput from "./YardageInput";

interface ActionPanelProps {
  roster: Player[];
  onAction: (type: PlayType, yards: number, player?: Player) => void;
  onUndo: () => void;
  canUndo: boolean;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ roster, onAction, onUndo, canUndo }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [pendingAction, setPendingAction] = useState<PlayType | null>(null);
  const [yardage, setYardage] = useState("");

  const handleActionClick = (type: PlayType) => {
    if (type === "Incomplete" || type === "Turnover") {
      onAction(type, 0, selectedPlayer || undefined);
      reset();
    } else {
      setPendingAction(type);
    }
  };

  const handleConfirmYardage = () => {
    const yards = parseInt(yardage) || 0;
    if (pendingAction) {
      onAction(pendingAction, yards, selectedPlayer || undefined);
      reset();
    }
  };

  const reset = () => {
    setSelectedPlayer(null);
    setPendingAction(null);
    setYardage("");
  };

  if (pendingAction) {
    return (
      <YardageInput 
        value={yardage}
        onChange={setYardage}
        onConfirm={handleConfirmYardage}
        onCancel={() => setPendingAction(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-tighter flex items-center gap-2 text-slate-500">
          <Hash className="w-4 h-4" />
          Play Entry
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onUndo} 
          disabled={!canUndo}
          className="h-8 text-[10px] font-bold uppercase tracking-wider gap-1 hover:bg-red-50 hover:text-red-600"
        >
          <RotateCcw className="w-3 h-3" />
          Undo
        </Button>
      </div>

      <div className="bg-slate-100 rounded-xl p-1 flex gap-1">
        <ScrollArea className="h-40 w-full">
          <div className="grid grid-cols-2 gap-1 p-1">
            {roster.map((player) => (
              <Button
                key={player.id}
                variant={selectedPlayer?.id === player.id ? "default" : "ghost"}
                className={`justify-start h-10 px-2 text-xs font-bold transition-all ${
                  selectedPlayer?.id === player.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-white"
                }`}
                onClick={() => setSelectedPlayer(player)}
              >
                <span className="w-6 text-left opacity-50">#{player.number}</span>
                <span className="truncate">{player.name}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button 
          className="h-14 font-black uppercase tracking-tighter bg-blue-600 hover:bg-blue-700"
          onClick={() => handleActionClick("Pass")}
        >
          Pass
        </Button>
        <Button 
          className="h-14 font-black uppercase tracking-tighter bg-emerald-600 hover:bg-emerald-700"
          onClick={() => handleActionClick("Run")}
        >
          Run
        </Button>
        <Button 
          variant="outline"
          className="h-14 font-black uppercase tracking-tighter border-2"
          onClick={() => handleActionClick("Incomplete")}
        >
          Inc
        </Button>
        
        <Button 
          variant="secondary"
          className="h-12 text-[10px] font-black uppercase tracking-widest"
          onClick={() => handleActionClick("Sack")}
        >
          Sack
        </Button>
        <Button 
          variant="secondary"
          className="h-12 text-[10px] font-black uppercase tracking-widest"
          onClick={() => handleActionClick("Penalty")}
        >
          Penalty
        </Button>
        <Button 
          variant="secondary"
          className="h-12 text-[10px] font-black uppercase tracking-widest"
          onClick={() => handleActionClick("Fumble")}
        >
          Fumble
        </Button>

        <Button 
          className="h-14 col-span-2 font-black uppercase tracking-tighter bg-amber-500 hover:bg-amber-600 text-slate-900"
          onClick={() => handleActionClick("Touchdown")}
        >
          <Zap className="w-4 h-4 mr-2" />
          Touchdown
        </Button>
        <Button 
          variant="destructive"
          className="h-14 font-black uppercase tracking-tighter"
          onClick={() => handleActionClick("Turnover")}
        >
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          TO
        </Button>
      </div>
    </div>
  );
};

export default ActionPanel;