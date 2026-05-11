"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { generateDxtrXml } from "@/utils/dxtrXmlGenerator";
import { showSuccess, showError } from "@/utils/toast";

interface BroadcastContextProps {
  connected: boolean;
  lastSync: Date | null;
  fileName: string | null;
  error: string | null;
  autoSync: boolean;
  setAutoSync: (val: boolean) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const BroadcastContext = createContext<BroadcastContextProps | undefined>(undefined);

export const useBroadcast = () => {
  const ctx = useContext(BroadcastContext);
  if (!ctx) throw new Error("useBroadcast must be used within BroadcastProvider");
  return ctx;
};

const GAME_STORAGE_KEY = 'football_stat_keeper_pro_v2';

export const BroadcastProvider = ({ children }: { children: React.ReactNode }) => {
  const { teamCode } = useAuth();
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null);
  const [autoSync, setAutoSync] = useState(true);
  const [status, setStatus] = useState({
    connected: false,
    lastSync: null as Date | null,
    fileName: null as string | null,
    error: null as string | null
  });
  
  const isSyncing = useRef(false);
  const lastSyncTime = useRef<number>(0);

  const connect = async () => {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: 'dakstats_output.xml',
        types: [{
          description: 'XML Files',
          accept: { 'text/xml': ['.xml'] },
        }],
      });
      
      setFileHandle(handle);
      setStatus(prev => ({
        ...prev,
        connected: true,
        fileName: handle.name,
        error: null
      }));
      showSuccess(`Linked to ${handle.name}`);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setStatus(prev => ({ ...prev, error: err.message }));
        showError("Failed to link file");
      }
    }
  };

  const disconnect = () => {
    setFileHandle(null);
    setStatus({
      connected: false,
      lastSync: null,
      fileName: null,
      error: null
    });
  };

  const performSync = useCallback(async (data: string) => {
    if (!fileHandle || !autoSync || isSyncing.current) return;

    try {
      isSyncing.current = true;
      const writable = await fileHandle.createWritable({ keepExistingData: false });
      await writable.write(data);
      await writable.close();

      setStatus(prev => ({
        ...prev,
        lastSync: new Date(),
        error: null
      }));
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'NotFoundError') {
        setFileHandle(null);
        setStatus(prev => ({ 
          ...prev, 
          connected: false, 
          error: "Connection lost. Please re-link the file." 
        }));
      }
    } finally {
      isSyncing.current = false;
    }
  }, [fileHandle, autoSync]);

  // Global Heartbeat Effect
  useEffect(() => {
    if (!fileHandle || !autoSync || !teamCode) return;

    const interval = setInterval(() => {
      const saved = localStorage.getItem(`${GAME_STORAGE_KEY}_${teamCode}`);
      if (saved) {
        const gameState = JSON.parse(saved);
        const xml = generateDxtrXml(gameState);
        performSync(xml);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [fileHandle, autoSync, teamCode, performSync]);

  return (
    <BroadcastContext.Provider value={{ 
      ...status, 
      autoSync, 
      setAutoSync, 
      connect, 
      disconnect 
    }}>
      {children}
    </BroadcastContext.Provider>
  );
};