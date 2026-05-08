"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Trophy, Users, FileText, Calendar, 
  BarChart3, Settings, PlayCircle, History 
} from "lucide-react";
import Header from "@/components/Header";

const Dashboard = () => {
  const { teamCode } = useAuth();

  const menuItems = [
    {
      title: "Live Game Tracker",
      desc: "Track plays, scores, and stats in real-time",
      icon: PlayCircle,
      link: "/tracker",
      color: "bg-blue-600",
      textColor: "text-blue-600"
    },
    {
      title: "Team Management",
      desc: "Manage rosters and team configurations",
      icon: Users,
      link: "/teams",
      color: "bg-emerald-600",
      textColor: "text-emerald-600"
    },
    {
      title: "Season Schedule",
      desc: "View upcoming games and past results",
      icon: Calendar,
      link: "/games",
      color: "bg-amber-500",
      textColor: "text-amber-500"
    },
    {
      title: "Season Analytics",
      desc: "Comprehensive stats and leaderboards",
      icon: BarChart3,
      link: "/season-stats",
      color: "bg-purple-600",
      textColor: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-6xl mx-auto p-6 md:p-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase mb-2">
            Welcome, {teamCode}
          </h1>
          <p className="text-slate-500 font-medium">Select a module to manage your team's performance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item) => (
            <Link key={item.title} to={item.link}>
              <Card className="p-8 hover:shadow-xl transition-all border-none group cursor-pointer relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-2 h-full ${item.color}`} />
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-slate-900 text-white border-none shadow-lg md:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-black uppercase tracking-widest">Recent Activity</h3>
              </div>
              <Button variant="link" className="text-blue-400 text-xs font-bold uppercase p-0">View All</Button>
            </div>
            <div className="space-y-4">
              <div className="text-center py-8 text-slate-500 italic text-sm">
                No recent activity recorded for this team.
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-none shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Quick Stats</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase">Games Played</span>
                <span className="font-bold">0</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase">Total Wins</span>
                <span className="font-bold">0</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[10px] font-black text-slate-400 uppercase">Win Rate</span>
                <span className="font-bold">0%</span>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;