"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Player, PlayType } from "@/types/football";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hash, RotateCcw, Zap, ArrowRightLeft, Shield, Target } from "lucide-react";
import YardageInput from "./YardageInput";

interface ActionPanelProps {
  roster: Player[];
  opponentRoster: Player[];
  onAction: (type: PlayType, yards: number, player?: Player) => void;
  onUndo: () => void;
  canUndo: boolean;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ roster, opponentRoster, onAction, onUndo, canUndo }) => {
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

      <Tabs defaultValue="offense" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="offense" className="text-[10px] font-black uppercase">Offense</TabsTrigger>
          <TabsTrigger value="defense" className="text-[10px] font-black uppercase">Defense</TabsTrigger>
        </TabsList>

        <TabsContent value="offense" className="space-y-4">
          <div className="bg-slate-100 rounded-xl p-1">
            <ScrollArea className="h-32 w-full">
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
            <Button className="h-12 font-black uppercase tracking-tighter bg-blue-600 hover:bg-blue-700" onClick={() => handleActionClick("Pass")}>Pass</Button>
            <Button className="h-12 font-black uppercase tracking-tighter bg-emerald-600 hover:bg-emerald-700" onClick={() => handleActionClick("Run")}>Run</Button>
            <Button variant="outline" className="h-12 font-black uppercase tracking-tighter border-2" onClick={() => handleActionClick("Incomplete")}>Inc</Button>
            <Button className="h-12 col-span-2 font-black uppercase tracking-tighter bg-amber-500 hover:bg-amber-600 text-slate-900" onClick={() => handleActionClick("Touchdown")}>
              <Zap className="w-4 h-4 mr-2" /> TD
            </Button>
            <Button variant="destructive" className="h-12 font-black uppercase tracking-tighter" onClick={() => handleActionClick("Turnover")}>TO</Button>
          </div>
        </TabsContent>

        <TabsContent value="defense" className="space-y-4">
          <div className="bg-slate-100 rounded-xl p-1">
            <ScrollArea className="h-32 w-full">
              <div className="grid grid-cols-2 gap-1 p-1">
                {opponentRoster.map((player) => (
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

          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" className="h-12 font-black uppercase tracking-tighter gap-2" onClick={() => handleActionClick("Sack")}>
              <Shield className="w-4 h-4" /> Sack
            </Button>
            <Button variant="secondary" className="h-12 font-black uppercase tracking-tighter gap-2" onClick={() => handleActionClick("Fumble")}>
              <Target className="w-4 h-4" /> Fumble
            </Button>
            <Button variant="secondary" className="h-12 font-black uppercase tracking-tighter" onClick={() => handleActionClick("Penalty")}>Penalty</Button>
            <Button variant="secondary" className="h-12 font-black uppercase tracking-tighter" onClick={() => handleActionClick("Punt")}>Punt</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ActionPanel;