"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Scoreboard from "@/components/Scoreboard";
import FootballField from "@/components/FootballField";
import PlayLog from "@/components/PlayLog";
import TeamStats from "@/components/TeamStats";
import DriveTracker from "@/components/DriveTracker";
import ScoringSummary from "@/components/ScoringSummary";
import TopPerformers from "@/components/TopPerformers";
import { GameState } from "@/types/football";
import { Badge } from "@/components/ui/badge";
import { Radio, MapPin, Cloud } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const GAME_STORAGE_KEY = 'football_stat_keeper_pro_v2';

const LiveGame = () => {
  const { gameId } = useParams();
  const { teamCode } = useAuth();
  const [game, setGame] = useState<GameState | null>(null);

  useEffect(() => {
    // In a local-only setup, we just read from the local storage
    const loadLocalGame = () => {
      const savedGame = localStorage.getItem(GAME_STORAGE_KEY);
      if (savedGame) {
        setGame(JSON.parse(savedGame));
      }
    };

    loadLocalGame();

    // Listen for storage changes in case the tracker is open in another tab
    window.addEventListener('storage', loadLocalGame);
    return () => window.removeEventListener('storage', loadLocalGame);
  }, []);

  if (!game) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
      <div className="text-center space-y-4">
        <div className="animate-pulse text-slate-500 font-black uppercase tracking-widest">Waiting for game data...</div>
        <p className="text-xs text-slate-600">Start a game in the tracker to see live updates here.</p>
      </div>
    </div>
  );

  const currentDrive = game.drives.find(d => d.id === game.currentDriveId);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Broadcast Header */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-white/10 pb-4 gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <h1 className="text-xl font-black tracking-tighter">LIVE VIEW</h1>
            </div>
            <div className="h-4 w-[1px] bg-white/20 hidden md:block" />
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Local Session</span>
              <span className="flex items-center gap-1.5"><Cloud className="w-3 h-3" /> 72° Clear</span>
            </div>
          </div>
          <Badge variant="outline" className="text-white border-white/20 gap-2 px-4 py-1">
            <Radio className="w-3 h-3" /> {game.homeTeam} vs {game.awayTeam}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            <Scoreboard 
              homeTeam={game.homeTeam} awayTeam={game.awayTeam}
              homeScore={game.homeScore} awayScore={game.awayScore}
              homeTimeouts={game.homeTimeouts} awayTimeouts={game.awayTimeouts}
              possession={game.possession} down={game.down}
              distance={game.distance} quarter={game.quarter}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                <FootballField 
                  ballPosition={game.yardLine}
                  possession={game.possession}
                  onSpotBall={() => {}} 
                />
              </div>
              <div className="space-y-4">
                <DriveTracker 
                  currentDrive={currentDrive} 
                  teamName={game.possession === "Home" ? game.homeTeam : game.awayTeam} 
                />
                <ScoringSummary plays={game.playLog} />
              </div>
            </div>

            <TopPerformers stats={game.stats} roster={game.roster} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TeamStats team="Home" teamName={game.homeTeam} plays={game.playLog} />
              <TeamStats team="Away" teamName={game.awayTeam} plays={game.playLog} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="h-[calc(100vh-12rem)] sticky top-6">
              <PlayLog plays={game.playLog} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveGame;