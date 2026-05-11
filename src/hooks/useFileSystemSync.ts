"use client";

import { useState, useCallback, useEffect } from 'react';
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

  // Connect to a file
  const connect = useCallback(async () => {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: 'game_data.xml',
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
      showSuccess(`Connected to ${handle.name}`);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setStatus(prev => ({ ...prev, error: err.message }));
        showError("Failed to connect to file");
      }
    }
  }, []);

  // Write data to the file
  const sync = useCallback(async (data: string) => {
    if (!fileHandle || !autoSync) return;

    try {
      // Check for permissions
      const permission = await fileHandle.queryPermission({ mode: 'readwrite' });
      if (permission !== 'granted') {
        // We can't automatically request permission without user gesture in some browsers
        // but we'll try to update status
        setStatus(prev => ({ ...prev, connected: false, error: "Permission required" }));
        return;
      }

      const writable = await fileHandle.createWritable();
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
      setStatus(prev => ({ ...prev, connected: false, error: err.message }));
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