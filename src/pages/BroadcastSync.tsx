"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { useBroadcast } from "@/context/BroadcastContext";
import { generateDxtrXml } from "@/utils/dxtrXmlGenerator";
import { GameState } from "@/types/football";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  FileCode, HardDrive, CheckCircle2, 
  AlertCircle, ArrowLeft, Settings2, Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

const GAME_STORAGE_KEY = 'football_stat_keeper_pro_v2';

const BroadcastSync = () => {
  const { teamCode } = useAuth();
  const { connected, lastSync, fileName, error, autoSync, setAutoSync, connect, disconnect } = useBroadcast();
  const [xmlPreview, setXmlPreview] = useState("");

  // Update preview only
  useEffect(() => {
    const loadPreview = () => {
      const saved = localStorage.getItem(`${GAME_STORAGE_KEY}_${teamCode}`);
      if (saved) {
        setXmlPreview(generateDxtrXml(JSON.parse(saved)));
      }
    };

    loadPreview();
    const interval = setInterval(loadPreview, 1000);
    return () => clearInterval(interval);
  }, [teamCode]);

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
            {connected ? (
              <Button variant="destructive" onClick={disconnect} className="gap-2 font-bold uppercase text-xs">
                Disconnect File
              </Button>
            ) : (
              <Button onClick={connect} className="gap-2 bg-blue-600 hover:bg-blue-500 font-black uppercase tracking-widest shadow-lg shadow-blue-100">
                <HardDrive className="w-4 h-4" /> Link Local File
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <Card className="p-6 border-none shadow-sm bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Sync Status</h3>
                {connected ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 gap-1.5">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-slate-400 gap-1.5">
                    <AlertCircle className="w-3 h-3" /> Inactive
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Target File</span>
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                    {fileName || "None selected"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Last Heartbeat</span>
                  <span className="text-xs font-bold text-slate-900">
                    {lastSync ? lastSync.toLocaleTimeString() : "Never"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Auto-Overwrite</span>
                    <span className="text-[8px] text-slate-400 font-bold uppercase">1s Interval</span>
                  </div>
                  <Switch checked={autoSync} onCheckedChange={setAutoSync} />
                </div>
              </div>

              {error && (
                <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  <p className="text-[10px] text-red-600 font-medium leading-tight">{error}</p>
                </div>
              )}
            </Card>

            <Card className="p-6 border-none shadow-sm bg-slate-900 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Settings2 className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-black uppercase tracking-widest">DXTR Configuration</h3>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
                The system is now configured to overwrite the linked file every second. This provides a constant data stream for Daktronics DXTR or Stat Crew software.
              </p>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-center gap-3">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-bold text-slate-300 uppercase">High-Frequency Sync Active</span>
              </div>
            </Card>
          </div>

          <Card className="lg:col-span-2 p-0 border-none shadow-xl bg-slate-950 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-900 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Live XML Stream</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${connected && autoSync ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                <span className="text-[10px] font-black text-slate-500 uppercase">1.0 Hz Heartbeat</span>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-auto max-h-[600px]">
              <pre className="text-[11px] font-mono text-blue-300 leading-relaxed">
                {xmlPreview || "Waiting for game data..."}
              </pre>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BroadcastSync;