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
import DriveTracker from "@/components/DriveTracker";
import TopPerformers from "@/components/TopPerformers";
import { GameState, Player, Play, Team, PlayerStats, PlayType, Drive } from "@/types/football";
import { showSuccess, showError } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Settings, Users, FileText, Radio, Save, Calendar, PlusCircle, AlertTriangle, Archive, BarChart3, Share2, Copy, Lock, CheckCircle2, ArrowLeft, Clock, SlidersHorizontal, RefreshCw, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useBroadcast } from "@/context/BroadcastContext";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";

const TEAM_STORAGE_KEY = 'football_stat_keeper_teams_v1';
const GAME_STORAGE_KEY = 'football_stat_keeper_pro_v2';

const Index = () => {
  const { teamCode, isAdmin } = useAuth();
  const { connected } = useBroadcast();
  const navigate = useNavigate();
  const [history, setHistory] = useState<GameState[]>([]);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const getInitialState = useCallback(() => {
    const savedTeams = localStorage.getItem(`${TEAM_STORAGE_KEY}_${teamCode}`);
    const teamData = savedTeams ? JSON.parse(savedTeams) : null;
    
    const initialDriveId = Math.random().toString(36).substr(2, 9);
    return {
      homeTeam: teamData?.homeTeamName || "Home Team",
      awayTeam: teamData?.awayTeamName || "Away Team",
      homeScore: 0,
      awayScore: 0,
      homeTimeouts: 3,
      awayTimeouts: 3,
      possession: "Home" as Team,
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
        team: "Home" as Team,
        startYardLine: 25,
        plays: 0,
        yards: 0,
        startTime: Date.now()
      }],
      stats: {},
      roster: { 
        home: teamData?.homeRoster || [], 
        away: teamData?.awayRoster || [] 
      }
    };
  }, [teamCode]);

  const [gameState, setGameState] = useState<GameState>(() => {
    const savedGame = localStorage.getItem(`${GAME_STORAGE_KEY}_${teamCode}`);
    if (savedGame) return JSON.parse(savedGame);
    return getInitialState();
  });

  const [manualAdjust, setManualAdjust] = useState({
    down: gameState.down,
    distance: gameState.distance,
    yardLine: gameState.yardLine,
    homeScore: gameState.homeScore,
    awayScore: gameState.awayScore
  });

  const clockInterval = useRef<NodeJS.Timeout | null>(null);

  // Sync to Cloud and Local Storage
  useEffect(() => {
    localStorage.setItem(`${GAME_STORAGE_KEY}_${teamCode}`, JSON.stringify(gameState));
    
    if (supabase && teamCode && isAdmin) {
      const syncToCloud = async () => {
        await supabase.from('games').upsert({ id: teamCode, state: gameState, updated_at: new Date().toISOString() });
      };
      const timeout = setTimeout(syncToCloud, 1000);
      return () => clearTimeout(timeout);
    }
  }, [gameState, teamCode, isAdmin]);

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
    setHistory(prev => [gameState, ...prev].slice(0, 10));

    setGameState(prev => {
      const newState = { ...prev };
      const currentYardLine = prev.yardLine;
      let result = "";
      let newYardLine = currentYardLine;
      let isFirstDown = false;
      let isScoringPlay = false;

      const initStats = (pId: string) => {
        if (!newState.stats[pId]) {
          newState.stats[pId] = {
            passAtt: 0, passComp: 0, passYds: 0, passTDs: 0, ints: 0,
            rushAtt: 0, rushYds: 0, rushTDs: 0, receptions: 0, recYds: 0,
            recTDs: 0, fumbles: 0, tackles: 0, sacks: 0, forcedFumbles: 0,
            defInts: 0, fgAtt: 0, fgMade: 0, punts: 0, puntYds: 0, kickoffs: 0, kickYds: 0
          };
        }
      };

      if (player && newState.roster.home.some(p => p.id === player.id)) {
        initStats(player.id);
        const s = newState.stats[player.id];
        if (type === "Pass") { 
          s.passAtt += 1; s.passComp += 1; s.passYds += yards; 
          if (receiver) {
            initStats(receiver.id);
            newState.stats[receiver.id].receptions += 1;
            newState.stats[receiver.id].recYds += yards;
          }
        }
        if (type === "Run") { s.rushAtt += 1; s.rushYds += yards; }
        if (type === "Incomplete") { s.passAtt += 1; }
        if (type === "Sack") { s.sacks += 1; }
        if (type === "Tackle") { s.tackles += 1; }
        if (type === "Interception") { s.defInts += 1; }
        if (type === "Punt") { s.punts += 1; s.puntYds += yards; }
        if (type === "Field Goal") { s.fgAtt += 1; if (yards > 0) s.fgMade += 1; }
        if (type === "Kickoff") { s.kickoffs += 1; s.kickYds += yards; }
      }

      const currentDrive = newState.drives.find(d => d.id === newState.currentDriveId);
      if (currentDrive) { currentDrive.plays += 1; currentDrive.yards += yards; }

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
        }
        if (prev.possession === "Home") newState.homeScore += 7; else newState.awayScore += 7;
        if (currentDrive) currentDrive.result = "Touchdown";
        startNewDrive(newState, prev.possession === "Home" ? "Away" : "Home", prev.possession === "Home" ? 75 : 25);
      } else if (type === "Turnover" || type === "Punt" || type === "Interception") {
        if (currentDrive) currentDrive.result = type;
        startNewDrive(newState, prev.possession === "Home" ? "Away" : "Home", prev.possession === "Home" ? 75 : 25);
        result = type;
      } else if (type === "Field Goal") {
        if (yards > 0) {
          if (prev.possession === "Home") newState.homeScore += 3; else newState.awayScore += 3;
          result = "Field Goal Made";
        } else {
          result = "Field Goal Missed";
        }
        startNewDrive(newState, prev.possession === "Home" ? "Away" : "Home", prev.possession === "Home" ? 75 : 25);
      } else {
        const direction = prev.possession === "Home" ? 1 : -1;
        newYardLine = Math.max(0, Math.min(100, currentYardLine + (yards * direction)));
        result = `${type} for ${yards} yards`;
        if (yards >= prev.distance && type !== "Incomplete" && type !== "Penalty") {
          newState.down = 1; newState.distance = 10; isFirstDown = true;
        } else if (type !== "Penalty") {
          if (prev.down === 4) {
            if (currentDrive) currentDrive.result = "Downs";
            startNewDrive(newState, prev.possession === "Home" ? "Away" : "Home", prev.possession === "Home" ? 75 : 25);
          } else {
            newState.down = prev.down + 1;
            newState.distance = Math.max(0, prev.distance - yards);
          }
        }
        newState.yardLine = newYardLine;
      }

      newState.playLog = [{
        id: Math.random().toString(36).substr(2, 9),
        type, player, receiver, yards, result,
        down: prev.down, distance: prev.distance, yardLine: currentYardLine,
        possession: prev.possession, timestamp: Date.now(),
        isFirstDown, isScoringPlay, driveId: prev.currentDriveId
      }, ...prev.playLog];
      return newState;
    });
  };

  const startNewDrive = (state: GameState, team: Team, yardLine: number) => {
    const newDriveId = Math.random().toString(36).substr(2, 9);
    state.possession = team; state.down = 1; state.distance = 10; state.yardLine = yardLine; state.currentDriveId = newDriveId;
    state.drives.push({ id: newDriveId, team, startYardLine: yardLine, plays: 0, yards: 0, startTime: Date.now() });
  };

  const handleUndo = () => { if (history.length > 0) { setGameState(history[0]); setHistory(prev => prev.slice(1)); showSuccess("Play undone"); } };

  const handleSwitchPossession = () => {
    setGameState(prev => {
      const newState = { ...prev };
      startNewDrive(newState, prev.possession === "Home" ? "Away" : "Home", prev.yardLine);
      return newState;
    });
    showSuccess("Possession switched");
  };

  const handleManualAdjust = () => {
    setGameState(prev => ({
      ...prev,
      ...manualAdjust
    }));
    setIsAdjustDialogOpen(false);
    showSuccess("Game state adjusted");
  };

  const handleResetGame = () => {
    const freshState = getInitialState();
    setGameState(freshState);
    setHistory([]);
    setIsResetDialogOpen(false);
    showSuccess("Game reset to initial state");
  };

  const currentDrive = gameState.drives.find(d => d.id === gameState.currentDriveId);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />
      <main className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <Link to="/"><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5" /></Button></Link>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Home Team Command</h1>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DakStats Workflow Active</p>
                {connected && (
                  <Badge className="h-4 bg-emerald-500/10 text-emerald-600 border-emerald-200 text-[8px] font-black uppercase px-1.5">
                    Broadcast Live
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/broadcast-sync">
              <Button variant="outline" size="sm" className="h-12 font-black uppercase text-[10px] gap-2 border-blue-100 text-blue-600 hover:bg-blue-50">
                <RefreshCw className={`w-4 h-4 ${connected ? 'animate-spin-slow' : ''}`} /> Broadcast Sync
              </Button>
            </Link>
            
            <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-12 font-black uppercase text-[10px] gap-2 text-red-500 hover:bg-red-50 border-red-100">
                  <Trash2 className="w-4 h-4" /> Reset Game
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Current Game?</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-slate-500">This will clear all scores, plays, and stats for the current session. This action cannot be undone.</p>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsResetDialogOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleResetGame}>Reset Everything</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-12 font-black uppercase text-[10px] gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> Adjust State
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Manual Game Adjustment</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Down</Label>
                    <Input type="number" value={manualAdjust.down} onChange={e => setManualAdjust({...manualAdjust, down: parseInt(e.target.value) || 1})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Distance</Label>
                    <Input type="number" value={manualAdjust.distance} onChange={e => setManualAdjust({...manualAdjust, distance: parseInt(e.target.value) || 10})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Yard Line (0-100)</Label>
                    <Input type="number" value={manualAdjust.yardLine} onChange={e => setManualAdjust({...manualAdjust, yardLine: parseInt(e.target.value) || 25})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Home Score</Label>
                    <Input type="number" value={manualAdjust.homeScore} onChange={e => setManualAdjust({...manualAdjust, homeScore: parseInt(e.target.value) || 0})} />
                  </div>
                </div>
                <DialogFooter><Button onClick={handleManualAdjust} className="w-full bg-slate-900">Apply Changes</Button></DialogFooter>
              </DialogContent>
            </Dialog>
            <GameClock seconds={gameState.gameClock} isRunning={gameState.isClockRunning} onToggle={() => isAdmin && setGameState(prev => ({ ...prev, isClockRunning: !prev.isClockRunning }))} onReset={() => isAdmin && setGameState(prev => ({ ...prev, gameClock: 900, isClockRunning: false }))} onNextQuarter={() => isAdmin && setGameState(prev => ({ ...prev, quarter: Math.min(4, prev.quarter + 1) }))} quarter={gameState.quarter} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <Scoreboard homeTeam={gameState.homeTeam} awayTeam={gameState.awayTeam} homeScore={gameState.homeScore} awayScore={gameState.awayScore} homeTimeouts={gameState.homeTimeouts} awayTimeouts={gameState.awayTimeouts} possession={gameState.possession} down={gameState.down} distance={gameState.distance} quarter={gameState.quarter} />
            
            <TopPerformers stats={gameState.stats} roster={gameState.roster} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="md:col-span-2 p-8 bg-white border-none shadow-sm">
                <FootballField ballPosition={gameState.yardLine} possession={gameState.possession} onSpotBall={(y) => isAdmin && setGameState(prev => ({ ...prev, yardLine: y }))} />
              </Card>
              <div className="space-y-6">
                <WinProbability homeProb={50 + (gameState.homeScore - gameState.awayScore) * 2} homeTeam={gameState.homeTeam} awayTeam={gameState.awayTeam} />
                <DriveTracker currentDrive={currentDrive} teamName={gameState.possession === "Home" ? gameState.homeTeam : gameState.awayTeam} />
              </div>
            </div>
            <StatsTable players={gameState.roster.home} stats={gameState.stats} title={`${gameState.homeTeam} Performance`} />
          </div>
          <div className="lg:col-span-4 space-y-8">
            <Card className="p-8 bg-white border-none shadow-sm">
              {isAdmin ? (
                <ActionPanel 
                  homeRoster={gameState.roster.home}
                  onAction={handleAction}
                  onUndo={handleUndo}
                  onSwitchPossession={handleSwitchPossession}
                  canUndo={history.length > 0}
                  isHomeOffense={gameState.possession === "Home"}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8"><Lock className="w-8 h-8 text-slate-200 mb-4" /><p className="text-xs font-black uppercase text-slate-400">Viewer Mode</p></div>
              )}
            </Card>
            <PlayLog plays={gameState.playLog} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;