"use client";

import { GameState, Player, PlayerStats } from "@/types/football";

/**
 * Generates a highly detailed Stat Crew compatible XML string for Daktronics DXTR.
 * Includes team totals, individual player stats, and detailed game situation data.
 */
export const generateDxtrXml = (game: GameState): string => {
  const timestamp = new Date().toISOString();
  const dateStr = new Date().toLocaleDateString();
  
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

  const getTeamTotals = (team: "Home" | "Away") => {
    const teamPlays = game.playLog.filter(p => p.possession === team);
    const players = team === "Home" ? game.roster.home : game.roster.away;
    
    let passYds = 0, rushYds = 0, passTDs = 0, rushTDs = 0, firstDowns = 0;
    
    players.forEach(p => {
      const s = game.stats[p.id];
      if (s) {
        passYds += s.passYds || 0;
        rushYds += s.rushYds || 0;
        passTDs += s.passTDs || 0;
        rushTDs += s.rushTDs || 0;
      }
    });

    firstDowns = teamPlays.filter(p => p.isFirstDown).length;

    return { passYds, rushYds, passTDs, rushTDs, firstDowns, totalYards: passYds + rushYds };
  };

  const renderPlayerStats = (player: Player, stats?: PlayerStats) => {
    const s = stats || {
      passAtt: 0, passComp: 0, passYds: 0, passTDs: 0, ints: 0,
      rushAtt: 0, rushYds: 0, rushTDs: 0,
      receptions: 0, recYds: 0, recTDs: 0,
      tackles: 0, sacks: 0, defInts: 0, forcedFumbles: 0,
      fgAtt: 0, fgMade: 0, punts: 0, puntYds: 0, fumbles: 0
    };

    return `
      <player name="${escapeXml(player.name)}" number="${player.number}" pos="${escapeXml(player.position || "??")}" gp="1">
        <passing att="${s.passAtt || 0}" comp="${s.passComp || 0}" yds="${s.passYds || 0}" td="${s.passTDs || 0}" int="${s.ints || 0}" />
        <rushing att="${s.rushAtt || 0}" yds="${s.rushYds || 0}" td="${s.rushTDs || 0}" />
        <receiving rec="${s.receptions || 0}" yds="${s.recYds || 0}" td="${s.recTDs || 0}" />
        <defense tackles="${s.tackles || 0}" sacks="${s.sacks || 0}" int="${s.defInts || 0}" ff="${s.forcedFumbles || 0}" />
        <special fgatt="${s.fgAtt || 0}" fgmade="${s.fgMade || 0}" punts="${s.punts || 0}" punt_yds="${s.puntYds || 0}" />
        <misc fumbles="${s.fumbles || 0}" />
      </player>`;
  };

  const homeTotals = getTeamTotals("Home");
  const awayTotals = getTeamTotals("Away");
  
  const posId = game.possession === "Home" ? "HOME" : "AWAY";
  const side = game.yardLine <= 50 ? "HOME" : "AWAY";
  const yard = game.yardLine <= 50 ? game.yardLine : 100 - game.yardLine;

  return `<?xml version="1.0" encoding="UTF-8"?>
<fbgame version="1.0" generated="${timestamp}">
  <venue gameid="LIVE" 
         date="${dateStr}" 
         location="Stadium" 
         stadium="Main Field" 
         visid="AWAY" visname="${escapeXml(game.awayTeam)}" 
         homeid="HOME" homename="${escapeXml(game.homeTeam)}" 
         league="NCAA" season="2024" 
         neutralgame="N" nightgame="Y" />
  
  <team id="HOME" name="${escapeXml(game.homeTeam)}" score="${game.homeScore}" timeouts="${game.homeTimeouts}">
    <linescore score="${game.homeScore}" />
    <totals>
      <firstdowns total="${homeTotals.firstDowns}" />
      <rushing att="0" yds="${homeTotals.rushYds}" td="${homeTotals.rushTDs}" />
      <passing att="0" comp="0" yds="${homeTotals.passYds}" td="${homeTotals.passTDs}" int="0" />
      <playerstats>
        ${(game.roster?.home || []).map(p => renderPlayerStats(p, game.stats?.[p.id])).join("")}
      </playerstats>
    </totals>
  </team>
  
  <team id="AWAY" name="${escapeXml(game.awayTeam)}" score="${game.awayScore}" timeouts="${game.awayTimeouts}">
    <linescore score="${game.awayScore}" />
    <totals>
      <firstdowns total="${awayTotals.firstDowns}" />
      <rushing att="0" yds="${awayTotals.rushYds}" td="${awayTotals.rushTDs}" />
      <passing att="0" comp="0" yds="${awayTotals.passYds}" td="${awayTotals.passTDs}" int="0" />
      <playerstats>
        ${(game.roster?.away || []).map(p => renderPlayerStats(p, game.stats?.[p.id])).join("")}
      </playerstats>
    </totals>
  </team>
  
  <status quarter="${game.quarter}" 
          clock="${Math.floor(game.gameClock / 60)}:${(game.gameClock % 60).toString().padStart(2, '0')}" 
          down="${game.down}" 
          togo="${game.distance === 0 ? 'Goal' : game.distance}" 
          context="LIVE" 
          possession="${posId}" 
          spot="${side} ${yard}" 
          ball_on="${game.yardLine}"
          redzone="${(game.yardLine <= 20 || game.yardLine >= 80) ? 'Y' : 'N'}" />
  
  <scores>
    <score team="HOME" score="${game.homeScore}" />
    <score team="AWAY" score="${game.awayScore}" />
  </scores>
</fbgame>`;
};