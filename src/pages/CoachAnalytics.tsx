"use client";

import React, { useEffect, useState } from 'react';
import { GameState, Play, Drive } from "@/types/football";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, TrendingUp, Zap, Shield, ArrowLeft, 
  Target, Activity, PieChart, ChevronRight 
} from "lucide-react";
import { Link } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';

const STORAGE_KEY = 'football_stat_keeper_pro_v2';

const CoachAnalytics = () => {
  const [game, setGame] = useState<GameState | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setGame(JSON.parse(saved));
  }, []);

  if (!game) return <div className="p-10 text-center">No active game data found.</div>;

  const plays = game.playLog;
  const drives = game.drives;

  // Advanced Metrics Calculations
  const calculateEfficiency = (team: "Home" | "Away") => {
    const teamPlays = plays.filter(p => p.possession === team);
    const teamDrives = drives.filter(d => d.team === team);
    
    const totalYards = teamPlays.reduce((acc, p) => acc + (p.type === "Penalty" ? 0 : p.yards), 0);
    const yardsPerPlay = teamPlays.length > 0 ? (totalYards / teamPlays.length).toFixed(1) : "0.0";
    const yardsPerDrive = teamDrives.length > 0 ? (totalYards / teamDrives.length).toFixed(1) : "0.0";
    
    const thirdDowns = teamPlays.filter(p => p.down === 3);
    const thirdDownConv = thirdDowns.filter(p => p.isFirstDown || p.isScoringPlay).length;
    const thirdDownRate = thirdDowns.length > 0 ? Math.round((thirdDownConv / thirdDowns.length) * 100) : 0;

    return { yardsPerPlay, yardsPerDrive, thirdDownRate, totalYards };
  };

  const homeEff = calculateEfficiency("Home");
  const awayEff = calculateEfficiency("Away");

  // Chart Data: Yards per Drive
  const driveData = drives.map((d, i) => ({
    name: `D${i+1}`,
    yards: d.yards,
    team: d.team === "Home" ? game.homeTeam : game.awayTeam
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase">Coach's Analytics Terminal</h1>
              <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">Advanced Performance Metrics</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 text-[10px] font-black uppercase tracking-widest">
              {game.homeTeam} vs {game.awayTeam}
            </div>
          </div>
        </div>

        {/* Efficiency Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-slate-900 border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-blue-400">{game.homeTeam} Efficiency</h3>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Yds / Play</div>
                <div className="text-2xl font-black">{homeEff.yardsPerPlay}</div>
              </div>
              <div className="text-center border-x border-white/5">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Yds / Drive</div>
                <div className="text-2xl font-black">{homeEff.yardsPerDrive}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">3rd Down %</div>
                <div className="text-2xl font-black">{homeEff.thirdDownRate}%</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                <span>3rd Down Success</span>
                <span>{homeEff.thirdDownRate}%</span>
              </div>
              <Progress value={homeEff.thirdDownRate} className="h-1.5 bg-slate-800" />
            </div>
          </Card>

          <Card className="p-6 bg-slate-900 border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-red-400">{game.awayTeam} Efficiency</h3>
              <Activity className="w-4 h-4 text-red-400" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Yds / Play</div>
                <div className="text-2xl font-black">{awayEff.yardsPerPlay}</div>
              </div>
              <div className="text-center border-x border-white/5">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Yds / Drive</div>
                <div className="text-2xl font-black">{awayEff.yardsPerDrive}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">3rd Down %</div>
                <div className="text-2xl font-black">{awayEff.thirdDownRate}%</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                <span>3rd Down Success</span>
                <span>{awayEff.thirdDownRate}%</span>
              </div>
              <Progress value={awayEff.thirdDownRate} className="h-1.5 bg-slate-800" />
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 bg-slate-900 border-white/5">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-black uppercase tracking-widest">Drive Yardage Comparison</h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={driveData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="bold" />
                  <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="yards" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 bg-slate-900 border-white/5">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-widest">Play Distribution</h3>
            </div>
            <div className="space-y-6">
              {["Home", "Away"].map(team => {
                const teamPlays = plays.filter(p => p.possession === team);
                const passCount = teamPlays.filter(p => p.type === "Pass" || p.type === "Incomplete").length;
                const rushCount = teamPlays.filter(p => p.type === "Run").length;
                const total = passCount + rushCount;
                const passPct = total > 0 ? Math.round((passCount / total) * 100) : 0;

                return (
                  <div key={team} className="space-y-3">
                    <div className="text-[10px] font-black uppercase text-slate-500">{team === "Home" ? game.homeTeam : game.awayTeam}</div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-blue-400">Pass: {passCount}</span>
                      <span className="text-emerald-400">Run: {rushCount}</span>
                    </div>
                    <div className="relative h-4 w-full bg-emerald-500/20 rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${passPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Drive Log */}
        <Card className="bg-slate-900 border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-black uppercase tracking-widest">Drive Analytics Log</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-slate-500 font-black uppercase tracking-widest">
                <tr>
                  <th className="p-4">#</th>
                  <th className="p-4">Team</th>
                  <th className="p-4">Plays</th>
                  <th className="p-4">Yards</th>
                  <th className="p-4">Result</th>
                  <th className="p-4 text-right">Efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {drives.map((drive, i) => (
                  <tr key={drive.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-slate-500">{i + 1}</td>
                    <td className="p-4 font-black uppercase">{drive.team === "Home" ? game.homeTeam : game.awayTeam}</td>
                    <td className="p-4 font-bold">{drive.plays}</td>
                    <td className="p-4 font-bold">{drive.yards}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-bold uppercase">
                        {drive.result || "In Progress"}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono text-blue-400">
                      {drive.plays > 0 ? (drive.yards / drive.plays).toFixed(1) : "0.0"} Y/P
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CoachAnalytics;