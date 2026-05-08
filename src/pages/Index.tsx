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
import { Card } from "@/components/ui/card";
import { Settings, Users, FileText, Radio, Save, Calendar, PlusCircle, AlertTriangle, Archive, BarChart3, Share2, Copy, Lock, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";

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
  const navigate = useNavigate();
  const [history, setHistory] = useState<GameState[]>([]);
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedGame = localStorage.getItem(`${GAME_STORAGE_KEY}_${teamCode}`);
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

  const clockInterval = useRef<NodeJS.Timeout | null>(null);

  // Sync Live Game to Supabase
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
    localStorage.setItem(`${GAME_STORAGE_KEY}_${teamCode}`, JSON.stringify(gameState));
    return () => clearTimeout(timeout);
  }, [gameState, teamCode, isAdmin]);

  // Real-time subscription for non-admins
  useEffect(() => {
    if (!supabase || !teamCode || isAdmin) return;

    const channel = supabase
      .channel(`game_${teamCode}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${teamCode}` }, 
        payload => {
          if (payload.new && payload.new.state) {
            setGameState(payload.new.state);
          }
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

  const handleAction = (type: PlayType, yards: number, player?: Player, receiver?: Player) => {
    if (!isAdmin) return showError("Admin access required");
    
    // Save current state to history before modifying
    setHistory(prev => [gameState, ...prev].slice(0, 10));

    setGameState(prev => {
      const newState = { ...prev };
      const currentYardLine = prev.yardLine;
      let result = "";
      let newYardLine = currentYardLine;
      let isFirstDown = false;
      let isScoringPlay = false;

      // Initialize stats if missing
      const initStats = (pId: string) => {
        if (!newState.stats[pId]) {
          newState.stats[pId] = {
            passAtt: 0, passComp: 0, passYds: 0, passTDs: 0, ints: 0,
            rushAtt: 0, rushYds: 0, rushTDs: 0, receptions: 0, recYds: 0,
            recTDs: 0, fumbles: 0, tackles: 0, sacks: 0
          };
        }
      };

      // Update Stats
      if (player) {
        initStats(player.id);
        const s = newState.stats[player.id];
        
        if (type === "Pass") { 
          s.passAtt += 1; 
          s.passComp += 1; 
          s.passYds += yards; 
          if (receiver) {
            initStats(receiver.id);
            newState.stats[receiver.id].receptions += 1;
            newState.stats[receiver.id].recYds += yards;
          }
        }
        if (type === "Run") { s.rushAtt += 1; s.rushYds += yards; }
        if (type === "Incomplete") { s.passAtt += 1; }
        if (type === "Sack") { s.sacks += 1; }
        if (type === "Interception") { s.ints += 1; }
        if (type === "Fumble") { s.fumbles += 1; }
      }

      if (type === "Touchdown") {
        isScoringPlay = true;
        if (player) {
          initStats(player.id);
          if (receiver) {
            newState.stats[player.id].passTDs += 1;
            newState.stats[player.id].passYds += yards;
            initStats(receiver.id);
            newState.stats[receiver.id].receptions += 1;
            newState.stats[receiver.id].recYds += yards;
            newState.stats[receiver.id].recTDs += 1;
            result = `Pass TD from #${player.number} to #${receiver.number} (${yards} yds)`;
          } else {
            newState.stats[player.id].rushTDs += 1;
            newState.stats[player.id].rushAtt += 1;
            newState.stats[player.id].rushYds += yards;
            result = `Rush TD by #${player.number} (${yards} yds)`;
          }
        } else {
          result = "TOUCHDOWN!";
        }

        if (prev.possession === "Home") { newState.homeScore += 7; }
        else { newState.awayScore += 7; }
        
        newState.possession = prev.possession === "Home" ? "Away" : "Home";
        newState.down = 1; 
        newState.distance = 10;
        newYardLine = newState.possession === "Home" ? 25 : 75;
      } else if (type === "Turnover" || type === "Punt" || type === "Interception") {
        newState.possession = prev.possession === "Home" ? "Away" : "Home";
        newState.down = 1; 
        newState.distance = 10;
        result = type === "Interception" ? `Interception by #${player?.number}` : type;
        newYardLine = newState.possession === "Home" ? 25 : 75;
      } else {
        const direction = prev.possession === "Home" ? 1 : -1;
        newYardLine = Math.max(0, Math.min(100, currentYardLine + (yards * direction)));
        result = `${type} for ${yards} yards`;
        
        if (yards >= prev.distance && type !== "Incomplete" && type !== "Penalty") {
          newState.down = 1; newState.distance = 10; isFirstDown = true;
        } else if (type !== "Penalty") {
          if (prev.down === 4) {
            newState.possession = prev.possession === "Home" ? "Away" : "Home";
            newState.down = 1; newState.distance = 10;
            newYardLine = newState.possession === "Home" ? 25 : 75;
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

  const handleUndo = () => {
    if (history.length === 0) return;
    const previousState = history[0];
    setGameState(previousState);
    setHistory(prev => prev.slice(1));
    showSuccess("Play undone");
  };

  const finalizeGame = async () => {
    if (!isAdmin) return;
    
    let seasonData = [];
    if (supabase) {
      const { data } = await supabase.from('seasons').select('data').eq('id', teamCode).single();
      if (data?.data) seasonData = data.data;
    } else {
      const saved = localStorage.getItem(`${SEASON_STORAGE_KEY}_${teamCode}`);
      if (saved) seasonData = JSON.parse(saved);
    }

    const finalizedGame = { ...gameState, status: 'completed' };
    const updatedSeason = [finalizedGame, ...seasonData];

    if (supabase) {
      await supabase.from('seasons').upsert({ id: teamCode, data: updatedSeason, updated_at: new Date().toISOString() });
    }
    localStorage.setItem(`${SEASON_STORAGE_KEY}_${teamCode}`, JSON.stringify(updatedSeason));

    localStorage.removeItem(`${GAME_STORAGE_KEY}_${teamCode}`);
    showSuccess("Game finalized and saved to season!");
    navigate("/games");
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />
      
      <main className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8">
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white hover:shadow-sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Live Tracker</h1>
                <div className="flex items-center gap-2 px-2 py-0.5 bg-red-50 text-red-600 rounded-full border border-red-100">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Live Session</span>
                </div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Code: {teamCode}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center">
            {isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest gap-2 shadow-lg shadow-emerald-100 transition-all active:scale-95">
                    <CheckCircle2 className="w-4 h-4" /> Finalize Game
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-black uppercase tracking-tight">Finalize this game?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-500 font-medium">
                      This will end the live session and archive all statistics to the season dashboard. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel className="rounded-xl font-bold uppercase tracking-widest text-[10px]">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={finalizeGame} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold uppercase tracking-widest text-[10px]">Finalize & Save</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Link to="/report">
              <Button variant="outline" className="h-11 px-6 bg-white border-slate-200 font-black uppercase tracking-widest text-[10px] gap-2 hover:bg-slate-50">
                <FileText className="w-4 h-4" /> Report
              </Button>
            </Link>
          </div>
        </div>

        {!isAdmin && (
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-4 text-amber-800">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest">Viewer Mode Active</p>
              <p className="text-[10px] font-medium opacity-80">You are viewing live updates for Team {teamCode}. Controls are disabled.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <Scoreboard 
              homeTeam={gameState.homeTeam} awayTeam={gameState.awayTeam}
              homeScore={gameState.homeScore} awayScore={gameState.awayScore}
              homeTimeouts={gameState.homeTimeouts} awayTimeouts={gameState.awayTimeouts}
              possession={gameState.possession} down={gameState.down}
              distance={gameState.distance} quarter={gameState.quarter}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8 bg-white border-none shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Field Position</h3>
                  <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                    Ball at: {gameState.yardLine > 50 ? `Away ${100 - gameState.yardLine}` : `Home ${gameState.yardLine}`}
                  </div>
                </div>
                <FootballField 
                  ballPosition={gameState.yardLine}
                  possession={gameState.possession}
                  onSpotBall={(y) => isAdmin && setGameState(prev => ({ ...prev, yardLine: y }))}
                />
              </Card>

              <Card className="p-8 bg-white border-none shadow-sm">
                {isAdmin ? (
                  <ActionPanel 
                    roster={gameState.possession === "Home" ? gameState.roster.home : gameState.roster.away}
                    opponentRoster={gameState.possession === "Home" ? gameState.roster.away : gameState.roster.home}
                    onAction={handleAction}
                    onUndo={handleUndo}
                    canUndo={history.length > 0}
                    isHomeTeam={gameState.possession === "Home"}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                      <Lock className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Read Only</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">Waiting for admin updates...</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <TeamStats team="Home" teamName={gameState.homeTeam} plays={gameState.playLog} />
              <TeamStats team="Away" teamName={gameState.awayTeam} plays={gameState.playLog} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 h-[calc(100vh-10rem)]">
              <PlayLog plays={gameState.playLog} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;