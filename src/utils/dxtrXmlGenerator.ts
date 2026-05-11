"use client";

import { GameState, Player, PlayerStats } from "@/types/football";

/**
 * Generates a Stat Crew compatible XML string for Daktronics DXTR.
 * This follows the standard <fbgame> schema used in American Football.
 */
export const generateDxtrXml = (game: GameState): string => {
  const timestamp = new Date().toISOString();
  const dateStr = new Date().toLocaleDateString();
  
  // Helper to escape XML special characters
  const escapeXml = (unsafe: string) => {
    if (!unsafe) return "";
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

  const renderPlayerStats = (player: Player, stats?: PlayerStats) => {
    if (!stats) return "";
    
    // Only include players who have actually participated (GP=1)
    const hasStats = Object.values(stats).some(val => val > 0);
    if (!hasStats) return "";

    return `
    <player name="${escapeXml(player.name)}" number="${player.number}" pos="${escapeXml(player.position)}" gp="1">
      <passing att="${stats.passAtt}" comp="${stats.passComp}" yds="${stats.passYds}" td="${stats.passTDs}" int="${stats.ints}" />
      <rushing att="${stats.rushAtt}" yds="${stats.rushYds}" td="${stats.rushTDs}" />
      <receiving rec="${stats.receptions}" yds="${stats.recYds}" td="${stats.recTDs}" />
      <defense tackles="${stats.tackles}" sacks="${stats.sacks}" int="${stats.defInts}" ff="${stats.forcedFumbles}" />
      <special fgatt="${stats.fgAtt}" fgmade="${stats.fgMade}" punts="${stats.punts}" punt_yds="${stats.puntYds}" />
    </player>`;
  };

  const homeName = escapeXml(game.homeTeam);
  const awayName = escapeXml(game.awayTeam);
  
  // Map possession to IDs
  const posId = game.possession === "Home" ? "HOME" : "AWAY";
  
  // Calculate yardline in Stat Crew format (0-50)
  const side = game.yardLine <= 50 ? "HOME" : "AWAY";
  const yard = game.yardLine <= 50 ? game.yardLine : 100 - game.yardLine;

  const homePlayersXml = game.roster.home
    .map(p => renderPlayerStats(p, game.stats[p.id]))
    .join("");

  const awayPlayersXml = game.roster.away
    .map(p => renderPlayerStats(p, game.stats[p.id]))
    .join("");

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
    ${homePlayersXml}
  </team>
  
  <team id="AWAY" name="${awayName}" score="${game.awayScore}" timeouts="${game.awayTimeouts}">
    <linescore score="${game.awayScore}" />
    ${awayPlayersXml}
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