"use client";

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Player, PlayerStats } from "@/types/football";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, User, Target, Zap, Shield, 
  TrendingUp, Award, Calendar, Activity 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';

const SEASON_STORAGE_KEY = 'football_stat_keeper_season_v1';

const PlayerProfile = () => {
  const { playerId } = useParams();
  const { teamCode } = useAuth();
  const [player, setPlayer] = useState<any>(null);
  const [gameHistory, setGameHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamCode || !playerId) return;

    const loadPlayerData = async () => {
      setLoading(true);
      
      const { data: seasonData } = await supabase
        .from('seasons')
        .select('data')
        .eq('id', teamCode)
        .single();
      
      const games = seasonData?.data || [];
      const history: any[] = [];
      let playerData: any = null;

      games.forEach((game: any, idx: number) => {
        if (game.stats && game.stats[playerId]) {
          const s = game.stats[playerId];
          const roster = [...(game.roster?.home || []), ...(game.roster?.away || [])];
          const pInfo = roster.find(p => p.id === playerId);
          
          if (pInfo && !playerData) {
            playerData = { ...pInfo, team: pInfo.team || (game.roster.home.some((p: any) => p.id === playerId) ? game.homeTeam : game.awayTeam) };
          }

          history.push({
            name: `Game ${idx + 1}`,
            opponent: game.homeTeam === playerData?.team ? game.awayTeam : game.homeTeam,
            passYds: s.passYds || 0,
            rushYds: s.rushYds || 0,
            tds: (s.passTDs || 0) + (s.rushTDs || 0) + (s.recTDs || 0),
            date: game.date || 'TBD'
          });
        }
      });

      setPlayer(playerData);
      setGameHistory(history);
      setLoading(false);
    };

    loadPlayerData();
  }, [teamCode, playerId]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-pulse text-slate-400 font-black uppercase tracking-widest">Loading Profile...</div>
    </div>
  );

  if (!player) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <User className="w-16 h-16 text-slate-200 mb-4" />
      <h2 className="text-xl font-black uppercase">Player Not Found</h2>
      <Link to="/season-stats" className="mt-4">
        <Button variant="outline">Back to Stats</Button>
      </Link>
    </div>
  );

  const totals = gameHistory.reduce((acc, g) => ({
    passYds: acc.passYds + g.passYds,
    rushYds: acc.rushYds + g.rushYds,
    tds: acc.tds + g.tds
  }), { passYds: 0, rushYds: 0, tds: 0 });

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />
      <main className="max-w-5xl mx-auto p-6 md:p-12 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/season-stats">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                <span className="text-2xl font-black">#{player.number}</span>
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">{player.name}</h1>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-black uppercase border-slate-200">{player.position}</Badge>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{player.team}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-blue-600 text-white border-none shadow-lg">
            <div className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Season Passing</div>
            <div className="text-3xl font-black">{totals.passYds} <span className="text-sm font-normal opacity-60">YDS</span></div>
          </Card>
          <Card className="p-6 bg-emerald-600 text-white border-none shadow-lg">
            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-200 mb-1">Season Rushing</div>
            <div className="text-3xl font-black">{totals.rushYds} <span className="text-sm font-normal opacity-60">YDS</span></div>
          </Card>
          <Card className="p-6 bg-amber-500 text-white border-none shadow-lg">
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-100 mb-1">Total Touchdowns</div>
            <div className="text-3xl font-black">{totals.tds} <span className="text-sm font-normal opacity-60">TD</span></div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 p-8 bg-white border-none shadow-sm">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Performance Trend</h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={gameHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                  <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="passYds" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} />
                  <Line type="monotone" dataKey="rushYds" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-8 bg-white border-none shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Game Log</h3>
            </div>
            <div className="space-y-4">
              {gameHistory.map((game, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase">{game.date}</div>
                    <div className="text-xs font-bold text-slate-900">vs {game.opponent}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-slate-900">{game.passYds + game.rushYds} YDS</div>
                    <div className="text-[10px] font-bold text-blue-600 uppercase">{game.tds} TD</div>
                  </div>
                </div>
              ))}
              {gameHistory.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs italic">No game data recorded yet.</div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PlayerProfile;