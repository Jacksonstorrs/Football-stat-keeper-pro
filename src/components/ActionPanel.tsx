"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Player, PlayType } from "@/types/football";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hash, RotateCcw, Zap, Shield, Target, UserCheck, ChevronRight, ArrowLeft, Footprints, Trophy, AlertCircle, Flag, RefreshCw, Trash2 } from "lucide-react";
import YardageInput from "./YardageInput";

interface ActionPanelProps {
  homeRoster: Player[];
  onAction: (type: PlayType, yards: number, player?: Player, receiver?: Player) => void;
  onUndo: () => void;
  onSwitchPossession: () => void;
  canUndo: boolean;
  isHomeOffense: boolean;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ 
  homeRoster, onAction, onUndo, onSwitchPossession, canUndo, isHomeOffense 
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedReceiver, setSelectedReceiver] = useState<Player | null>(null);
  const [pendingAction, setPendingAction] = useState<PlayType | null>(null);
  const [step, setStep] = useState<"player" | "tdType" | "passer" | "receiver" | "yards" | "penalty">("player");
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
      setStep("passer");
    } else if (type === "Penalty") {
      setPendingAction(type);
      setStep("penalty");
    } else {
      setPendingAction(type);
      setStep("yards");
    }
  };

  const handleTDTypeSelect = (type: "Rush" | "Pass") => {
    if (type === "Pass") {
      setStep("passer");
    } else {
      setStep("yards");
    }
  };

  const handlePasserSelect = (player: Player) => {
    setSelectedPlayer(player);
    setStep("receiver");
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

  if (step === "passer") {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-blue-600">Select Passer</h3>
          <Button variant="ghost" size="sm" onClick={() => setStep("player")} className="text-[10px] font-black uppercase tracking-widest">
            <ArrowLeft className="w-3 h-3 mr-1" /> Back
          </Button>
        </div>
        <ScrollArea className="h-64 bg-slate-50 rounded-xl p-2">
          {homeRoster.filter(p => p.position === 'QB').map(p => (
            <Button key={p.id} variant="ghost" className="w-full justify-start h-12 font-bold" onClick={() => handlePasserSelect(p)}>
              <span className="w-8 text-slate-400">#{p.number}</span> {p.name}
            </Button>
          ))}
        </ScrollArea>
      </div>
    );
  }

  if (step === "receiver") {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-blue-600">Select Receiver</h3>
          <Button variant="ghost" size="sm" onClick={() => setStep("passer")} className="text-[10px] font-black uppercase tracking-widest">
            <ArrowLeft className="w-3 h-3 mr-1" /> Back
          </Button>
        </div>
        <ScrollArea className="h-64 bg-slate-50 rounded-xl p-2">
          {homeRoster.filter(p => ['WR', 'RB', 'TE', 'FB'].includes(p.position)).map(p => (
            <Button key={p.id} variant="ghost" className="w-full justify-start h-12 font-bold" onClick={() => handleReceiverSelect(p)}>
              <span className="w-8 text-slate-400">#{p.number}</span> {p.name}
            </Button>
          ))}
        </ScrollArea>
      </div>
    );
  }

  if (step === "penalty") {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h3 className="text-sm font-black uppercase tracking-widest text-amber-600">Penalty Flag</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setStep("player")} className="text-[10px] font-black uppercase tracking-widest">
            <ArrowLeft className="w-3 h-3 mr-1" /> Back
          </Button>
        </div>
        
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-center">
          <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Select Yardage</p>
          <p className="text-xs text-amber-600 font-medium">Penalty will adjust ball position without advancing down.</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[5, 10, 15].map(y => (
            <Button key={y} variant="outline" className="h-16 font-black text-lg border-amber-200 hover:bg-amber-50 text-amber-700" onClick={() => { setYardage(y.toString()); setStep("yards"); }}>
              {y} YDS
            </Button>
          ))}
        </div>
        <Button variant="secondary" className="w-full h-12 font-black uppercase text-[10px] bg-slate-100" onClick={() => setStep("yards")}>Custom Yardage</Button>
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
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Home Team Entry</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase">
            {isHomeOffense ? "Offense Mode" : "Defense Mode"}
          </p>
        </div>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onSwitchPossession}
            className="h-8 w-8 text-slate-400 hover:text-blue-600"
            title="Switch Possession"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onUndo} 
            disabled={!canUndo} 
            className="h-8 w-8 text-slate-400 hover:text-red-600"
            title="Undo Last Play"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Button 
        onClick={() => handleActionClick("Penalty")}
        className="w-full h-14 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black uppercase tracking-widest gap-3 shadow-lg shadow-amber-100 border-b-4 border-amber-600 active:border-b-0 active:translate-y-1 transition-all"
      >
        <Flag className="w-6 h-6 fill-amber-950" />
        Throw Penalty Flag
      </Button>

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
                <span className="ml-auto text-xs font-bold text-slate-400 uppercase">{player.position}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Tabs value={isHomeOffense ? "offense" : "defense"} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="offense" disabled={!isHomeOffense} className="text-[10px] font-black uppercase">Offense</TabsTrigger>
          <TabsTrigger value="defense" disabled={isHomeOffense} className="text-[10px] font-black uppercase">Defense</TabsTrigger>
        </TabsList>

        <TabsContent value="offense" className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-3 gap-2">
            <Button className="h-12 bg-blue-600 font-black uppercase text-[10px]" onClick={() => handleActionClick("Pass")}>Pass</Button>
            <Button className="h-12 bg-emerald-600 font-black uppercase text-[10px]" onClick={() => handleActionClick("Run")}>Run</Button>
            <Button variant="outline" className="h-12 font-black uppercase text-[10px]" onClick={() => handleActionClick("Incomplete")}>Inc</Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button className="h-12 bg-amber-500 text-slate-900 font-black uppercase text-[10px]" onClick={() => handleActionClick("Touchdown")}>Touchdown</Button>
            <Button variant="destructive" className="h-12 font-black uppercase text-[10px]" onClick={() => handleActionClick("Turnover")}>Turnover</Button>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
            <Button variant="outline" className="h-10 text-[9px] font-black uppercase" onClick={() => handleActionClick("Field Goal")}>FG</Button>
            <Button variant="outline" className="h-10 text-[9px] font-black uppercase" onClick={() => handleActionClick("Punt")}>Punt</Button>
          </div>
        </TabsContent>

        <TabsContent value="defense" className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-3 gap-2">
            <Button variant="secondary" className="h-14 font-black uppercase text-[10px] flex flex-col gap-1" onClick={() => handleActionClick("Tackle")}>
              <Shield className="w-4 h-4" /> Tackle
            </Button>
            <Button variant="secondary" className="h-14 font-black uppercase text-[10px] flex flex-col gap-1" onClick={() => handleActionClick("Sack")}>
              <Zap className="w-4 h-4" /> Sack
            </Button>
            <Button variant="secondary" className="h-14 font-black uppercase text-[10px] flex flex-col gap-1" onClick={() => handleActionClick("Interception")}>
              <Target className="w-4 h-4" /> INT
            </Button>
          </div>
          <div className="pt-2 border-t">
            <Button variant="outline" className="w-full h-10 text-[9px] font-black uppercase" onClick={() => handleActionClick("Kickoff")}>Opponent Kickoff</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ActionPanel;