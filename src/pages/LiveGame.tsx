"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Scoreboard from "@/components/Scoreboard";
import FootballField from "@/components/FootballField";
import PlayLog from "@/components/PlayLog";
import TeamStats from "@/components/TeamStats";
import { GameState } from "@/types/football";
import { Badge } from "@/components/ui/badge";
import { Radio } from "lucide-react";

const LiveGame = () => {
  const { gameId } = useParams();
  const [game, setGame] = useState<GameState | null>(null);
  const [isLive, setIsLive] = useState(true);

  // In a real app with a database, this would be a subscription/websocket
  useEffect(() => {
    const saved = localStorage.getItem('football_stat_keeper_pro_v2');
    if (saved) setGame(JSON.parse(saved));
    
    // Simulate live polling
    const interval = setInterval(() => {
      const updated = localStorage.getItem('football_stat_keeper_pro_v2');
      if (updated) setGame(JSON.parse(updated));
    }, 3000);

    return () => clearInterval(interval);
  }, [gameId]);

  if (!game) return <div className="p-10 text-center">Waiting for game data...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <h1 className="text-xl font-black tracking-tighter">LIVE BROADCAST</h1>
          </div>
          <Badge variant="outline" className="text-white border-white/20 gap-2">
            <Radio className="w-3 h-3" /> {game.homeTeam} vs {game.awayTeam}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <Scoreboard 
              homeTeam={game.homeTeam} awayTeam={game.awayTeam}
              homeScore={game.homeScore} awayScore={game.awayScore}
              homeTimeouts={game.homeTimeouts} awayTimeouts={game.awayTimeouts}
              possession={game.possession} down={game.down}
              distance={game.distance} quarter={game.quarter}
            />

            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
              <FootballField 
                ballPosition={game.yardLine}
                possession={game.possession}
                onSpotBall={() => {}} // Read-only
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TeamStats team="Home" teamName={game.homeTeam} plays={game.playLog} />
              <TeamStats team="Away" teamName={game.awayTeam} plays={game.playLog} />
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="h-[calc(100vh-12rem)]">
              <PlayLog plays={game.playLog} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveGame;