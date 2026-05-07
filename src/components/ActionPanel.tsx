"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Player, Team } from "@/types/football";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, PlayCircle, RotateCcw, Trophy } from "lucide-react";

interface ActionPanelProps {
  roster: Player[];
  onAction: (type: "Run" | "Pass" | "Touchdown" | "Turnover", player?: Player) => void;
  onUndo: () => void;
  canUndo: boolean;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ roster, onAction, onUndo, canUndo }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Select Player
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onUndo} 
          disabled={!canUndo}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Undo
        </Button>
      </div>

      <ScrollArea className="h-48 rounded-md border p-2 bg-slate-50">
        <div className="grid grid-cols-2 gap-2">
          {roster.map((player) => (
            <Button
              key={player.id}
              variant={selectedPlayer?.id === player.id ? "default" : "outline"}
              className="justify-start h-12 px-3"
              onClick={() => setSelectedPlayer(player)}
            >
              <span className="font-bold mr-2 text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                #{player.number}
              </span>
              <span className="truncate text-sm">{player.name}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>

      <div className="grid grid-cols-2 gap-3">
        <Button 
          size="lg" 
          className="h-16 text-lg font-bold gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            onAction("Pass", selectedPlayer || undefined);
            setSelectedPlayer(null);
          }}
        >
          <PlayCircle className="w-6 h-6" />
          Pass
        </Button>
        <Button 
          size="lg" 
          className="h-16 text-lg font-bold gap-2 bg-emerald-600 hover:bg-emerald-700"
          onClick={() => {
            onAction("Run", selectedPlayer || undefined);
            setSelectedPlayer(null);
          }}
        >
          <PlayCircle className="w-6 h-6" />
          Run
        </Button>
        <Button 
          size="lg" 
          variant="secondary"
          className="h-16 text-lg font-bold gap-2"
          onClick={() => {
            onAction("Touchdown", selectedPlayer || undefined);
            setSelectedPlayer(null);
          }}
        >
          <Trophy className="w-6 h-6 text-amber-500" />
          TD
        </Button>
        <Button 
          size="lg" 
          variant="destructive"
          className="h-16 text-lg font-bold gap-2"
          onClick={() => {
            onAction("Turnover");
            setSelectedPlayer(null);
          }}
        >
          Turnover
        </Button>
      </div>
    </div>
  );
};

export default ActionPanel;