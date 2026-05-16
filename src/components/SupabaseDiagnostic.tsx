"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Database, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const SupabaseDiagnostic = () => {
  const [status, setStatus] = useState<'testing' | 'connected' | 'error'>('testing');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // We just want to see if we can reach the API. 
        // Selecting 'id' from profiles is a safe way to check if the table and connection are live.
        const { error } = await supabase.from('profiles').select('id').limit(1);
        
        // If we get an error that isn't "no rows found" or "not authenticated", something is wrong with the setup
        if (error && !['PGRST116', '42P01'].includes(error.code)) {
          console.error("Supabase diagnostic error:", error);
          setStatus('error');
        } else {
          setStatus('connected');
        }
      } catch (err) {
        console.error("Supabase diagnostic exception:", err);
        setStatus('error');
      }
    };

    checkConnection();
  }, []);

  if (status === 'testing') return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge variant="outline" className="gap-1.5 py-1 px-3 bg-white/80 backdrop-blur-sm">
        <Loader2 className="w-3 h-3 animate-spin" />
        Checking Database...
      </Badge>
    </div>
  );

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {status === 'connected' ? (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 gap-1.5 py-1 px-3 shadow-sm backdrop-blur-sm">
          <CheckCircle2 className="w-3 h-3" />
          <Database className="w-3 h-3" />
          Supabase Connected
        </Badge>
      ) : (
        <Badge variant="destructive" className="gap-1.5 py-1 px-3 shadow-lg">
          <XCircle className="w-3 h-3" />
          <Database className="w-3 h-3" />
          Supabase Error
        </Badge>
      )}
    </div>
  );
};

export default SupabaseDiagnostic;