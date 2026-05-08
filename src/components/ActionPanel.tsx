"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Player, PlayType } from "@/types/football";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hash, RotateCcw, Zap, Shield, Target, UserCheck, ChevronRight, ArrowLeft } from "lucide-react";
import YardageInput from "./YardageInput";

interface ActionPanelProps {
  roster: Player[];
  opponentRoster: Player[];
  onAction: (type: PlayType, yards: number, player?: Player, receiver?: Player) => void;
  onUndo: () => void;
  canUndo: boolean;
  isHomeTeam: boolean;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ roster, opponentRoster, onAction, onUndo, canUndo, isHomeTeam }) => {
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
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-amber-500">Touchdown Type</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Select Method</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setStep("player")} className="text-[10px] font-black uppercase tracking-widest hover:bg-slate-100">
            <ArrowLeft className="w-3 h-3 mr-1" /> Back
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button 
            className="h-24 flex flex-col gap-2 bg-emerald-600 hover:bg-emerald-700 font-black uppercase tracking-widest"
            onClick={() => handleTDTypeSelect("Rush")}
          >
            <Zap className="w-6 h-6" />
            Rush TD
          </Button>
          <Button 
            className="h-24 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest"
            onClick={() => handleTDTypeSelect("Pass")}
          >
            <Target className="w-6 h-6" />
            Pass TD
          </Button>
        </div>
      </div>
    );
  }

  if (step === "receiver") {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-blue-600">Select Receiver</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Step 2 of 3</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setStep(pendingAction === "Touchdown" ? "tdType" : "player")} className="text-[10px] font-black uppercase tracking-widest hover:bg-slate-100">
            <ArrowLeft className="w-3 h-3 mr-1" /> Back
          </Button>
        </div>
        <div className="bg-slate-50 rounded-2xl p-2 border border-slate-100">
          <ScrollArea className="h-64 w-full">
            <div className="grid grid-cols-1 gap-1 p-1">
              {roster.filter(p => p.id !== selectedPlayer?.id).map((player) => (
                <Button
                  key={player.id}
                  variant="ghost"
                  className="justify-between h-12 px-4 text-sm font-bold hover:bg-white hover:shadow-sm transition-all group"
                  onClick={() => handleReceiverSelect(player)}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 text-left font-mono text-slate-400">#{player.number}</span>
                    <span className="truncate">{player.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  if (step === "yards") {
    return (
      <div className="animate-in fade-in zoom-in duration-300">
        <YardageInput 
          value={yardage}
          onChange={setYardage}
          onConfirm={handleConfirmYardage}
          onCancel={() => setStep(selectedReceiver ? "receiver" : "player")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Play Entry</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase">Select Player & Action</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onUndo} 
          disabled={!canUndo}
          className="h-8 text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Undo
        </Button>
      </div>

      <Tabs defaultValue="offense" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="offense" className="text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Offense</TabsTrigger>
          <TabsTrigger value="defense" className="text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Defense</TabsTrigger>
        </TabsList>

        <TabsContent value="offense" className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-slate-50 rounded-2xl p-2 border border-slate-100">
            <ScrollArea className="h-48 w-full">
              <div className="grid grid-cols-1 gap-1 p-1">
                {roster.map((player) => (
                  <Button
                    key={player.id}
                    variant={selectedPlayer?.id === player.id ? "default" : "ghost"}
                    className={`justify-start h-12 px-4 text-sm font-bold transition-all ${
                      selectedPlayer?.id === player.id 
                        ? "bg-slate-900 text-white shadow-lg" 
                        : "text-slate-600 hover:bg-white hover:shadow-sm"
                    }`}
                    onClick={() => setSelectedPlayer(player)}
                  >
                    <span className={`w-8 text-left font-mono ${selectedPlayer?.id === player.id ? "text-white/50" : "text-slate-400"}`}>#{player.number}</span>
                    <span className="truncate">{player.name}</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button className="h-14 font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100" onClick={() => handleActionClick("Pass")}>Pass</Button>
            <Button className="h-14 font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100" onClick={() => handleActionClick("Run")}>Run</Button>
            <Button variant="outline" className="h-14 font-black uppercase tracking-widest border-2 border-slate-100 hover:bg-slate-50" onClick={() => handleActionClick("Incomplete")}>Inc</Button>
            <Button className="h-14 col-span-2 font-black uppercase tracking-widest bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-lg shadow-amber-100" onClick={() => handleActionClick("Touchdown")}>
              <Zap className="w-4 h-4 mr-2" /> Touchdown
            </Button>
            <Button variant="destructive" className="h-14 font-black uppercase tracking-widest shadow-lg shadow-red-100" onClick={() => handleActionClick("Turnover")}>TO</Button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <Button variant="secondary" className="h-10 text-[10px] font-black uppercase tracking-widest bg-slate-100" onClick={() => handleActionClick("Field Goal")}>FG</Button>
            <Button variant="secondary" className="h-10 text-[10px] font-black uppercase tracking-widest bg-slate-100" onClick={() => handleActionClick("Punt")}>Punt</Button>
            <Button variant="secondary" className="h-10 text-[10px] font-black uppercase tracking-widest bg-slate-100" onClick={() => handleActionClick("Kickoff")}>Kick</Button>
          </div>
        </TabsContent>

        <TabsContent value="defense" className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-slate-50 rounded-2xl p-2 border border-slate-100">
            <ScrollArea className="h-48 w-full">
              <div className="grid grid-cols-1 gap-1 p-1">
                {opponentRoster.map((player) => (
                  <Button
                    key={player.id}
                    variant={selectedPlayer?.id === player.id ? "default" : "ghost"}
                    className={`justify-start h-12 px-4 text-sm font-bold transition-all ${
                      selectedPlayer?.id === player.id 
                        ? "bg-slate-900 text-white shadow-lg" 
                        : "text-slate-600 hover:bg-white hover:shadow-sm"
                    }`}
                    onClick={() => setSelectedPlayer(player)}
                  >
                    <span className={`w-8 text-left font-mono ${selectedPlayer?.id === player.id ? "text-white/50" : "text-slate-400"}`}>#{player.number}</span>
                    <span className="truncate">{player.name}</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" className="h-14 font-black uppercase tracking-widest gap-3 bg-slate-100 hover:bg-slate-200" onClick={() => handleActionClick("Sack")}>
              <Shield className="w-4 h-4" /> Sack
            </Button>
            <Button variant="secondary" className="h-14 font-black uppercase tracking-widest gap-3 bg-slate-100 hover:bg-slate-200" onClick={() => handleActionClick("Interception")}>
              <Target className="w-4 h-4" /> INT
            </Button>
            <Button variant="secondary" className="h-14 font-black uppercase tracking-widest gap-3 bg-slate-100 hover:bg-slate-200" onClick={() => handleActionClick("Fumble")}>
              <Hash className="w-4 h-4" /> Fumble
            </Hash>
            <Button variant="secondary" className="h-14 font-black uppercase tracking-widest bg-slate-100 hover:bg-slate-200" onClick={() => handleActionClick("Penalty")}>Penalty</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ActionPanel;