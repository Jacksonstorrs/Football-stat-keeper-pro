"use client";

import React, { useEffect, useState } from 'react';
import { GameState, Player, PlayerStats } from "@/types/football";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Trophy, ArrowLeft, Download, TrendingUp, Users, 
  Target, Zap, Shield, ChevronRight, Filter, RefreshCw,
  LineChart as LineChartIcon
} from "lucide-react";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const SEASON_STORAGE_KEY = 'football_stat_keeper_season_v1';

interface TeamRecord {
  name: string;
  wins: number;
  losses: number;
  ties: number;
  pf: number;
  pa: number;
}

const SeasonStats = () => {
  const { teamCode } = useAuth();
  const [games, setGames] = useState<any[]>([]);
  const [aggregatedStats, setAggregatedStats] = useState<Record<string, any>>({});
  const [teamStandings, setTeamStandings] = useState<Record<string, TeamRecord>>({});
  const [filterTeam, setFilterTeam] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!teamCode) return;

    const fetchData = async () => {
      setLoading(true);
      
      const saved = localStorage.getItem(`${SEASON_STORAGE_KEY}_${teamCode}`);
      let gameData = saved ? JSON.parse(saved) : [];

      if (supabase) {
        const { data } = await supabase
          .from('seasons')
          .select('data')
          .eq('id', teamCode)
          .single();
        
        if (data?.data) {
          gameData = data.data;
          localStorage.setItem(`${SEASON_STORAGE_KEY}_${teamCode}`, JSON.stringify(gameData));
        }
      }

      processStats(gameData);
      setLoading(false);
    };

    fetchData();
  }, [teamCode]);

  const processStats = (gameData: any[]) => {
    setGames(gameData);
    const stats: Record<string, any> = {};
    const standings: Record<string, TeamRecord> = {};
    const trend: any[] = [];

    const initTeam = (name: string) => {
      if (name && !standings[name]) {
        standings[name] = { name, wins: 0, losses: 0, ties: 0, pf: 0, pa: 0 };
      }
    };

    gameData.forEach((game, idx) => {
      if (!game) return;

      const homeTeam = game.homeTeam || "Unknown Home";
      const awayTeam = game.awayTeam || "Unknown Away";
      const homeScore = typeof game.homeScore === 'number' ? game.homeScore : 0;
      const awayScore = typeof game.awayScore === 'number' ? game.awayScore : 0;

      initTeam(homeTeam);
      initTeam(awayTeam);

      if (game.status === 'completed' || 'playLog' in game) {
        standings[homeTeam].pf += homeScore;
        standings[homeTeam].pa += awayScore;
        standings[awayTeam].pf += awayScore;
        standings[awayTeam].pa += homeScore;

        if (homeScore > awayScore) {
          standings[homeTeam].wins += 1;
          standings[awayTeam].losses += 1;
        } else if (awayScore > homeScore) {
          standings[awayTeam].wins += 1;
          standings[homeTeam].losses += 1;
        } else {
          standings[homeTeam].ties += 1;
          standings[awayTeam].ties += 1;
        }

        trend.push({
          name: `G${idx + 1}`,
          home: homeScore,
          away: awayScore,
          total: homeScore + awayScore
        });
      }

      if (game.stats && game.roster) {
        const allPlayers = [
          ...(game.roster.home || []).map((p: any) => ({ ...p, team: homeTeam })), 
          ...(game.roster.away || []).map((p: any) => ({ ...p, team: awayTeam }))
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
    setChartData(trend);
  };

  const playerList = Object.values(aggregatedStats);
  const filteredPlayers = filterTeam === "all" 
    ? playerList 
    : playerList.filter(p => p.team === filterTeam);

  const sortedPlayers = [...filteredPlayers].sort((a, b) => (b.passYds + b.rushYds) - (a.passYds + a.rushYds));
  const teams = Object.keys(teamStandings);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="animate-pulse text-slate-400 font-black uppercase tracking-widest">Loading Season Data...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/games">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Season Dashboard</h1>
              <p className="text-slate-500 text-sm">Syncing for Team: <span className="font-bold text-blue-600">{teamCode}</span></p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-slate-900 text-white border-none shadow-lg">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Yards</div>
            <div className="text-3xl font-black">{playerList.reduce((acc, p) => acc + p.passYds + p.rushYds, 0)}</div>
          </Card>
          <Card className="p-6 bg-slate-900 text-white border-none shadow-lg">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Touchdowns</div>
            <div className="text-3xl font-black">{playerList.reduce((acc, p) => acc + p.passTDs + p.rushTDs, 0)}</div>
          </Card>
          <Card className="p-6 bg-slate-900 text-white border-none shadow-lg">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Active Players</div>
            <div className="text-3xl font-black">{playerList.length}</div>
          </Card>
          <Card className="p-6 bg-slate-900 text-white border-none shadow-lg">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Games Logged</div>
            <div className="text-3xl font-black">{games.length}</div>
          </Card>
        </div>

        {chartData.length > 0 && (
          <Card className="p-8 bg-white dark:bg-slate-900 border-none shadow-xl">
            <div className="flex items-center gap-2 mb-8">
              <LineChartIcon className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Scoring Trends</h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                  <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-8">
            <Card className="overflow-hidden border-none shadow-xl bg-white dark:bg-slate-900">
              <div className="bg-slate-900 text-white px-6 py-4 text-xs font-black uppercase tracking-widest">Team Standings</div>
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                  <TableRow>
                    <TableHead className="text-[10px] font-black uppercase">Team</TableHead>
                    <TableHead className="text-center text-[10px] font-black uppercase">W-L-T</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase">PF/PA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(teamStandings).sort((a, b) => b.wins - a.wins).map((team) => (
                    <TableRow key={team.name} className="dark:border-white/5">
                      <TableCell className="font-bold text-xs uppercase dark:text-slate-200">{team.name}</TableCell>
                      <TableCell className="text-center font-mono text-xs dark:text-slate-400">{team.wins}-{team.losses}-{team.ties}</TableCell>
                      <TableCell className="text-right text-[10px] text-slate-500">{team.pf} / {team.pa}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Player Leaderboard</h3>
              <Select value={filterTeam} onValueChange={setFilterTeam}>
                <SelectTrigger className="h-8 w-[140px] text-[10px] font-bold uppercase dark:bg-slate-900 dark:border-white/10">
                  <SelectValue placeholder="Filter Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teams.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Card className="overflow-hidden border-none shadow-xl bg-white dark:bg-slate-900">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                  <TableRow>
                    <TableHead className="font-black uppercase text-[10px]">Player</TableHead>
                    <TableHead className="text-right font-black uppercase text-[10px]">Passing</TableHead>
                    <TableHead className="text-right font-black uppercase text-[10px]">Rushing</TableHead>
                    <TableHead className="text-right font-black uppercase text-[10px]">Total TD</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPlayers.map((player) => (
                    <TableRow key={player.id} className="dark:border-white/5">
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm dark:text-slate-200">#{player.number} {player.name}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase">{player.team}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400 text-xs">{player.passYds} YDS</TableCell>
                      <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400 text-xs">{player.rushYds} YDS</TableCell>
                      <TableCell className="text-right font-black text-slate-900 dark:text-white text-sm">{player.passTDs + player.rushTDs}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonStats;