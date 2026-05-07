"use client";

import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Player } from "@/types/football";
import { UserPlus, Trash2, Save, ArrowLeft, Shield, Users, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { showSuccess } from "@/utils/toast";

const STORAGE_KEY = 'football_stat_keeper_teams_v1';

const Teams = () => {
  const [homeTeamName, setHomeTeamName] = useState("Wildcats");
  const [awayTeamName, setAwayTeamName] = useState("Eagles");
  const [homeRoster, setHomeRoster] = useState<Player[]>([]);
  const [awayRoster, setAwayRoster] = useState<Player[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setHomeTeamName(data.homeTeamName || "Wildcats");
      setAwayTeamName(data.awayTeamName || "Eagles");
      setHomeRoster(data.homeRoster || []);
      setAwayRoster(data.awayRoster || []);
    }
  }, []);

  const saveTeams = () => {
    const data = { homeTeamName, awayTeamName, homeRoster, awayRoster };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    showSuccess("Team data saved successfully");
  };

  const addPlayer = (team: 'home' | 'away') => {
    const newPlayer: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name: "New Player",
      number: 0,
      position: "QB"
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
                  value={player.number} 
                  onChange={(e) => updatePlayer(team, player.id, 'number', parseInt(e.target.value) || 0)}
                  className="h-8 font-bold"
                />
              </div>
              <div className="flex-1">
                <Label className="text-[10px] uppercase text-slate-400">Name</Label>
                <Input 
                  value={player.name} 
                  onChange={(e) => updatePlayer(team, player.id, 'name', e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="w-20">
                <Label className="text-[10px] uppercase text-slate-400">Pos</Label>
                <Input 
                  value={player.position} 
                  onChange={(e) => updatePlayer(team, player.id, 'position', e.target.value)}
                  className="h-8 uppercase"
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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900">TEAM MANAGEMENT</h1>
              <p className="text-slate-500 text-sm">Configure your rosters and team settings</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={saveTeams} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4" /> Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6 space-y-6 border-none shadow-lg bg-white">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-inner">
                <Shield className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Home Team Name</Label>
                <Input 
                  value={homeTeamName} 
                  onChange={(e) => setHomeTeamName(e.target.value)}
                  className="text-xl font-bold border-none p-0 h-auto focus-visible:ring-0 bg-transparent"
                />
              </div>
            </div>
            <RosterEditor team="home" roster={homeRoster} />
          </Card>

          <Card className="p-6 space-y-6 border-none shadow-lg bg-white">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-inner">
                <Shield className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Away Team Name</Label>
                <Input 
                  value={awayTeamName} 
                  onChange={(e) => setAwayTeamName(e.target.value)}
                  className="text-xl font-bold border-none p-0 h-auto focus-visible:ring-0 bg-transparent"
                />
              </div>
            </div>
            <RosterEditor team="away" roster={awayRoster} />
          </Card>
        </div>

        <Card className="p-6 border-none shadow-lg bg-slate-900 text-white">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold">Game Configuration</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-400">Quarter Length (Minutes)</Label>
              <Input type="number" defaultValue={15} className="bg-slate-800 border-slate-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400">Timeouts per Half</Label>
              <Input type="number" defaultValue={3} className="bg-slate-800 border-slate-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400">Game Location</Label>
              <Input placeholder="Stadium Name" className="bg-slate-800 border-slate-700 text-white" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Teams;