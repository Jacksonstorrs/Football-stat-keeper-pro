"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Database, CheckCircle2, XCircle, Loader2, Wifi, WifiOff, RefreshCw, Clock } from "lucide-react";
import { useSync } from "@/context/SyncContext";

const SupabaseDiagnostic = () => {
  const { isOnline, isSyncing, pendingSync } = useSync();
  const [dbStatus, setDbStatus] = useState<'testing' | 'connected' | 'error'>('testing');

  useEffect(() => {
    const checkConnection = async () => {
      if (!isOnline) {
        setDbStatus('testing');
        return;
      }

      try {
        // Check connection by querying the games table which is central to the app
        const { error } = await supabase.from('games').select('id').limit(1);
        
        // We ignore "table not found" (42P01) or "no rows" (PGRST116) as they don't mean connection failure
        if (error && !['PGRST116', '42P01', 'PGRST301'].includes(error.code)) {
          console.error("Cloud connection check failed:", error);
          setDbStatus('error');
        } else {
          setDbStatus('connected');
        }
      } catch (err) {
        setDbStatus('error');
      }
    };

    checkConnection();
    // Re-check every 30 seconds to ensure connection stays alive
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [isOnline]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 pointer-events-none">
      {/* Sync Status */}
      {pendingSync && (
        <Badge variant="outline" className="gap-1.5 py-1 px-3 bg-amber-50/90 text-amber-600 border-amber-200 shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2">
          {isSyncing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Clock className="w-3 h-3" />}
          <span className="text-[10px] font-bold uppercase tracking-tight">
            {isSyncing ? "Syncing to Cloud..." : "Changes Pending Sync"}
          </span>
        </Badge>
      )}

      {/* Connection Status */}
      <div className="flex gap-2">
        <Badge variant="outline" className={`gap-1.5 py-1 px-3 shadow-sm backdrop-blur-sm ${isOnline ? 'bg-emerald-50/90 text-emerald-600 border-emerald-200' : 'bg-slate-50/90 text-slate-400 border-slate-200'}`}>
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span className="text-[10px] font-bold uppercase tracking-tight">{isOnline ? "Online" : "Offline Mode"}</span>
        </Badge>

        {isOnline && (
          <Badge className={`${dbStatus === 'connected' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' : dbStatus === 'error' ? 'bg-red-500/10 text-red-600 border-red-200' : 'bg-slate-100 text-slate-400'} gap-1.5 py-1 px-3 shadow-sm backdrop-blur-sm`}>
            {dbStatus === 'testing' ? <Loader2 className="w-3 h-3 animate-spin" /> : dbStatus === 'connected' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            <Database className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-tight">
              {dbStatus === 'connected' ? "Cloud Connected" : dbStatus === 'error' ? "Cloud Error" : "Checking..."}
            </span>
          </Badge>
        )}
      </div>
    </div>
  );
};

export default SupabaseDiagnostic;