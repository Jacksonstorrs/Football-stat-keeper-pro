"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { useFileSystemSync } from "@/hooks/useFileSystemSync";
import { generateDxtrXml } from "@/utils/dxtrXmlGenerator";
import { GameState } from "@/types/football";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Radio, FileCode, HardDrive, RefreshCw, 
  CheckCircle2, AlertCircle, ArrowLeft, ExternalLink,
  Play, Pause, Settings2
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

const GAME_STORAGE_KEY = 'football_stat_keeper_pro_v2';

const BroadcastSync = () => {
  const { teamCode } = useAuth();
  const { connect, sync, status, autoSync, setAutoSync, disconnect } = useFileSystemSync();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [xmlPreview, setXmlPreview] = useState("");

  // Load game state for preview
  useEffect(() => {
    const loadGame = () => {
      const saved = localStorage.getItem(`${GAME_STORAGE_KEY}_${teamCode}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setGameState(parsed);
        setXmlPreview(generateDxtrXml(parsed));
      }
    };

    loadGame();
    const interval = setInterval(loadGame, 2000); // Refresh preview periodically
    return () => clearInterval(interval);
  }, [teamCode]);

  // Trigger sync when game state changes
  useEffect(() => {
    if (gameState && status.connected && autoSync) {
      sync(generateDxtrXml(gameState));
    }
  }, [gameState, status.connected, autoSync, sync]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />
      <main className="max-w-6xl mx-auto p-6 md:p-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Broadcast Sync</h1>
              <p className="text-slate-500 text-sm font-medium">Daktronics DXTR XML Output System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {status.connected ? (
              <Button variant="destructive" onClick={disconnect} className="gap-2 font-bold uppercase text-xs">
                Disconnect File
              </Button>
            ) : (
              <Button onClick={connect} className="gap-2 bg-blue-600 hover:bg-blue-500 font-black uppercase tracking-widest shadow-lg shadow-blue-100">
                <HardDrive className="w-4 h-4" /> Connect Local File
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Status Panel */}
          <div className="space-y-6">
            <Card className="p-6 border-none shadow-sm bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Sync Status</h3>
                {status.connected ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 gap-1.5">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-slate-400 gap-1.5">
                    <AlertCircle className="w-3 h-3" /> Disconnected
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Target File</span>
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                    {status.fileName || "None selected"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Last Update</span>
                  <span className="text-xs font-bold text-slate-900">
                    {status.lastSync ? status.lastSync.toLocaleTimeString() : "Never"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Auto-Sync</span>
                  <Switch checked={autoSync} onCheckedChange={setAutoSync} />
                </div>
              </div>

              {status.error && (
                <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  <p className="text-[10px] text-red-600 font-medium leading-tight">{status.error}</p>
                </div>
              )}
            </Card>

            <Card className="p-6 border-none shadow-sm bg-slate-900 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Settings2 className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-black uppercase tracking-widest">DXTR Configuration</h3>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
                Point your Daktronics DXTR software to the connected XML file. Ensure the "Stat Crew" data source is selected in your graphics controller.
              </p>
              <Button variant="outline" className="w-full h-10 text-[10px] font-black uppercase border-white/10 hover:bg-white/5 text-white">
                View Documentation <ExternalLink className="w-3 h-3 ml-2" />
              </Button>
            </Card>
          </div>

          {/* XML Preview */}
          <Card className="lg:col-span-2 p-0 border-none shadow-xl bg-slate-950 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-900 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Live XML Output</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status.connected && autoSync ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                <span className="text-[10px] font-black text-slate-500 uppercase">Real-time Stream</span>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-auto max-h-[600px]">
              <pre className="text-[11px] font-mono text-blue-300 leading-relaxed">
                {xmlPreview || "No game data available for preview."}
              </pre>
            </div>
            <div className="px-6 py-3 bg-slate-900/50 border-t border-white/5 text-center">
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                Stat Crew Football Schema v1.0
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BroadcastSync;