"use client";

import React, { useEffect, useState } from 'react';
import { GameState } from "@/types/football";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Trophy, Calendar, ArrowLeft, Plus, Trash2, ChevronRight, MapPin, Clock, CheckCircle2, RefreshCw } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const SEASON_STORAGE_KEY = 'football_stat_keeper_season_v1';

interface ScheduledGame {
  id: string;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  location: string;
  status: 'scheduled' | 'completed';
  homeScore?: number;
  awayScore?: number;
  winner?: string;
}

const GamesList = () => {
  const { teamCode } = useAuth();
  const [games, setGames] = useState<(GameState | ScheduledGame)[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<ScheduledGame | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [newGame, setNewGame] = useState({
    date: '',
    time: '',
    homeTeam: '',
    awayTeam: '',
    location: ''
  });

  const [manualResult, setManualResult] = useState({
    homeScore: 0,
    awayScore: 0
  });

  useEffect(() => {
    if (!teamCode) return;

    const loadGames = async () => {
      // Load from local storage first
      const saved = localStorage.getItem(`${SEASON_STORAGE_KEY}_${teamCode}`);
      if (saved) setGames(JSON.parse(saved));

      // Fetch from Supabase
      const { data, error } = await supabase
        .from('seasons')
        .select('data')
        .eq('id', teamCode)
        .single();
      
      if (data?.data) {
        setGames(data.data);
        localStorage.setItem(`${SEASON_STORAGE_KEY}_${teamCode}`, JSON.stringify(data.data));
      }
    };

    loadGames();

    // Real-time subscription
    const channel = supabase
      .channel(`season_${teamCode}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seasons', filter: `id=eq.${teamCode}` }, 
        payload => {
          if (payload.new && payload.new.data) {
            setGames(payload.new.data);
            localStorage.setItem(`${SEASON_STORAGE_KEY}_${teamCode}`, JSON.stringify(payload.new.data));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamCode]);

  const saveGames = async (updated: (GameState | ScheduledGame)[]) => {
    setGames(updated);
    localStorage.setItem(`${SEASON_STORAGE_KEY}_${teamCode}`, JSON.stringify(updated));

    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from('seasons')
        .upsert({ id: teamCode, data: updated, updated_at: new Date().toISOString() });
      
      if (error) throw error;
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddGame = () => {
    if (!newGame.homeTeam || !newGame.awayTeam || !newGame.date) {
      showError("Please fill in the required fields.");
      return;
    }

    const game: ScheduledGame = {
      id: Math.random().toString(36).substr(2, 9),
      ...newGame,
      status: 'scheduled'
    };

    const updated = [game, ...games];
    saveGames(updated);
    setIsAddDialogOpen(false);
    showSuccess("Game scheduled successfully");
    setNewGame({ date: '', time: '', homeTeam: '', awayTeam: '', location: '' });
  };

  const handleEnterResult = () => {
    if (!selectedGame) return;
    
    const updated = games.map(g => {
      const gId = 'id' in g ? g.id : (g as any).currentDriveId;
      if (gId === selectedGame.id) {
        const winner = manualResult.homeScore > manualResult.awayScore 
          ? selectedGame.homeTeam 
          : manualResult.awayScore > manualResult.homeScore 
            ? selectedGame.awayTeam 
            : 'Tie';
            
        return {
          ...g,
          status: 'completed' as const,
          homeScore: manualResult.homeScore,
          awayScore: manualResult.awayScore,
          winner
        };
      }
      return g;
    });

    saveGames(updated);
    setIsResultDialogOpen(false);
    showSuccess("Result recorded");
  };

  const deleteGame = (id: string) => {
    const updated = games.filter(g => {
      const gId = 'id' in g ? g.id : (g as any).currentDriveId;
      return gId !== id;
    });
    saveGames(updated);
    showSuccess("Game removed from schedule");
  };

  const isLiveGame = (game: any): game is GameState => {
    return 'playLog' in game;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Season Schedule</h1>
                {isSyncing && <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />}
              </div>
              <p className="text-slate-500 text-sm font-medium">Manage upcoming games and past results</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-slate-900 hover:bg-slate-800 shadow-lg">
                  <Plus className="w-4 h-4" /> Schedule Game
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Schedule New Game</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" value={newGame.date} onChange={e => setNewGame({...newGame, date: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input type="time" value={newGame.time} onChange={e => setNewGame({...newGame, time: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Home Team</Label>
                    <Input placeholder="Wildcats" value={newGame.homeTeam} onChange={e => setNewGame({...newGame, homeTeam: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Away Team</Label>
                    <Input placeholder="Eagles" value={newGame.awayTeam} onChange={e => setNewGame({...newGame, awayTeam: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input placeholder="Memorial Stadium" value={newGame.location} onChange={e => setNewGame({...newGame, location: e.target.value})} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddGame} className="w-full bg-emerald-600 hover:bg-emerald-700">Save Schedule</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Link to="/season-stats">
              <Button variant="outline" className="gap-2 font-bold">
                <Trophy className="w-4 h-4" /> Season Stats
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          {games.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">No games scheduled</h3>
                <p className="text-slate-500 text-sm">Start by scheduling your first match or tracking a live game.</p>
              </div>
            </Card>
          ) : (
            games.map((game, idx) => {
              const live = isLiveGame(game);
              const id = live ? game.currentDriveId : (game as ScheduledGame).id;
              const status = live ? 'completed' : (game as ScheduledGame).status;
              
              return (
                <Card key={id} className="p-6 hover:shadow-md transition-shadow border-none shadow-sm group relative overflow-hidden">
                  {status === 'scheduled' && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />}
                  
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-8 flex-1">
                      <div className="text-center min-w-[100px]">
                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1">
                          {live ? 'Tracked Game' : 'Scheduled'}
                        </div>
                        <div className="text-xs font-bold text-slate-900">
                          {live ? 'FINAL' : (game as ScheduledGame).date || 'TBD'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 flex-1 justify-center md:justify-start">
                        <div className="text-right min-w-[80px]">
                          <div className="text-sm font-black uppercase truncate">{game.homeTeam}</div>
                          <div className="text-2xl font-black">{game.homeScore ?? '-'}</div>
                        </div>
                        <div className="text-slate-200 font-light italic">VS</div>
                        <div className="text-left min-w-[80px]">
                          <div className="text-sm font-black uppercase truncate">{game.awayTeam}</div>
                          <div className="text-2xl font-black">{game.awayScore ?? '-'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {!live && status === 'scheduled' && (
                        <Button 
                          variant="secondary" 
                          size="sm"
                          className="gap-2 font-bold bg-blue-50 text-blue-600 hover:bg-blue-100"
                          onClick={() => {
                            setSelectedGame(game as ScheduledGame);
                            setIsResultDialogOpen(true);
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4" /> Record Score
                        </Button>
                      )}
                      
                      <Button variant="ghost" size="icon" onClick={() => deleteGame(id)} className="text-slate-300 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      
                      {live && (
                        <Link to="/report">
                          <Button variant="outline" size="sm" className="font-bold">View Report</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Enter Final Score</DialogTitle>
            </DialogHeader>
            <div className="py-6 space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 text-center space-y-2">
                  <Label className="text-[10px] uppercase font-black text-slate-400">{selectedGame?.homeTeam}</Label>
                  <Input 
                    type="number" 
                    className="text-center text-2xl font-black h-16" 
                    value={manualResult.homeScore}
                    onChange={e => setManualResult({...manualResult, homeScore: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="text-2xl font-light text-slate-300">VS</div>
                <div className="flex-1 text-center space-y-2">
                  <Label className="text-[10px] uppercase font-black text-slate-400">{selectedGame?.awayTeam}</Label>
                  <Input 
                    type="number" 
                    className="text-center text-2xl font-black h-16" 
                    value={manualResult.awayScore}
                    onChange={e => setManualResult({...manualResult, awayScore: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleEnterResult} className="w-full bg-slate-900">Finalize Result</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default GamesList;