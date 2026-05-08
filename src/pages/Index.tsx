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
import { Settings, Users, FileText, Radio, Save, Calendar, PlusCircle, AlertTriangle, Archive, BarChart3, Share2, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
const TEAM_STORAGE_KEY = 'football_stat_keeper_teams_v1';
const SEASON_STORAGE_KEY = 'football_stat_keeper_season_v1';

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedGame = localStorage.getItem(GAME_STORAGE_KEY);
    const savedTeams = localStorage.getItem(TEAM_STORAGE_KEY);
    
    let initialTeams = {
      homeTeam: "Wildcats",
      awayTeam: "Eagles",
      roster: { home: INITIAL_ROSTER_HOME, away: INITIAL_ROSTER_AWAY }
    };

    if (savedTeams) {
      const teamData = JSON.parse(savedTeams);
      initialTeams = {
        homeTeam: teamData.homeTeamName || "Wildcats",
        awayTeam: teamData.awayTeamName || "Eagles",
        roster: { home: teamData.homeRoster || INITIAL_ROSTER_HOME, away: teamData.awayRoster || INITIAL_ROSTER_AWAY }
      };
    }

    if (savedGame) {
      const gameData = JSON.parse(savedGame);
      return { ...gameData, ...initialTeams };
    }
    
    const initialDriveId = Math.random().toString(36).substr(2, 9);
    return {
      ...initialTeams,
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
      stats: {}
    };
  });

  const [history, setHistory] = useState<GameState[]>([]);
  const clockInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

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

  const handleUndo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setGameState(previousState);
      setHistory(prev => prev.slice(0, -1));
      showSuccess("Action undone");
    }
  };

  const handleCopyLink = () => {
    const liveUrl = `${window.location.origin}/live/current`;
    navigator.clipboard.writeText(liveUrl);
    showSuccess("Live link copied to clipboard!");
  };

  const handleSaveToSeason = () => {
    const savedSeason = localStorage.getItem(SEASON_STORAGE_KEY);
    const seasonData = savedSeason ? JSON.parse(savedSeason) : [];
    const updatedSeason = [gameState, ...seasonData];
    localStorage.setItem(SEASON_STORAGE_KEY, JSON.stringify(updatedSeason));
    showSuccess("Game archived to season stats!");
  };

  const handleNewGame = () => {
    const initialDriveId = Math.random().toString(36).substr(2, 9);
    const newState: GameState = {
      ...gameState,
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
      stats: {}
    };
    setGameState(newState);
    setHistory([]);
    showSuccess("New game started!");
  };

  const calculateWinProb = () => {
    const scoreDiff = gameState.homeScore - gameState.awayScore;
    const timeRemaining = (4 - gameState.quarter) * 900 + gameState.gameClock;
    const baseProb = 50 + (scoreDiff * 2);
    const timeFactor = (3600 - timeRemaining) / 3600;
    const finalProb = Math.max(1, Math.min(99, baseProb + (scoreDiff * timeFactor * 5)));
    return Math.round(finalProb);
  };

  const updatePlayerStats = (stats: Record<string, PlayerStats>, player: Player, type: PlayType, yards: number) => {
    const current = stats[player.id] || {
      passAtt: 0, passComp: 0, passYds: 0, passTDs: 0, ints: 0,
      rushAtt: 0, rushYds: 0, rushTDs: 0, receptions: 0, recYds: 0,
      recTDs: 0, fumbles: 0, tackles: 0, sacks: 0
    };

    const updated = { ...current };
    switch (type) {
      case "Pass": updated.passAtt += 1; updated.passComp += 1; updated.passYds += yards; break;
      case "Incomplete": updated.passAtt += 1; break;
      case "Run": updated.rushAtt += 1; updated.rushYds += yards; break;
      case "Sack": updated.sacks += 1; updated.rushYds += yards; break;
      case "Touchdown": updated.rushTDs += 1; break;
      case "Turnover": updated.ints += 1; break;
    }
    return { ...stats, [player.id]: updated };
  };

  const handleAction = (type: PlayType, yards: number, player?: Player) => {
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
        if (player) newState.stats = updatePlayerStats(newState.stats, player, type, yards);
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
        
        if (player) newState.stats = updatePlayerStats(newState.stats, player, type, yards);

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
        type, player, yards, result,
        down: prev.down, distance: prev.distance, yardLine: currentYardLine,
        possession: prev.possession, timestamp: Date.now(),
        isFirstDown, isScoringPlay, driveId: prev.currentDriveId
      };

      newState.playLog = [newPlay, ...prev.playLog];

      const driveIdx = newState.drives.findIndex(d => d.id === prev.currentDriveId);
      if (driveIdx !== -1) {
        newState.drives[driveIdx].plays += 1;
        newState.drives[driveIdx].yards += (type === "Penalty" ? 0 : yards);
        if (possessionChanged) {
          newState.drives[driveIdx].result = type;
          newState.drives[driveIdx].endYardLine = newYardLine;
          
          const newDriveId = Math.random().toString(36).substr(2, 9);
          newState.currentDriveId = newDriveId;
          newState.drives.push({
            id: newDriveId,
            team: newState.possession,
            startYardLine: newYardLine,
            plays: 0,
            yards: 0,
            startTime: Date.now()
          });
        }
      }

      return newState;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
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
            <div className="flex gap-1">
              <Link to="/live/current" target="_blank">
                <Button variant="default" className="gap-2 bg-red-600 hover:bg-red-700 rounded-r-none">
                  <Share2 className="w-4 h-4" /> Go Live
                </Button>
              </Link>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="default" 
                    className="bg-red-700 hover:bg-red-800 rounded-l-none px-3"
                    onClick={handleCopyLink}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy Share Link</TooltipContent>
              </Tooltip>
            </div>

            <Link to="/coach-analytics">
              <Button variant="outline" className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
                <BarChart3 className="w-4 h-4" /> Coach Analytics
              </Button>
            </Link>
            <Button onClick={handleSaveToSeason} variant="outline" className="gap-2 bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100">
              <Archive className="w-4 h-4" /> Archive Game
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-white text-red-600 border-red-100 hover:bg-red-50">
                  <PlusCircle className="w-4 h-4" /> New Game
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Start New Game?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset the current scoreboard and play log. Make sure you've archived the current game first if you want to keep the stats.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleNewGame} className="bg-red-600 hover:bg-red-700">Reset Game</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
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
            <Link to="/teams">
              <Button variant="outline" className="gap-2 bg-white">
                <Users className="w-4 h-4" /> Manage Teams
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
                  onToggle={() => setGameState(prev => ({ ...prev, isClockRunning: !prev.isClockRunning }))}
                  onReset={() => setGameState(prev => ({ ...prev, gameClock: 900, isClockRunning: false }))}
                  onNextQuarter={() => setGameState(prev => ({ ...prev, quarter: Math.min(4, prev.quarter + 1), gameClock: 900 }))}
                  quarter={gameState.quarter}
                />
                <WinProbability 
                  homeProb={calculateWinProb()} 
                  homeTeam={gameState.homeTeam} 
                  awayTeam={gameState.awayTeam} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Field Spotter</h2>
                  <div className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded">LIVE POSITION</div>
                </div>
                <FootballField 
                  ballPosition={gameState.yardLine}
                  possession={gameState.possession}
                  onSpotBall={(y) => setGameState(prev => ({ ...prev, yardLine: y }))}
                />
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <ActionPanel 
                  roster={gameState.possession === "Home" ? gameState.roster.home : gameState.roster.away}
                  opponentRoster={gameState.possession === "Home" ? gameState.roster.away : gameState.roster.home}
                  onAction={handleAction}
                  onUndo={handleUndo}
                  canUndo={history.length > 0}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TeamStats team="Home" teamName={gameState.homeTeam} plays={gameState.playLog} />
              <TeamStats team="Away" teamName={gameState.awayTeam} plays={gameState.playLog} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatsTable title={gameState.homeTeam} players={gameState.roster.home} stats={gameState.stats} />
              <StatsTable title={gameState.awayTeam} players={gameState.roster.away} stats={gameState.stats} />
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