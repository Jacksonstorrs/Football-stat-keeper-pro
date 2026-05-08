"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Scoreboard from "@/components/Scoreboard";
import FootballField from "@/components/FootballField";
import ActionPanel from "@/components/ActionPanel";
import PlayLog from "@/components/PlayLog";
import StatsTable from "@/components/StatsTable";
import GameClock from "@/components/GameClock";
import TeamStats from "@/components/TeamStats";
import WinProbability from "@/components/WinProbability";
import { GameState, Player, Play, Team, PlayerStats, PlayType, Drive } from "@/types/football";
import { showSuccess, showError } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Settings, Users, FileText, Radio, Save, Calendar, PlusCircle, AlertTriangle, Archive, BarChart3, Share2, Copy, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const INITIAL_ROSTER_HOME: Player[] = [
  { id: 'h1', name: 'J. Smith', number: 12, position: 'QB' },
  { id: 'h2', name: 'M. Brown', number: 24, position: 'RB' },
  { id: 'h3', name: 'T. Wilson', number: 88, position: 'WR' },
  { id: 'h4', name: 'D. Jones', number: 15, position: 'WR' },
];

const INITIAL_ROSTER_AWAY: Player[] = [
  { id: 'a1', name: 'K. Murray', number: 1, position: 'QB' },
  { id: 'a2', name: 'C. Johnson', number: 33, position: 'RB' },
  { id: 'a3', name: 'L. Fitz', number: 11, position: 'WR' },
  { id: 'a4', name: 'A. Green', number: 18, position: 'WR' },
];

const GAME_STORAGE_KEY = 'football_stat_keeper_pro_v2';
const SEASON_STORAGE_KEY = 'football_stat_keeper_season_v1';

