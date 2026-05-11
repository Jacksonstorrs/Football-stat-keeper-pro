"use client";

import { GameState, Player, PlayerStats } from "@/types/football";

/**
 * Generates a Stat Crew compatible XML string for Daktronics DXTR.
 * This follows the standard <fbgame> schema used in American Football.
 */
export const generateDxtrXml = (game: GameState): string => {
  const timestamp = new Date().toISOString();
  const dateStr = new Date().toLocaleDateString();
  
  // Helper to escape XML special characters correctly
  const escapeXml = (unsafe: string) => {
    if (!unsafe) return "";
    return unsafe.toString().replace(/[<>&"']/g, (c) => {
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
    // Default stats if none exist yet
    const s = stats || {
      passAtt: 0, passComp: 0, passYds: 0, passTDs: 0, ints: 0,
      rushAtt: 0, rushYds: 0, rushTDs: 0,
      receptions: 0, recYds: 0, recTDs: 0,
      tackles: 0, sacks: 0, defInts: 0, forcedFumbles: 0,
      fgAtt: 0, fgMade: 0, punts: 0, puntYds: 0
    };

    // We include all players in the roster for the broadcast system
    return `
    <player name="${escapeXml(player.name)}" number="${player.number}" pos="${escapeXml(player.position || "??")}" gp="1">
      <passing att="${s.passAtt || 0}" comp="${s.passComp || 0}" yds="${s.passYds || 0}" td="${s.passTDs || 0}" int="${s.ints || 0}" />
      <rushing att="${s.rushAtt || 0}" yds="${s.rushYds || 0}" td="${s.rushTDs || 0}" />
      <receiving rec="${s.receptions || 0}" yds="${s.recYds || 0}" td="${s.recTDs || 0}" />
      <defense tackles="${s.tackles || 0}" sacks="${s.sacks || 0}" int="${s.defInts || 0}" ff="${s.forcedFumbles || 0}" />
      <special fgatt="${s.fgAtt || 0}" fgmade="${s.fgMade || 0}" punts="${s.punts || 0}" punt_yds="${s.puntYds || 0}" />
    </player>`;
  };

  const homeName = escapeXml(game.homeTeam);
  const awayName = escapeXml(game.awayTeam);
  
  const posId = game.possession === "Home" ? "HOME" : "AWAY";
  const side = game.yardLine <= 50 ? "HOME" : "AWAY";
  const yard = game.yardLine <= 50 ? game.yardLine : 100 - game.yardLine;

  const homePlayersXml = (game.roster?.home || [])
    .map(p => renderPlayerStats(p, game.stats?.[p.id]))
    .join("");

  const awayPlayersXml = (game.roster?.away || [])
    .map(p => renderPlayerStats(p, game.stats?.[p.id]))
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
    <totals>
      ${homePlayersXml}
    </totals>
  </team>
  
  <team id="AWAY" name="${awayName}" score="${game.awayScore}" timeouts="${game.awayTimeouts}">
    <linescore score="${game.awayScore}" />
    <totals>
      ${awayPlayersXml}
    </totals>
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