"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Scoreboard from "@/components/Scoreboard";
import FootballField from "@/components/FootballField";
import ActionPanel from "@/components/ActionPanel";
import PlayLog from "@/components/PlayLog";
import StatsTable from "@/components/StatsTable";
import { GameState, Player, Play, Team, PlayerStats, PlayType } from "@/types/football";
import { showSuccess, showError } from "@/utils/toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const STORAGE_KEY = 'football_stat_keeper_pro_v1';

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    
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
      playLog: [],
      roster: {
        home: INITIAL_ROSTER_HOME,
        away: INITIAL_ROSTER_AWAY,
      },
      stats: {}
    };
  });

  const [history, setHistory] = useState<GameState[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

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

  const handleSpotBall = (yardLine: number) => {
    saveToHistory();
    setGameState(prev => ({ ...prev, yardLine }));
  };

  const updatePlayerStats = (stats: Record<string, PlayerStats>, player: Player, type: PlayType, yards: number) => {
    const current = stats[player.id] || {
      passAtt: 0, passComp: 0, passYds: 0, passTDs: 0, ints: 0,
      rushAtt: 0, rushYds: 0, rushTDs: 0, receptions: 0, recYds: 0,
      recTDs: 0, fumbles: 0, tackles: 0, sacks: 0
    };

    const updated = { ...current };
    
    switch (type) {
      case "Pass":
        updated.passAtt += 1;
        updated.passComp += 1;
        updated.passYds += yards;
        break;
      case "Incomplete":
        updated.passAtt += 1;
        break;
      case "Run":
        updated.rushAtt += 1;
        updated.rushYds += yards;
        break;
      case "Sack":
        updated.passAtt += 1; // Often counted as pass attempt or just sack
        updated.rushYds += yards; // Sacks are negative rushing yards in college, pass yards in NFL
        break;
      case "Touchdown":
        // Logic depends on previous play, but for simplicity:
        updated.rushTDs += 1;
        break;
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

      if (type === "Touchdown") {
        isScoringPlay = true;
        if (prev.possession === "Home") {
          newState.homeScore += 7;
          newYardLine = 65;
          newState.possession = "Away";
        } else {
          newState.awayScore += 7;
          newYardLine = 35;
          newState.possession = "Home";
        }
        newState.down = 1;
        newState.distance = 10;
        result = "TOUCHDOWN!";
        if (player) newState.stats = updatePlayerStats(newState.stats, player, type, yards);
      } else if (type === "Turnover") {
        newState.possession = prev.possession === "Home" ? "Away" : "Home";
        newState.down = 1;
        newState.distance = 10;
        result = "Turnover";
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
          } else {
            newState.down = prev.down + 1;
            newState.distance = Math.max(0, prev.distance - yards);
          }
        }
        newState.yardLine = newYardLine;
      }

      const newPlay: Play = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        player,
        yards,
        result,
        down: prev.down,
        distance: prev.distance,
        yardLine: currentYardLine,
        possession: prev.possession,
        timestamp: Date.now(),
        isFirstDown,
        isScoringPlay
      };

      newState.playLog = [newPlay, ...prev.playLog];
      return newState;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Game Status & Controls */}
        <div className="lg:col-span-8 space-y-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Field Spotter</h2>
                <div className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded">LIVE POSITION</div>
              </div>
              <FootballField 
                ballPosition={gameState.yardLine}
                possession={gameState.possession}
                onSpotBall={handleSpotBall}
              />
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <ActionPanel 
                roster={gameState.possession === "Home" ? gameState.roster.home : gameState.roster.away}
                onAction={handleAction}
                onUndo={handleUndo}
                canUndo={history.length > 0}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatsTable 
              title={gameState.homeTeam} 
              players={gameState.roster.home} 
              stats={gameState.stats} 
            />
            <StatsTable 
              title={gameState.awayTeam} 
              players={gameState.roster.away} 
              stats={gameState.stats} 
            />
          </div>
        </div>

        {/* Right: Play Log */}
        <div className="lg:col-span-4">
          <div className="sticky top-6 h-[calc(100vh-3rem)]">
            <PlayLog plays={gameState.playLog} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Index;