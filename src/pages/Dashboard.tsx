"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Trophy, Users, Calendar, 
  BarChart3, PlayCircle, History, ArrowRight,
  Activity, Target, Zap
} from "lucide-react";
import Header from "@/components/Header";

const SEASON_STORAGE_KEY = 'football_stat_keeper_season_v1';

const Dashboard = () => {
  const { teamCode } = useAuth();
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    winRate: 0,
    recentActivity: []
  });

  useEffect(() => {
    if (!teamCode) return;

    const loadStats = () => {
      const saved = localStorage.getItem(`${SEASON_STORAGE_KEY}_${teamCode}`);
      if (saved) {
        const games = JSON.parse(saved);
        const completedGames = games.filter((g: any) => g.status === 'completed');
        const wins = completedGames.filter((g: any) => g.winner === teamCode || (g.homeTeam === teamCode && g.homeScore > g.awayScore) || (g.awayTeam === teamCode && g.awayScore > g.homeScore)).length;
        
        setStats({
          gamesPlayed: completedGames.length,
          winRate: completedGames.length > 0 ? Math.round((wins / completedGames.length) * 100) : 0,
          recentActivity: games.slice(0, 5)
        });
      }
    };

    loadStats();
    window.addEventListener('storage', loadStats);
    return () => window.removeEventListener('storage', loadStats);
  }, [teamCode]);

  const menuItems = [
    {
      title: "Live Tracker",
      desc: "Real-time play entry & scoring",
      icon: PlayCircle,
      link: "/tracker",
      color: "bg-blue-600",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Rosters",
      desc: "Manage players & positions",
      icon: Users,
      link: "/teams",
      color: "bg-emerald-600",
      lightColor: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    {
      title: "Schedule",
      desc: "Upcoming games & results",
      icon: Calendar,
      link: "/games",
      color: "bg-amber-500",
      lightColor: "bg-amber-50",
      textColor: "text-amber-500"
    },
    {
      title: "Analytics",
      desc: "Season stats & leaderboards",
      icon: BarChart3,
      link: "/season-stats",
      color: "bg-purple-600",
      lightColor: "bg-purple-50",
      textColor: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />
      <main className="max-w-6xl mx-auto p-6 md:p-12">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">System Online</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase">
              {teamCode}
            </h1>
            <p className="text-slate-500 font-medium mt-2">Team Management & Performance Analytics</p>
          </div>
          <Link to="/tracker">
            <Button className="h-14 px-8 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest gap-3 shadow-xl shadow-slate-200 transition-all active:scale-95">
              <PlayCircle className="w-5 h-5" />
              Start Live Session
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {menuItems.map((item) => (
            <Link key={item.title} to={item.link} className="group">
              <Card className="p-6 h-full hover:shadow-2xl hover:-translate-y-1 transition-all border-none bg-white relative overflow-hidden">
                <div className={`w-12 h-12 rounded-xl ${item.lightColor} ${item.textColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 mb-1">{item.title}</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed mb-4">{item.desc}</p>
                <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${item.textColor}`}>
                  Open Module <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 p-8 bg-white border-none shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Recent Activity</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Last 24 Hours</p>
                </div>
              </div>
              <Link to="/games">
                <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">View History</Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((game: any, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="text-[10px] font-black text-slate-400 uppercase">{game.date || 'Live'}</div>
                      <div className="font-bold text-sm">{game.homeTeam} vs {game.awayTeam}</div>
                    </div>
                    <div className="font-black text-slate-900">{game.homeScore} - {game.awayScore}</div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                    <Activity className="w-8 h-8" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium italic">No recent activity recorded.</p>
                </div>
              )}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-8 bg-slate-900 text-white border-none shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Season Snapshot</h3>
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[10px] font-black text-slate-500 uppercase mb-1">Games Played</div>
                      <div className="text-3xl font-black">{stats.gamesPlayed}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-slate-500 uppercase mb-1">Win Rate</div>
                      <div className="text-3xl font-black text-emerald-400">{stats.winRate}%</div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase">Season Progress</span>
                      <span className="text-[10px] font-black text-slate-400">{stats.gamesPlayed} / 12 Games</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                        style={{ width: `${(stats.gamesPlayed / 12) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white border-none shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/teams">
                  <Button variant="outline" className="w-full h-12 text-[10px] font-black uppercase tracking-widest border-slate-100 hover:bg-slate-50">
                    <Users className="w-3 h-3 mr-2" /> Roster
                  </Button>
                </Link>
                <Link to="/games">
                  <Button variant="outline" className="w-full h-12 text-[10px] font-black uppercase tracking-widest border-slate-100 hover:bg-slate-50">
                    <Calendar className="w-3 h-3 mr-2" /> Schedule
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;