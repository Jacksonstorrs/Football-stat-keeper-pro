"use client";

import { GameState } from "@/types/football";

/**
 * Generates a Stat Crew compatible XML string for Daktronics DXTR.
 * This follows the standard <fbgame> schema used in American Football.
 */
export const generateDxtrXml = (game: GameState): string => {
  const timestamp = new Date().toISOString();
  const dateStr = new Date().toLocaleDateString();
  
  // Helper to escape XML special characters
  const escapeXml = (unsafe: string) => {
    return unsafe.replace(/[<>&"']/g, (c) => {
      switch (c) {
        case '<': return '<';
        case '>': return '>';
        case '&': return '&';
        case '"': return '&quot;';
        case "'": return '&apos;';
        default: return c;
      }
    });
  };

  const homeName = escapeXml(game.homeTeam);
  const awayName = escapeXml(game.awayTeam);
  
  // Map possession to IDs
  const posId = game.possession === "Home" ? "HOME" : "AWAY";
  
  // Calculate yardline in Stat Crew format (0-50)
  // Our system uses 0-100. 0-50 is Home side, 51-100 is Away side.
  const side = game.yardLine <= 50 ? "HOME" : "AWAY";
  const yard = game.yardLine <= 50 ? game.yardLine : 100 - game.yardLine;

  return `<?xml version="1.0" encoding="UTF-8"?>
<fbgame version="1.0" generated="${timestamp}">
  <venue gameid="LIVE" 
         date="${dateStr}" 
         location="Stadium" 
         stadium="Main Field" 
         visid="AWAY" visname="${awayName}" 
         homeid="HOME" homename="${homeName}" 
         league="NCAA" season="2024" 
         neutralgame="N" nightgame="Y" />
  
  <team id="HOME" name="${homeName}" score="${game.homeScore}" timeouts="${game.homeTimeouts}">
    <linescore score="${game.homeScore}" />
  </team>
  
  <team id="AWAY" name="${awayName}" score="${game.awayScore}" timeouts="${game.awayTimeouts}">
    <linescore score="${game.awayScore}" />
  </team>
  
  <status quarter="${game.quarter}" 
          clock="${Math.floor(game.gameClock / 60)}:${(game.gameClock % 60).toString().padStart(2, '0')}" 
          down="${game.down}" 
          togo="${game.distance === 0 ? 'Goal' : game.distance}" 
          context="LIVE" 
          possession="${posId}" 
          spot="${side} ${yard}" 
          ball_on="${game.yardLine}" />
  
  <scores>
    <score team="HOME" score="${game.homeScore}" />
    <score team="AWAY" score="${game.awayScore}" />
  </scores>
</fbgame>`;
};