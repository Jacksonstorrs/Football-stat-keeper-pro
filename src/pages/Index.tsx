"use client";

import React, { useState, useCallback } from 'react';
import Scoreboard from "@/components/Scoreboard";
import FootballField from "@/components/FootballField";
import ActionPanel from "@/components/ActionPanel";
import PlayLog from "@/components/PlayLog";
import { GameState, Player, Play, Team } from "@/types/football";
import { showSuccess, showError } from "@/utils/toast";

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

const Index = () => {
  const [gameState, setGameState] = useState<GameState>({
    homeScore: 0,
    awayScore: 0,
    possession: "Home",
    down: 1,
    distance: 10,
    yardLine: 25,
    quarter: 1,
    playLog: [],
    roster: {
      home: INITIAL_ROSTER_HOME,
      away: INITIAL_ROSTER_AWAY,
    }
  });

  const [history, setHistory] = useState<GameState[]>([]);

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

  const handleAction = (type: "Run" | "Pass" | "Touchdown" | "Turnover", player?: Player) => {
    saveToHistory();
    
    setGameState(prev => {
      const newState = { ...prev };
      const currentYardLine = prev.yardLine;
      
      // Simple logic for demo: assume a random yardage for Run/Pass
      const yardsGained = Math.floor(Math.random() * 15) - 2;
      
      let result = "";
      let newYardLine = currentYardLine;

      if (type === "Touchdown") {
        if (prev.possession === "Home") {
          newState.homeScore += 7;
          newYardLine = 65; // Kickoff position
          newState.possession = "Away";
        } else {
          newState.awayScore += 7;
          newYardLine = 35; // Kickoff position
          newState.possession = "Home";
        }
        newState.down = 1;
        newState.distance = 10;
        result = "TOUCHDOWN!";
        showSuccess(`${prev.possession} Team Touchdown!`);
      } else if (type === "Turnover") {
        newState.possession = prev.possession === "Home" ? "Away" : "Home";
        newState.down = 1;
        newState.distance = 10;
        result = "Turnover on downs/Interception";
        showError("Turnover!");
      } else {
        // Run or Pass
        const direction = prev.possession === "Home" ? 1 : -1;
        newYardLine = Math.max(0, Math.min(100, currentYardLine + (yardsGained * direction)));
        
        result = `${type} for ${yardsGained} yards`;
        
        // Update down and distance
        if (yardsGained >= prev.distance) {
          newState.down = 1;
          newState.distance = 10;
          showSuccess("First Down!");
        } else {
          if (prev.down === 4) {
            // Turnover on downs
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
      };

      newState.playLog = [newPlay, ...prev.playLog];
      return newState;
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Game Controls */}
        <div className="lg:col-span-7 space-y-6">
          <Scoreboard 
            homeScore={gameState.homeScore}
            awayScore={gameState.awayScore}
            possession={gameState.possession}
            down={gameState.down}
            distance={gameState.distance}
            quarter={gameState.quarter}
          />

          <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Spotter Tool</h2>
            <FootballField 
              ballPosition={gameState.yardLine}
              possession={gameState.possession}
              onSpotBall={handleSpotBall}
            />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <ActionPanel 
              roster={gameState.possession === "Home" ? gameState.roster.home : gameState.roster.away}
              onAction={handleAction}
              onUndo={handleUndo}
              canUndo={history.length > 0}
            />
          </div>
        </div>

        {/* Right Column: Play Log */}
        <div className="lg:col-span-5 h-[calc(100vh-4rem)] sticky top-8">
          <PlayLog plays={gameState.playLog} />
        </div>

      </div>
    </div>
  );
};

export default Index;