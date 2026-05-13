"use client";

import React, { useEffect, useState } from 'react';
import { GameState, Play, Drive } from "@/types/football";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer, ArrowLeft, FileText, Download, Trophy, Clock, MapPin, Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = 'football_stat_keeper_pro_v2';

const GameReport = () => {
  const { teamCode } = useAuth();
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGameData = async () => {
      setLoading(true);
      
      // Try local storage first for immediate feedback
      const saved = localStorage.getItem(`${STORAGE_KEY}_${teamCode}`);
      if (saved) {
        setGame(JSON.parse(saved));
      }

      // Fetch latest from Supabase
      if (teamCode) {
        const { data, error } = await supabase
          .from('games')
          .select('state')
          .eq('id', teamCode)
          .single();
        
        if (data?.state) {
          setGame(data.state);
        }
      }
      setLoading(false);
    };

    loadGameData();
  }, [teamCode]);

  if (loading && !game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Generating Report...</p>
        </div>
      </div>
    );
  }

  if (!game) return <div className="p-10 text-center">No game data found for this session.</div>;

  const handlePrint = () => window.print();

  const calculateTeamStats = (team: "Home" | "Away") => {
    const plays = game.playLog.filter(p => p.possession === team);
    const totalYards = plays.reduce((acc, p) => acc + (p.type === "Penalty" ? 0 : p.yards), 0);
    const passYards = plays.filter(p => p.type === "Pass").reduce((acc, p) => acc + p.yards, 0);
    const rushYards = plays.filter(p => p.type === "Run").reduce((acc, p) => acc + p.yards, 0);
    const firstDowns = plays.filter(p => p.isFirstDown).length;
    return { totalYards, passYards, rushYards, firstDowns, playCount: plays.length };
  };

  const homeStats = calculateTeamStats("Home");
  const awayStats = calculateTeamStats("Away");

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header - Hidden on Print */}
        <div className="flex items-center justify-between print:hidden">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="gap-2 bg-slate-900">
              <Printer className="w-4 h-4" /> Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Report Content */}
        <Card className="p-8 md:p-12 border-none shadow-xl print:shadow-none print:border print:rounded-none">
          {/* Report Header */}
          <div className="text-center space-y-4 border-b pb-8 mb-8">
            <div className="flex justify-center items-center gap-2 text-slate-400 font-black uppercase tracking-[0.3em] text-xs">
              <FileText className="w-4 h-4" /> Official Game Report
            </div>
            <div className="flex justify-between items-center gap-8">
              <div className="flex-1 text-right">
                <h1 className="text-3xl font-black uppercase tracking-tighter">{game.homeTeam}</h1>
                <div className="text-5xl font-black text-slate-900">{game.homeScore}</div>
              </div>
              <div className="text-slate-300 text-4xl font-light italic">VS</div>
              <div className="flex-1 text-left">
                <h1 className="text-3xl font-black uppercase tracking-tighter">{game.awayTeam}</h1>
                <div className="text-5xl font-black text-slate-900">{game.awayScore}</div>
              </div>
            </div>
            <div className="flex justify-center gap-6 text-sm font-medium text-slate-500 pt-4">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Final Score</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Stadium Field</span>
              <span className="flex items-center gap-1.5"><Trophy className="w-4 h-4" /> Regular Season</span>
            </div>
          </div>

          {/* Team Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <section>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 border-b pb-2">Team Statistics</h2>
              <div className="space-y-3">
                {[
                  { label: "Total Yards", home: homeStats.totalYards, away: awayStats.totalYards },
                  { label: "Passing Yards", home: homeStats.passYards, away: awayStats.passYards },
                  { label: "Rushing Yards", home: homeStats.rushYards, away: awayStats.rushYards },
                  { label: "First Downs", home: homeStats.firstDowns, away: awayStats.firstDowns },
                  { label: "Total Plays", home: homeStats.playCount, away: awayStats.playCount },
                ].map((stat) => (
                  <div key={stat.label} className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-900 w-12 text-center">{stat.home}</span>
                    <span className="text-slate-400 uppercase text-[10px] font-black">{stat.label}</span>
                    <span className="font-bold text-slate-900 w-12 text-center">{stat.away}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 border-b pb-2">Scoring Summary</h2>
              <div className="space-y-2">
                {game.playLog.filter(p => p.isScoringPlay).reverse().map((play, i) => (
                  <div key={i} className="flex justify-between items-start text-xs py-2 border-b border-slate-50 last:border-0">
                    <span className="font-bold text-slate-900 uppercase w-12">{play.possession.substring(0, 3)}</span>
                    <span className="flex-1 px-4 text-slate-600">{play.result}</span>
                    <span className="text-slate-400 font-mono">Q{game.quarter}</span>
                  </div>
                ))}
                {game.playLog.filter(p => p.isScoringPlay).length === 0 && (
                  <div className="text-slate-400 italic text-xs py-4">No scoring plays recorded.</div>
                )}
              </div>
            </section>
          </div>

          {/* Drive Summary */}
          <section className="mb-12">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 border-b pb-2">Drive Summary</h2>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="text-[10px] font-black uppercase">Team</TableHead>
                  <TableHead className="text-[10px] font-black uppercase">Plays</TableHead>
                  <TableHead className="text-[10px] font-black uppercase">Yards</TableHead>
                  <TableHead className="text-[10px] font-black uppercase">Result</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {game.drives.map((drive, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-bold text-xs">{drive.team === "Home" ? game.homeTeam : game.awayTeam}</TableCell>
                    <TableCell className="text-xs">{drive.plays}</TableCell>
                    <TableCell className="text-xs">{drive.yards}</TableCell>
                    <TableCell className="text-xs font-medium text-slate-600">{drive.result || "In Progress"}</TableCell>
                    <TableCell className="text-xs text-right text-slate-400">{new Date(drive.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          {/* Full Play-by-Play */}
          <section className="print:break-before-page">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 border-b pb-2">Full Play-by-Play Log</h2>
            <div className="space-y-1">
              {game.playLog.slice().reverse().map((play, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 py-2 border-b border-slate-50 text-[11px] items-center">
                  <div className="col-span-1 font-black text-slate-300">#{i + 1}</div>
                  <div className="col-span-1 font-bold text-slate-900">{play.possession.substring(0, 3)}</div>
                  <div className="col-span-2 font-medium text-slate-500">{play.down} & {play.distance === 0 ? "Goal" : play.distance}</div>
                  <div className="col-span-6 text-slate-700">
                    {play.player ? <span className="font-bold">#{play.player.number} {play.player.name}</span> : "Team"} {play.result}
                  </div>
                  <div className="col-span-2 text-right font-mono text-slate-400">
                    {play.yardLine > 50 ? `AWY ${100 - play.yardLine}` : `HOM ${play.yardLine}`}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t text-center text-[10px] text-slate-400 uppercase tracking-widest">
            Generated by Stat Keeper Pro • {new Date().toLocaleString()}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GameReport;