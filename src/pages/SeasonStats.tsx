"use client";

import React, { useEffect, useState } from 'react';
import { GameState, Player, PlayerStats } from "@/types/football";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, ArrowLeft, Download, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";

const SEASON_STORAGE_KEY = 'football_stat_keeper_season_v1';

const SeasonStats = () => {
  const [games, setGames] = useState<GameState[]>([]);
  const [aggregatedStats, setAggregatedStats] = useState<Record<string, PlayerStats & { name: string, number: number, team: string }>>({});

  useEffect(() => {
    const saved = localStorage.getItem(SEASON_STORAGE_KEY);
    if (saved) {
      const gameData: GameState[] = JSON.parse(saved);
      setGames(gameData);

      const stats: Record<string, any> = {};

      gameData.forEach(game => {
        // Process both rosters to ensure we have player info
        const allPlayers = [...game.roster.home.map(p => ({ ...p, team: game.homeTeam })), ...game.roster.away.map(p => ({ ...p, team: game.awayTeam }))];
        
        allPlayers.forEach(player => {
          if (!stats[player.id]) {
            stats[player.id] = {
              name: player.name,
              number: player.number,
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
      });

      setAggregatedStats(stats);
    }
  }, []);

  const sortedPlayers = Object.values(aggregatedStats).sort((a, b) => (b.passYds + b.rushYds) - (a.passYds + a.rushYds));

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/games">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Season Leaders</h1>
              <p className="text-slate-500 text-sm">Aggregated performance across {games.length} games</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2 bg-white">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-blue-600 text-white border-none shadow-lg">
            <TrendingUp className="w-8 h-8 mb-4 opacity-50" />
            <div className="text-xs font-bold uppercase tracking-widest opacity-70">Total Season Yards</div>
            <div className="text-4xl font-black">
              {Object.values(aggregatedStats).reduce((acc, p) => acc + p.passYds + p.rushYds, 0)}
            </div>
          </Card>
          <Card className="p-6 bg-emerald-600 text-white border-none shadow-lg">
            <Trophy className="w-8 h-8 mb-4 opacity-50" />
            <div className="text-xs font-bold uppercase tracking-widest opacity-70">Total Touchdowns</div>
            <div className="text-4xl font-black">
              {Object.values(aggregatedStats).reduce((acc, p) => acc + p.passTDs + p.rushTDs, 0)}
            </div>
          </Card>
          <Card className="p-6 bg-slate-900 text-white border-none shadow-lg">
            <Users className="w-8 h-8 mb-4 opacity-50" />
            <div className="text-xs font-bold uppercase tracking-widest opacity-70">Active Players</div>
            <div className="text-4xl font-black">{Object.keys(aggregatedStats).length}</div>
          </Card>
        </div>

        <Card className="overflow-hidden border-none shadow-xl bg-white">
          <div className="bg-slate-900 text-white px-6 py-4 text-sm font-black uppercase tracking-widest">
            Player Performance Leaderboard
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-black uppercase text-[10px]">Player</TableHead>
                  <TableHead className="font-black uppercase text-[10px]">Team</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px]">GP</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px]">Pass Yds</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px]">Rush Yds</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px]">Total TD</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPlayers.map((player, i) => (
                  <TableRow key={i} className="hover:bg-slate-50/50">
                    <TableCell className="font-bold">
                      <span className="text-slate-400 mr-2">#{player.number}</span>
                      {player.name}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-500 uppercase">{player.team}</TableCell>
                    <TableCell className="text-right font-mono">{player.gamesPlayed}</TableCell>
                    <TableCell className="text-right font-bold text-blue-600">{player.passYds}</TableCell>
                    <TableCell className="text-right font-bold text-emerald-600">{player.rushYds}</TableCell>
                    <TableCell className="text-right font-black text-slate-900">{player.passTDs + player.rushTDs}</TableCell>
                  </TableRow>
                ))}
                {sortedPlayers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-slate-400 italic">
                      No season data available yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SeasonStats;