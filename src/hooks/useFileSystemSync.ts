"use client";

import { useState, useCallback, useRef } from 'react';
import { showSuccess, showError } from '@/utils/toast';

interface SyncStatus {
  connected: boolean;
  lastSync: Date | null;
  fileName: string | null;
  error: string | null;
}

export const useFileSystemSync = () => {
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null);
  const [status, setStatus] = useState<SyncStatus>({
    connected: false,
    lastSync: null,
    fileName: null,
    error: null
  });
  const [autoSync, setAutoSync] = useState(true);
  const isSyncing = useRef(false);

  // Connect to a file
  const connect = useCallback(async () => {
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
  }, []);

  // Write data to the file (Overwrites every time)
  const sync = useCallback(async (data: string) => {
    if (!fileHandle || !autoSync || isSyncing.current) return;

    try {
      isSyncing.current = true;
      
      // Create a writable stream (this automatically handles overwriting)
      const writable = await fileHandle.createWritable({ keepExistingData: false });
      await writable.write(data);
      await writable.close();

      setStatus(prev => ({
        ...prev,
        connected: true,
        lastSync: new Date(),
        error: null
      }));
    } catch (err: any) {
      console.error("Sync error:", err);
      // If we lose permission or the handle becomes stale
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

  const disconnect = useCallback(() => {
    setFileHandle(null);
    setStatus({
      connected: false,
      lastSync: null,
      fileName: null,
      error: null
    });
  }, []);

  return {
    connect,
    sync,
    disconnect,
    status,
    autoSync,
    setAutoSync
  };
};