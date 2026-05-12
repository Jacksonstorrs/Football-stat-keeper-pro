"use client";

import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Player } from "@/types/football";
import { UserPlus, Trash2, Save, ArrowLeft, Shield, Users, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { showSuccess } from "@/utils/toast";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";

const STORAGE_KEY = 'football_stat_keeper_teams_v1';

const Teams = () => {
  const { teamCode } = useAuth();
  const [homeTeamName, setHomeTeamName] = useState("");
  const [awayTeamName, setAwayTeamName] = useState("");
  const [homeRoster, setHomeRoster] = useState<Player[]>([]);
  const [awayRoster, setAwayRoster] = useState<Player[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_${teamCode}`);
    if (saved) {
      const d = JSON.parse(saved);
      setHomeTeamName(d.homeTeamName || "");
      setAwayTeamName(d.awayTeamName || "");
      setHomeRoster(d.homeRoster || []);
      setAwayRoster(d.awayRoster || []);
    }
  }, [teamCode]);

  const saveTeams = () => {
    if (!homeTeamName || !awayTeamName) {
      showSuccess("Please enter both team names before saving.");
      return;
    }
    const data = { homeTeamName, awayTeamName, homeRoster, awayRoster };
    localStorage.setItem(`${STORAGE_KEY}_${teamCode}`, JSON.stringify(data));
    showSuccess("Team data saved successfully");
  };

  const addPlayer = (team: 'home' | 'away') => {
    const newPlayer: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      number: 0,
      position: ""
    };
    if (team === 'home') setHomeRoster([...homeRoster, newPlayer]);
    else setAwayRoster([...awayRoster, newPlayer]);
  };

  const updatePlayer = (team: 'home' | 'away', id: string, field: keyof Player, value: string | number) => {
    const update = (list: Player[]) => list.map(p => p.id === id ? { ...p, [field]: value } : p);
    if (team === 'home') setHomeRoster(update(homeRoster));
    else setAwayRoster(update(awayRoster));
  };

  const removePlayer = (team: 'home' | 'away', id: string) => {
    if (team === 'home') setHomeRoster(homeRoster.filter(p => p.id !== id));
    else setAwayRoster(awayRoster.filter(p => p.id !== id));
  };

  const RosterEditor = ({ team, roster }: { team: 'home' | 'away', roster: Player[] }) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-400" />
          Roster ({roster.length})
        </h3>
        <Button onClick={() => addPlayer(team)} variant="outline" size="sm" className="gap-2">
          <UserPlus className="w-4 h-4" /> Add Player
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {roster.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg text-slate-400 text-sm">
            No players added yet.
          </div>
        ) : (
          roster.map((player) => (
            <div key={player.id} className="flex gap-2 items-center bg-white p-3 rounded-lg border shadow-sm">
              <div className="w-16">
                <Label className="text-[10px] uppercase text-slate-400">No.</Label>
                <Input 
                  type="number"
                  value={player.number || ""} 
                  onChange={(e) => updatePlayer(team, player.id, 'number', parseInt(e.target.value) || 0)}
                  className="h-8 font-bold bg-slate-900 text-white border-none"
                  placeholder="00"
                />
              </div>
              <div className="flex-1">
                <Label className="text-[10px] uppercase text-slate-400">Name</Label>
                <Input 
                  type="text"
                  value={player.name} 
                  onChange={(e) => updatePlayer(team, player.id, 'name', e.target.value)}
                  className="h-8 bg-slate-900 text-white border-none cursor-text"
                  placeholder="Player Name"
                />
              </div>
              <div className="w-20">
                <Label className="text-[10px] uppercase text-slate-400">Pos</Label>
                <Input 
                  type="text"
                  value={player.position} 
                  onChange={(e) => updatePlayer(team, player.id, 'position', e.target.value)}
                  className="h-8 uppercase bg-slate-900 text-white border-none"
                  placeholder="QB"
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => removePlayer(team, player.id)}
                className="mt-5 text-slate-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-5xl mx-auto p-6 md:p-12 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Team Management</h1>
              <p className="text-slate-500 text-sm font-medium">Configure rosters for {teamCode}</p>
            </div>
          </div>
          <Button onClick={saveTeams} className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg">
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </div>

        {(!homeTeamName || !awayTeamName) && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <p className="text-sm font-medium">Please enter team names to begin tracking stats.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6 space-y-6 border-none shadow-lg bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-inner">
                <Shield className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Home Team Name</Label>
                <Input 
                  value={homeTeamName} 
                  onChange={(e) => setHomeTeamName(e.target.value)}
                  placeholder="Enter Home Team"
                  className="text-xl font-bold border-none p-0 h-auto focus-visible:ring-0 bg-transparent text-black"
                />
              </div>
            </div>
            <RosterEditor team="home" roster={homeRoster} />
          </Card>

          <Card className="p-6 space-y-6 border-none shadow-lg bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-inner">
                <Shield className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Away Team Name</Label>
                <Input 
                  value={awayTeamName} 
                  onChange={(e) => setAwayTeamName(e.target.value)}
                  placeholder="Enter Away Team"
                  className="text-xl font-bold border-none p-0 h-auto focus-visible:ring-0 bg-transparent text-black"
                />
              </div>
            </div>
            <RosterEditor team="away" roster={awayRoster} />
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Teams;