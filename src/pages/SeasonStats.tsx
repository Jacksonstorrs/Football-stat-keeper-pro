"use client";

import React, { useEffect, useState } from 'react';
import { GameState, Player, PlayerStats } from "@/types/football";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Trophy, ArrowLeft, Download, TrendingUp, Users, 
  Target, Zap, Shield, ChevronRight, Filter
} from "lucide-react";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SEASON_STORAGE_KEY = 'football_stat_keeper_season_v1';

interface TeamRecord {
  name: string;
  wins: number;
  losses: number;
  ties: number;
  pf: number; // Points For
  pa: number; // Points Against
}

const SeasonStats = () => {
  const [games, setGames] = useState<any[]>([]);
  const [aggregatedStats, setAggregatedStats] = useState<Record<string, any>>({});
  const [teamStandings, setTeamStandings] = useState<Record<string, TeamRecord>>({});
  const [filterTeam, setFilterTeam] = useState<string>("all");

  useEffect(() => {
    const saved = localStorage.getItem(SEASON_STORAGE_KEY);
    if (saved) {
      try {
        const gameData: any[] = JSON.parse(saved);
        setGames(gameData);

        const stats: Record<string, any> = {};
        const standings: Record<string, TeamRecord> = {};

        const initTeam = (name: string) => {
          if (name && !standings[name]) {
            standings[name] = { name, wins: 0, losses: 0, ties: 0, pf: 0, pa: 0 };
          }
        };

        gameData.forEach(game => {
          if (!game) return;

          const isLive = 'currentDriveId' in game;
          const homeTeam = game.homeTeam || "Unknown Home";
          const awayTeam = game.awayTeam || "Unknown Away";
          const homeScore = typeof game.homeScore === 'number' ? game.homeScore : 0;
          const awayScore = typeof game.awayScore === 'number' ? game.awayScore : 0;

          initTeam(homeTeam);
          initTeam(awayTeam);

          // Update Standings
          if (isLive || game.status === 'completed') {
            if (standings[homeTeam]) {
              standings[homeTeam].pf += homeScore;
              standings[homeTeam].pa += awayScore;
            }
            if (standings[awayTeam]) {
              standings[awayTeam].pf += awayScore;
              standings[awayTeam].pa += homeScore;
            }

            if (homeScore > awayScore) {
              if (standings[homeTeam]) standings[homeTeam].wins += 1;
              if (standings[awayTeam]) standings[awayTeam].losses += 1;
            } else if (awayScore > homeScore) {
              if (standings[awayTeam]) standings[awayTeam].wins += 1;
              if (standings[homeTeam]) standings[homeTeam].losses += 1;
            } else {
              if (standings[homeTeam]) standings[homeTeam].ties += 1;
              if (standings[awayTeam]) standings[awayTeam].ties += 1;
            }
          }

          // Process Player Stats (only for live-tracked games)
          if (isLive && game.stats && game.roster) {
            const homeRoster = Array.isArray(game.roster.home) ? game.roster.home : [];
            const awayRoster = Array.isArray(game.roster.away) ? game.roster.away : [];
            
            const allPlayers = [
              ...homeRoster.map((p: any) => ({ ...p, team: homeTeam })), 
              ...awayRoster.map((p: any) => ({ ...p, team: awayTeam }))
            ];
            
            allPlayers.forEach(player => {
              if (!player || !player.id) return;

              if (!stats[player.id]) {
                stats[player.id] = {
                  id: player.id,
                  name: player.name || "Unknown Player",
                  number: player.number || 0,
                  team: player.team,
                  passAtt: 0, passComp: 0, passYds: 0, passTDs: 0,
                  rushAtt: 0, rushYds: 0, rushTDs: 0,
                  gamesPlayed: 0
                };
              }
              
              const gameStats = game.stats[player.id];
              if (gameStats) {
                stats[player.id].passAtt += gameStats.passAtt || 0;
                stats[player.id].passComp += gameStats.passComp || 0;
                stats[player.id].passYds += gameStats.passYds || 0;
                stats[player.id].passTDs += gameStats.passTDs || 0;
                stats[player.id].rushAtt += gameStats.rushAtt || 0;
                stats[player.id].rushYds += gameStats.rushYds || 0;
                stats[player.id].rushTDs += gameStats.rushTDs || 0;
                stats[player.id].gamesPlayed += 1;
              }
            });
          }
        });

        setAggregatedStats(stats);
        setTeamStandings(standings);
      } catch (e) {
        console.error("Failed to parse season data", e);
      }
    }
  }, []);

  const playerList = Object.values(aggregatedStats);
  const filteredPlayers = filterTeam === "all" 
    ? playerList 
    : playerList.filter(p => p.team === filterTeam);

  const sortedPlayers = [...filteredPlayers].sort((a, b) => (b.passYds + b.rushYds) - (a.passYds + a.rushYds));

  // Category Leaders
  const topPasser = [...playerList].sort((a, b) => b.passYds - a.passYds)[0];
  const topRusher = [...playerList].sort((a, b) => b.rushYds - a.rushYds)[0];
  const topScorer = [...playerList].sort((a, b) => (b.passTDs + b.rushTDs) - (a.passTDs + a.rushTDs))[0];

  const teams = Object.keys(teamStandings);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/games">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Season Dashboard</h1>
              <p className="text-slate-500 text-sm">Comprehensive performance tracking for the current season</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-white">
              <Download className="w-4 h-4" /> Export Report
            </Button>
          </div>
        </div>

        {/* Top Level Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-slate-900 text-white border-none shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              <Badge variant="outline" className="text-blue-400 border-blue-400/30">Season Total</Badge>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Yards</div>
            <div className="text-3xl font-black">{playerList.reduce((acc, p) => acc + p.passYds + p.rushYds, 0)}</div>
          </Card>
          <Card className="p-6 bg-slate-900 text-white border-none shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <Zap className="w-6 h-6 text-amber-400" />
              <Badge variant="outline" className="text-amber-400 border-amber-400/30">Season Total</Badge>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Touchdowns</div>
            <div className="text-3xl font-black">{playerList.reduce((acc, p) => acc + p.passTDs + p.rushTDs, 0)}</div>
          </Card>
          <Card className="p-6 bg-slate-900 text-white border-none shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <Users className="w-6 h-6 text-emerald-400" />
              <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">Active</Badge>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Roster Size</div>
            <div className="text-3xl font-black">{playerList.length}</div>
          </Card>
          <Card className="p-6 bg-slate-900 text-white border-none shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <Calendar className="w-6 h-6 text-purple-400" />
              <Badge variant="outline" className="text-purple-400 border-purple-400/30">Played</Badge>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Games Logged</div>
            <div className="text-3xl font-black">{games.length}</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Standings & Leaders */}
          <div className="space-y-8">
            {/* Team Standings */}
            <Card className="overflow-hidden border-none shadow-xl bg-white">
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <div className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Team Standings
                </div>
              </div>
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-[10px] font-black uppercase">Team</TableHead>
                    <TableHead className="text-center text-[10px] font-black uppercase">W-L-T</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase">PF/PA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(teamStandings).sort((a, b) => b.wins - a.wins).map((team) => (
                    <TableRow key={team.name}>
                      <TableCell className="font-bold text-xs uppercase">{team.name}</TableCell>
                      <TableCell className="text-center font-mono text-xs">{team.wins}-{team.losses}-{team.ties}</TableCell>
                      <TableCell className="text-right text-[10px] text-slate-500">{team.pf} / {team.pa}</TableCell>
                    </TableRow>
                  ))}
                  {teams.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-slate-400 text-xs italic">No teams recorded.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>

            {/* Category Leaders */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Category Leaders</h3>
              
              {topPasser && (
                <Card className="p-4 border-none shadow-md bg-white flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Target className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase">Passing Leader</div>
                    <div className="font-bold text-sm">{topPasser.name}</div>
                    <div className="text-xs text-slate-500">{topPasser.passYds} YDS • {topPasser.passTDs} TD</div>
                  </div>
                </Card>
              )}

              {topRusher && (topRusher.rushYds > 0) && (
                <Card className="p-4 border-none shadow-md bg-white flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase">Rushing Leader</div>
                    <div className="font-bold text-sm">{topRusher.name}</div>
                    <div className="text-xs text-slate-500">{topRusher.rushYds} YDS • {topRusher.rushTDs} TD</div>
                  </div>
                </Card>
              )}

              {topScorer && (
                <Card className="p-4 border-none shadow-md bg-white flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase">Scoring Leader</div>
                    <div className="font-bold text-sm">{topScorer.name}</div>
                    <div className="text-xs text-slate-500">{topScorer.passTDs + topScorer.rushTDs} TOTAL TD</div>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Right Column: Player Leaderboard */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Player Leaderboard</h3>
              <div className="flex items-center gap-2">
                <Filter className="w-3 h-3 text-slate-400" />
                <Select value={filterTeam} onValueChange={setFilterTeam}>
                  <SelectTrigger className="h-8 w-[140px] text-[10px] font-bold uppercase">
                    <SelectValue placeholder="Filter Team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    {teams.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="overflow-hidden border-none shadow-xl bg-white">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-black uppercase text-[10px]">Player</TableHead>
                      <TableHead className="text-right font-black uppercase text-[10px]">GP</TableHead>
                      <TableHead className="text-right font-black uppercase text-[10px]">Passing</TableHead>
                      <TableHead className="text-right font-black uppercase text-[10px]">Rushing</TableHead>
                      <TableHead className="text-right font-black uppercase text-[10px]">Total TD</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPlayers.map((player, i) => (
                      <TableRow key={player.id} className="hover:bg-slate-50/50">
                        <TableCell className="py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">
                              <span className="text-slate-400 mr-2 font-mono">#{player.number}</span>
                              {player.name}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase">{player.team}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">{player.gamesPlayed}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-blue-600 text-xs">{player.passYds} YDS</span>
                            <span className="text-[9px] text-slate-400">{player.passComp}/{player.passAtt} ({player.passAtt > 0 ? Math.round((player.passComp/player.passAtt)*100) : 0}%)</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-emerald-600 text-xs">{player.rushYds} YDS</span>
                            <span className="text-[9px] text-slate-400">{player.rushAtt} ATT ({player.rushAtt > 0 ? (player.rushYds/player.rushAtt).toFixed(1) : 0} AVG)</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-black text-slate-900 text-sm">
                          {player.passTDs + player.rushTDs}
                        </TableCell>
                      </TableRow>
                    ))}
                    {sortedPlayers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-slate-400 italic">
                          No player data available for the selected filter.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonStats;