"use client";

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from "@/lib/supabase";
import { GameState } from "@/types/football";
import Scoreboard from "@/components/Scoreboard";
import FootballField from "@/components/FootballField";
import PlayLog from "@/components/PlayLog";
import StatsTable from "@/components/StatsTable";
import TeamStats from "@/components/TeamStats";
import WinProbability from "@/components/WinProbability";
import DriveTracker from "@/components/DriveTracker";
import TopPerformers from "@/components/TopPerformers";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Radio, ArrowLeft, Share2, Trophy, Users, Activity, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { showSuccess } from "@/utils/toast";

const LiveView = () => {
  const { teamCode } = useParams();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamCode) return;

    const fetchGame = async () => {
      const { data, error } = await supabase
        .from('games')
        .select('state')
        .eq('id', teamCode)
        .single();

      if (data) {
        setGameState(data.state);
      }
      setLoading(false);
    };

    fetchGame();

    const subscription = supabase
      .channel(`game_${teamCode}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'games',
        filter: `id=eq.${teamCode}`
      }, (payload) => {
        setGameState(payload.new.state);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [teamCode]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showSuccess("Link copied to clipboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Connecting to Live Feed...</p>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center space-y-6 border-none shadow-xl">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
            <Radio className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">No Live Game Found</h2>
            <p className="text-slate-500 text-sm mt-2">The team code "{teamCode}" doesn't have an active live session right now.</p>
          </div>
          <Link to="/">
            <Button className="w-full bg-slate-900 font-black uppercase tracking-widest h-12">Return Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const currentDrive = gameState.drives.find(d => d.id === gameState.currentDriveId);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />
      <main className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live Broadcast</span>
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">{teamCode}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="h-10 px-4 text-[10px] font-black uppercase border-slate-200 bg-white gap-2">
              <Users className="w-3 h-3" /> {gameState.roster.home.length + gameState.roster.away.length} Players
            </Badge>
            <Button onClick={handleShare} variant="outline" className="h-10 font-black uppercase text-[10px] gap-2 border-slate-200 bg-white">
              <Share2 className="w-4 h-4" /> Share Feed
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <Scoreboard 
              homeTeam={gameState.homeTeam} 
              awayTeam={gameState.awayTeam} 
              homeScore={gameState.homeScore} 
              awayScore={gameState.awayScore} 
              homeTimeouts={gameState.homeTimeouts} 
              awayTimeouts={gameState.awayTimeouts} 
              possession={gameState.possession} 
              down={gameState.down} 
              distance={gameState.distance} 
              quarter={gameState.quarter} 
            />
            
            <TopPerformers stats={gameState.stats} roster={gameState.roster} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="md:col-span-2 p-8 bg-white border-none shadow-sm">
                <FootballField ballPosition={gameState.yardLine} possession={gameState.possession} />
              </Card>
              <div className="space-y-6">
                <WinProbability 
                  homeProb={50 + (gameState.homeScore - gameState.awayScore) * 2} 
                  homeTeam={gameState.homeTeam} 
                  awayTeam={gameState.awayTeam} 
                />
                <DriveTracker 
                  currentDrive={currentDrive} 
                  teamName={gameState.possession === "Home" ? gameState.homeTeam : gameState.awayTeam} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <StatsTable players={gameState.roster.home} stats={gameState.stats} title={gameState.homeTeam} />
              <StatsTable players={gameState.roster.away} stats={gameState.stats} title={gameState.awayTeam} />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <PlayLog plays={gameState.playLog} />
            
            <Card className="p-6 bg-slate-900 text-white border-none shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Game Status</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase">Quarter</span>
                    <span className="text-sm font-black">{gameState.quarter}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase">Clock</span>
                    <span className="text-sm font-black font-mono">
                      {Math.floor(gameState.gameClock / 60)}:{(gameState.gameClock % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Live Connection Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LiveView;