const Index = () => {
  const { teamCode, isAdmin } = useAuth();
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedGame = localStorage.getItem(GAME_STORAGE_KEY);
    
    if (savedGame) return JSON.parse(savedGame);
    
    const initialDriveId = Math.random().toString(36).substr(2, 9);
    return {
      homeTeam: "Wildcats",
      awayTeam: "Eagles",
      homeScore: 0,
      awayScore: 0,
      homeTimeouts: 3,
      awayTimeouts: 3,
      possession: "Home",
      down: 1,
      distance: 10,
      yardLine: 25,
      quarter: 1,
      gameClock: 900,
      isClockRunning: false,
      currentDriveId: initialDriveId,
      playLog: [],
      drives: [{
        id: initialDriveId,
        team: "Home",
        startYardLine: 25,
        plays: 0,
        yards: 0,
        startTime: Date.now()
      }],
      stats: {},
      roster: { home: INITIAL_ROSTER_HOME, away: INITIAL_ROSTER_AWAY }
    };
  });

  const [history, setHistory] = useState<GameState[]>([]);
  const clockInterval = useRef<NodeJS.Timeout | null>(null);

  // Sync with Supabase
  useEffect(() => {
    if (!supabase || !teamCode) return;

    const syncToCloud = async () => {
      if (!isAdmin) return;
      await supabase
        .from('games')
        .upsert({ 
          id: teamCode, 
          state: gameState,
          updated_at: new Date().toISOString()
        });
    };

    const timeout = setTimeout(syncToCloud, 1000);
    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(gameState));
    return () => clearTimeout(timeout);
  }, [gameState, teamCode, isAdmin]);

  // Real-time subscription for non-admins
  useEffect(() => {
    if (!supabase || !teamCode || isAdmin) return;

    const channel = supabase
      .channel(`game_${teamCode}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${teamCode}` }, 
        payload => {
          setGameState(payload.new.state);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [teamCode, isAdmin]);

  useEffect(() => {
    if (gameState.isClockRunning && gameState.gameClock > 0) {
      clockInterval.current = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          gameClock: Math.max(0, prev.gameClock - 1),
          isClockRunning: prev.gameClock > 1
        }));
      }, 1000);
    } else {
      if (clockInterval.current) clearInterval(clockInterval.current);
    }
    return () => { if (clockInterval.current) clearInterval(clockInterval.current); };
  }, [gameState.isClockRunning, gameState.gameClock]);

  const saveToHistory = useCallback(() => {
    setHistory(prev => [...prev, { ...gameState }]);
  }, [gameState]);

  const handleAction = (type: PlayType, yards: number, player?: Player, receiver?: Player) => {
    if (!isAdmin) {
      showError("Admin access required to track plays");
      return;
    }
    saveToHistory();
    
    setGameState(prev => {
      const newState = { ...prev };
      const currentYardLine = prev.yardLine;
      let result = "";
      let newYardLine = currentYardLine;
      let isFirstDown = false;
      let isScoringPlay = false;
      let possessionChanged = false;

      if (type === "Touchdown") {
        isScoringPlay = true;
        if (prev.possession === "Home") {
          newState.homeScore += 7;
          newYardLine = 65;
        } else {
          newState.awayScore += 7;
          newYardLine = 35;
        }
        newState.possession = prev.possession === "Home" ? "Away" : "Home";
        newState.down = 1;
        newState.distance = 10;
        result = "TOUCHDOWN!";
        possessionChanged = true;
      } else if (type === "Turnover" || type === "Punt") {
        newState.possession = prev.possession === "Home" ? "Away" : "Home";
        newState.down = 1;
        newState.distance = 10;
        result = type;
        possessionChanged = true;
        newYardLine = newState.possession === "Home" ? 25 : 75;
      } else {
        const direction = prev.possession === "Home" ? 1 : -1;
        newYardLine = Math.max(0, Math.min(100, currentYardLine + (yards * direction)));
        result = `${type} for ${yards} yards`;
        
        if (yards >= prev.distance && type !== "Incomplete" && type !== "Penalty") {
          newState.down = 1;
          newState.distance = 10;
          isFirstDown = true;
        } else if (type !== "Penalty") {
          if (prev.down === 4) {
            newState.possession = prev.possession === "Home" ? "Away" : "Home";
            newState.down = 1;
            newState.distance = 10;
            possessionChanged = true;
          } else {
            newState.down = prev.down + 1;
            newState.distance = Math.max(0, prev.distance - yards);
          }
        }
        newState.yardLine = newYardLine;
      }

      const newPlay: Play = {
        id: Math.random().toString(36).substr(2, 9),
        type, player, receiver, yards, result,
        down: prev.down, distance: prev.distance, yardLine: currentYardLine,
        possession: prev.possession, timestamp: Date.now(),
        isFirstDown, isScoringPlay, driveId: prev.currentDriveId
      };

      newState.playLog = [newPlay, ...prev.playLog];
      return newState;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      {!isAdmin && (
        <div className="max-w-[1400px] mx-auto mb-4">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center gap-3 text-amber-800 text-xs font-bold">
            <Lock className="w-4 h-4" />
            VIEWER MODE: You are watching a live sync. Only admins can record plays.
          </div>
        </div>
      )}
      
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black tracking-tighter text-slate-900">STAT KEEPER PRO</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-100">
              <Radio className="w-3 h-3 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Live Sync Active</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link to="/live/current" target="_blank">
              <Button variant="default" className="gap-2 bg-red-600 hover:bg-red-700">
                <Share2 className="w-4 h-4" /> Go Live
              </Button>
            </Link>
            <Link to="/coach-analytics">
              <Button variant="outline" className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
                <BarChart3 className="w-4 h-4" /> Coach Analytics
              </Button>
            </Link>
            <Link to="/games">
              <Button variant="outline" className="gap-2 bg-white">
                <Calendar className="w-4 h-4" /> Season
              </Button>
            </Link>
            <Link to="/report">
              <Button variant="outline" className="gap-2 bg-white">
                <FileText className="w-4 h-4" /> Game Report
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Scoreboard 
                  homeTeam={gameState.homeTeam} awayTeam={gameState.awayTeam}
                  homeScore={gameState.homeScore} awayScore={gameState.awayScore}
                  homeTimeouts={gameState.homeTimeouts} awayTimeouts={gameState.awayTimeouts}
                  possession={gameState.possession} down={gameState.down}
                  distance={gameState.distance} quarter={gameState.quarter}
                />
              </div>
              <div className="space-y-4">
                <GameClock 
                  seconds={gameState.gameClock}
                  isRunning={gameState.isClockRunning}
                  onToggle={() => isAdmin && setGameState(prev => ({ ...prev, isClockRunning: !prev.isClockRunning }))}
                  onReset={() => isAdmin && setGameState(prev => ({ ...prev, gameClock: 900, isClockRunning: false }))}
                  onNextQuarter={() => isAdmin && setGameState(prev => ({ ...prev, quarter: Math.min(4, prev.quarter + 1), gameClock: 900 }))}
                  quarter={gameState.quarter}
                />
                <WinProbability 
                  homeProb={50} 
                  homeTeam={gameState.homeTeam} 
                  awayTeam={gameState.awayTeam} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <FootballField 
                  ballPosition={gameState.yardLine}
                  possession={gameState.possession}
                  onSpotBall={(y) => isAdmin && setGameState(prev => ({ ...prev, yardLine: y }))}
                />
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                {isAdmin ? (
                  <ActionPanel 
                    roster={gameState.possession === "Home" ? gameState.roster.home : gameState.roster.away}
                    opponentRoster={gameState.possession === "Home" ? gameState.roster.away : gameState.roster.home}
                    onAction={handleAction}
                    onUndo={() => {}}
                    canUndo={false}
                    isHomeTeam={gameState.possession === "Home"}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <Lock className="w-12 h-12 text-slate-200" />
                    <div>
                      <h3 className="font-black uppercase text-slate-900">Read Only</h3>
                      <p className="text-xs text-slate-500">Login as Admin to record plays</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TeamStats team="Home" teamName={gameState.homeTeam} plays={gameState.playLog} />
              <TeamStats team="Away" teamName={gameState.awayTeam} plays={gameState.playLog} />
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-6 h-[calc(100vh-8rem)]">
              <PlayLog plays={gameState.playLog} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;