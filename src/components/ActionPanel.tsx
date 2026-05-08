"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Player, PlayType } from "@/types/football";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hash, RotateCcw, Zap, Shield, Target, UserCheck, ChevronRight, ArrowLeft, Footprints, Trophy } from "lucide-react";
import YardageInput from "./YardageInput";

interface ActionPanelProps {
  homeRoster: Player[];
  onAction: (type: PlayType, yards: number, player?: Player, receiver?: Player) => void;
  onUndo: () => void;
  canUndo: boolean;
  isHomeOffense: boolean;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ homeRoster, onAction, onUndo, canUndo, isHomeOffense }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedReceiver, setSelectedReceiver] = useState<Player | null>(null);
  const [pendingAction, setPendingAction] = useState<PlayType | null>(null);
  const [step, setStep] = useState<"player" | "tdType" | "receiver" | "yards">("player");
  const [yardage, setYardage] = useState("");

  const handleActionClick = (type: PlayType) => {
    if (type === "Incomplete" || type === "Turnover") {
      onAction(type, 0, selectedPlayer || undefined);
      reset();
    } else if (type === "Touchdown") {
      setPendingAction(type);
      setStep("tdType");
    } else if (type === "Pass") {
      setPendingAction(type);
      setStep("receiver");
    } else {
      setPendingAction(type);
      setStep("yards");
    }
  };

  const handleTDTypeSelect = (type: "Rush" | "Pass") => {
    if (type === "Pass") {
      setStep("receiver");
    } else {
      setStep("yards");
    }
  };

  const handleReceiverSelect = (player: Player) => {
    setSelectedReceiver(player);
    setStep("yards");
  };

  const handleConfirmYardage = () => {
    const yards = parseInt(yardage) || 0;
    if (pendingAction) {
      onAction(pendingAction, yards, selectedPlayer || undefined, selectedReceiver || undefined);
      reset();
    }
  };

  const reset = () => {
    setSelectedPlayer(null);
    setSelectedReceiver(null);
    setPendingAction(null);
    setStep("player");
    setYardage("");
  };

  if (step === "tdType") {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-amber-500">Touchdown Type</h3>
          <Button variant="ghost" size="sm" onClick={() => setStep("player")} className="text-[10px] font-black uppercase tracking-widest">
            <ArrowLeft className="w-3 h-3 mr-1" /> Back
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button className="h-20 bg-emerald-600 font-black uppercase" onClick={() => handleTDTypeSelect("Rush")}>Rush TD</Button>
          <Button className="h-20 bg-blue-600 font-black uppercase" onClick={() => handleTDTypeSelect("Pass")}>Pass TD</Button>
        </div>
      </div>
    );
  }

  if (step === "receiver") {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-blue-600">Select Receiver</h3>
          <Button variant="ghost" size="sm" onClick={() => setStep("player")} className="text-[10px] font-black uppercase tracking-widest">
            <ArrowLeft className="w-3 h-3 mr-1" /> Back
          </Button>
        </div>
        <ScrollArea className="h-64 bg-slate-50 rounded-xl p-2">
          {homeRoster.map(p => (
            <Button key={p.id} variant="ghost" className="w-full justify-start h-12 font-bold" onClick={() => handleReceiverSelect(p)}>
              <span className="w-8 text-slate-400">#{p.number}</span> {p.name}
            </Button>
          ))}
        </ScrollArea>
      </div>
    );
  }

  if (step === "yards") {
    return <YardageInput value={yardage} onChange={setYardage} onConfirm={handleConfirmYardage} onCancel={() => setStep("player")} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Home Team Tracker</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase">{isHomeOffense ? "Offense Mode" : "Defense Mode"}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onUndo} disabled={!canUndo} className="h-8 text-[10px] font-black uppercase tracking-widest gap-2">
          <RotateCcw className="w-3 h-3" /> Undo
        </Button>
      </div>

      <div className="bg-slate-50 rounded-2xl p-2 border border-slate-100">
        <ScrollArea className="h-40 w-full">
          <div className="grid grid-cols-1 gap-1">
            {homeRoster.map((player) => (
              <Button
                key={player.id}
                variant={selectedPlayer?.id === player.id ? "default" : "ghost"}
                className={`justify-start h-10 px-4 text-sm font-bold transition-all ${
                  selectedPlayer?.id === player.id ? "bg-slate-900 text-white" : "text-slate-600"
                }`}
                onClick={() => setSelectedPlayer(player)}
              >
                <span className="w-8 text-left font-mono opacity-50">#{player.number}</span>
                <span className="truncate">{player.name}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Tabs defaultValue={isHomeOffense ? "offense" : "defense"} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="offense" className="text-[10px] font-black uppercase">Offense</TabsTrigger>
          <TabsTrigger value="defense" className="text-[10px] font-black uppercase">Defense</TabsTrigger>
          <TabsTrigger value="special" className="text-[10px] font-black uppercase">Special</TabsTrigger>
        </TabsList>

        <TabsContent value="offense" className="grid grid-cols-3 gap-2 animate-in fade-in">
          <Button className="h-12 bg-blue-600 font-black uppercase text-[10px]" onClick={() => handleActionClick("Pass")}>Pass</Button>
          <Button className="h-12 bg-emerald-600 font-black uppercase text-[10px]" onClick={() => handleActionClick("Run")}>Run</Button>
          <Button variant="outline" className="h-12 font-black uppercase text-[10px]" onClick={() => handleActionClick("Incomplete")}>Inc</Button>
          <Button className="h-12 col-span-2 bg-amber-500 text-slate-900 font-black uppercase text-[10px]" onClick={() => handleActionClick("Touchdown")}>Touchdown</Button>
          <Button variant="destructive" className="h-12 font-black uppercase text-[10px]" onClick={() => handleActionClick("Turnover")}>TO</Button>
        </TabsContent>

        <TabsContent value="defense" className="grid grid-cols-2 gap-2 animate-in fade-in">
          <Button variant="secondary" className="h-12 font-black uppercase text-[10px] gap-2" onClick={() => handleActionClick("Tackle")}>
            <Shield className="w-3 h-3" /> Tackle
          </Button>
          <Button variant="secondary" className="h-12 font-black uppercase text-[10px] gap-2" onClick={() => handleActionClick("Sack")}>
            <Zap className="w-3 h-3" /> Sack
          </Button>
          <Button variant="secondary" className="h-12 font-black uppercase text-[10px] gap-2" onClick={() => handleActionClick("Interception")}>
            <Target className="w-3 h-3" /> INT
          </Button>
          <Button variant="secondary" className="h-12 font-black uppercase text-[10px]" onClick={() => handleActionClick("Penalty")}>Penalty</Button>
        </TabsContent>

        <TabsContent value="special" className="grid grid-cols-3 gap-2 animate-in fade-in">
          <Button variant="outline" className="h-12 font-black uppercase text-[10px] flex flex-col gap-1" onClick={() => handleActionClick("Field Goal")}>
            <Trophy className="w-3 h-3" /> FG
          </Button>
          <Button variant="outline" className="h-12 font-black uppercase text-[10px] flex flex-col gap-1" onClick={() => handleActionClick("Punt")}>
            <Footprints className="w-3 h-3" /> Punt
          </Button>
          <Button variant="outline" className="h-12 font-black uppercase text-[10px] flex flex-col gap-1" onClick={() => handleActionClick("Kickoff")}>
            <Zap className="w-3 h-3" /> Kick
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ActionPanel;