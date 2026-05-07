"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Scoreboard from "@/components/Scoreboard";
import FootballField from "@/components/FootballField";
import ActionPanel from "@/components/ActionPanel";
import PlayLog from "@/components/PlayLog";
import StatsTable from "@/components/StatsTable";
import { GameState, Player, Play, Team, Drive, PlayerStats } from "@/types/football";
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

const STORAGE_KEY = 'football_stat_keeper_v1';

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
      drives: [],
      roster: {
        home: INITIAL_ROSTER_HOME,
        away: INITIAL_ROSTER_AWAY,
      },
      stats: {}
    };
  });

  const [history, setHistory] = useState<GameState[]>([]);

  // Persistence
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
      showSuccess("Last action undone");
    }
  };

  const handleSpotBall = (yardLine: number) => {
    saveToHistory();
    setGameState(prev => ({
      ...prev,
      yardLine
    }));
  };

  const updateStats = (stats: Record<string, PlayerStats>, player: Player, type: string, yards: number, isTD: boolean) => {
    const current = stats[player.id] || {
      passYds: 0, passTDs: 0, ints: 0, rushYds: 0, rushTDs: 0,
      receptions: 0, recYds: 0, tackles: 0
    };

    const updated = { ...current };
    if (type === "Pass") {
      updated.passYds += yards;
      if (isTD) updated.passTDs += 1;
    } else if (type === "Run") {
      updated.rushYds += yards;
      if (isTD) updated.rushTDs += 1;
    }

    return { ...stats, [player.id]: updated };
  };

  const handleAction = (type: "Run" | "Pass" | "Touchdown" | "Turnover", player?: Player) => {
    saveToHistory();
    
    setGameState(prev => {
      const newState = { ...prev };
      const currentYardLine = prev.yardLine;
      const yardsGained = type === "Touchdown" ? (prev.possession === "Home" ? 100 - currentYardLine : currentYardLine) : Math.floor(Math.random() * 12) + 1;
      
      let result = "";
      let newYardLine = currentYardLine;
      let isFirstDown = false;
      let isScoringPlay = false;

      if (type === "Touchdown") {
        isScoringPlay = true;
        if (prev.possession === "Home") {
          newState.homeScore += 7;
          newYardLine = 65; // Kickoff
          newState.possession = "Away";
        } else {
          newState.awayScore += 7;
          newYardLine = 35; // Kickoff
          newState.possession = "Home";
        }
        newState.down = 1;
        newState.distance = 10;
        result = "TOUCHDOWN!";
        if (player) newState.stats = updateStats(newState.stats, player, "Run", yardsGained, true);
        showSuccess(`${prev.possession} Team Touchdown!`);
      } else if (type === "Turnover") {
        newState.possession = prev.possession === "Home" ? "Away" : "Home";
        newState.down = 1;
        newState.distance = 10;
        result = "Turnover";
        showError("Turnover!");
      } else {
        const direction = prev.possession === "Home" ? 1 : -1;
        newYardLine = Math.max(0, Math.min(100, currentYardLine + (yardsGained * direction)));
        result = `${type} for ${yardsGained} yards`;
        
        if (player) newState.stats = updateStats(newState.stats, player, type, yardsGained, false);

        if (yardsGained >= prev.distance) {
          newState.down = 1;
          newState.distance = 10;
          isFirstDown = true;
          showSuccess("First Down!");
        } else {
          if (prev.down === 4) {
            newState.possession = prev.possession === "Home" ? "Away" : "Home";
            newState.down = 1;
            newState.distance = 10;
            showError("Turnover on Downs");
          } else {
            newState.down = prev.down + 1;
            newState.distance = prev.distance - yardsGained;
          }
        }
        newState.yardLine = newYardLine;
      }

      const newPlay: Play = {
        id: Math.random().toString(36).substr(2, 9),
        type: type === "Touchdown" || type === "Turnover" ? "Penalty" : type as any,
        player,
        yards: yardsGained,
        result,
        down: prev.down,
        distance: prev.distance,
        yardLine: currentYardLine,
        possession: prev.possession,
        timestamp: Date.now(),
        isFirstDown,
        isScoringPlay
      };

      // Simple drive logic: if possession changed or scoring play, start new drive
      // For this demo, we'll just keep a flat play log for simplicity in the UI
      // but the data structure supports drives.
      const updatedPlayLog = [newPlay, ...prev.drives.flatMap(d => d.plays)];
      
      // We'll store plays in a single active drive for now
      const activeDrive: Drive = {
        id: 'current',
        possession: newState.possession,
        plays: [newPlay, ...(prev.drives[0]?.plays || [])],
        result: isScoringPlay ? "Touchdown" : "Active",
        startYardLine: prev.drives[0]?.startYardLine || currentYardLine,
        endYardLine: newYardLine
      };

      newState.drives = [activeDrive];
      return newState;
    });
  };

  const allPlays = gameState.drives.flatMap(d => d.plays);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Game Controls */}
        <div className="lg:col-span-7 space-y-6">
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

          <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Field Spotter</h2>
              <div className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
                TAP TO MOVE BALL
              </div>
            </div>
            <FootballField 
              ballPosition={gameState.yardLine}
              possession={gameState.possession}
              onSpotBall={handleSpotBall}
            />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <ActionPanel 
              roster={gameState.possession === "Home" ? gameState.roster.home : gameState.roster.away}
              onAction={handleAction}
              onUndo={handleUndo}
              canUndo={history.length > 0}
            />
          </div>
        </div>

        {/* Right Column: Logs & Stats */}
        <div className="lg:col-span-5 space-y-6">
          <Tabs defaultValue="plays" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="plays">Play-by-Play</TabsTrigger>
              <TabsTrigger value="stats">Box Score</TabsTrigger>
            </TabsList>
            
            <TabsContent value="plays" className="h-[calc(100vh-12rem)]">
              <PlayLog plays={allPlays} />
            </TabsContent>
            
            <TabsContent value="stats" className="space-y-4">
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
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
};

export default Index;