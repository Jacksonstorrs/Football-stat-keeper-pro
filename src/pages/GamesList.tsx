"use client";

import React, { useEffect, useState } from 'react';
import { GameState } from "@/types/football";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Trophy, Calendar, ArrowLeft, Plus, Trash2, ChevronRight } from "lucide-react";
import { showSuccess } from "@/utils/toast";

const SEASON_STORAGE_KEY = 'football_stat_keeper_season_v1';

const GamesList = () => {
  const [games, setGames] = useState<GameState[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(SEASON_STORAGE_KEY);
    if (saved) setGames(JSON.parse(saved));
  }, []);

  const deleteGame = (id: string) => {
    const updated = games.filter(g => g.currentDriveId !== id); // Using driveId as a proxy for game ID
    setGames(updated);
    localStorage.setItem(SEASON_STORAGE_KEY, JSON.stringify(updated));
    showSuccess("Game removed from season");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Season Schedule</h1>
              <p className="text-slate-500 text-sm">Manage and review all recorded games</p>
            </div>
          </div>
          <Link to="/season-stats">
            <Button className="gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold">
              <Trophy className="w-4 h-4" /> Season Stats
            </Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {games.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">No games recorded yet</h3>
                <p className="text-slate-500 text-sm">Complete a game in the dashboard to save it here.</p>
              </div>
              <Link to="/">
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" /> Start New Game
                </Button>
              </Link>
            </Card>
          ) : (
            games.map((game, idx) => (
              <Card key={idx} className="p-6 hover:shadow-md transition-shadow border-none shadow-sm group">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-8 flex-1">
                    <div className="text-center min-w-[80px]">
                      <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Game {games.length - idx}</div>
                      <div className="text-xs font-bold text-slate-500">FINAL</div>
                    </div>
                    
                    <div className="flex items-center gap-4 flex-1 justify-center md:justify-start">
                      <div className="text-right">
                        <div className="text-sm font-black uppercase truncate max-w-[100px]">{game.homeTeam}</div>
                        <div className="text-2xl font-black">{game.homeScore}</div>
                      </div>
                      <div className="text-slate-200 font-light italic">VS</div>
                      <div className="text-left">
                        <div className="text-sm font-black uppercase truncate max-w-[100px]">{game.awayTeam}</div>
                        <div className="text-2xl font-black">{game.awayScore}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => deleteGame(game.currentDriveId)} className="text-slate-300 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" className="gap-2 font-bold">
                      View Details <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GamesList;