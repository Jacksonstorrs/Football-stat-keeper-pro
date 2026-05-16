"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { showSuccess, showError } from "@/utils/toast";

interface SyncContextProps {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSync: boolean;
  triggerSync: (type: 'game' | 'teams' | 'season') => void;
}

const SyncContext = createContext<SyncContextProps | undefined>(undefined);

export const useSync = () => {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error("useSync must be used within SyncProvider");
  return ctx;
};

const STORAGE_KEYS = {
  game: 'football_stat_keeper_pro_v2',
  teams: 'football_stat_keeper_teams_v1',
  season: 'football_stat_keeper_season_v1'
};

export const SyncProvider = ({ children }: { children: React.ReactNode }) => {
  const { teamCode, session } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSync, setPendingSync] = useState(false);

  // Track online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkPending = useCallback(() => {
    if (!teamCode) return false;
    const flags = ['game', 'teams', 'season'].map(type => 
      localStorage.getItem(`sync_pending_${type}_${teamCode}`) === 'true'
    );
    return flags.some(f => f);
  }, [teamCode]);

  const triggerSync = useCallback((type: 'game' | 'teams' | 'season') => {
    if (teamCode) {
      localStorage.setItem(`sync_pending_${type}_${teamCode}`, 'true');
      setPendingSync(true);
    }
  }, [teamCode]);

  const performSync = useCallback(async () => {
    if (!isOnline || !teamCode || !session || isSyncing) return;

    const types: ('game' | 'teams' | 'season')[] = ['game', 'teams', 'season'];
    let syncedAny = false;

    setIsSyncing(true);

    for (const type of types) {
      const isPending = localStorage.getItem(`sync_pending_${type}_${teamCode}`) === 'true';
      if (!isPending) continue;

      const localData = localStorage.getItem(`${STORAGE_KEYS[type]}_${teamCode}`);
      if (!localData) {
        localStorage.removeItem(`sync_pending_${type}_${teamCode}`);
        continue;
      }

      try {
        const data = JSON.parse(localData);
        let error;

        if (type === 'game') {
          ({ error } = await supabase.from('games').upsert({ id: teamCode, state: data, updated_at: new Date().toISOString() }));
        } else if (type === 'teams') {
          ({ error } = await supabase.from('teams').upsert({ id: teamCode, data, updated_at: new Date().toISOString() }));
        } else if (type === 'season') {
          ({ error } = await supabase.from('seasons').upsert({ id: teamCode, data, updated_at: new Date().toISOString() }));
        }

        if (!error) {
          localStorage.removeItem(`sync_pending_${type}_${teamCode}`);
          syncedAny = true;
        }
      } catch (err) {
        console.error(`Sync error for ${type}:`, err);
      }
    }

    setIsSyncing(false);
    setPendingSync(checkPending());
    
    if (syncedAny) {
      showSuccess("Cloud sync complete");
    }
  }, [isOnline, teamCode, session, isSyncing, checkPending]);

  // Auto-sync when coming online or when pending changes exist
  useEffect(() => {
    if (isOnline && pendingSync) {
      const timeout = setTimeout(performSync, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isOnline, pendingSync, performSync]);

  // Initial check for pending syncs
  useEffect(() => {
    setPendingSync(checkPending());
  }, [teamCode, checkPending]);

  return (
    <SyncContext.Provider value={{ isOnline, isSyncing, pendingSync, triggerSync }}>
      {children}
    </SyncContext.Provider>
  );
};