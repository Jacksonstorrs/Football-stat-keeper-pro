"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Database, CheckCircle2, XCircle } from "lucide-react";

const SupabaseDiagnostic = () => {
  const [status, setStatus] = useState<'testing' | 'connected' | 'error'>('testing');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        if (error && error.code !== 'PGRST116') { // PGRST116 is just "no rows", which is fine
          console.error("Supabase connection error:", error);
          setStatus('error');
        } else {
          setStatus('connected');
        }
      } catch (err) {
        setStatus('error');
      }
    };

    checkConnection();
  }, []);

  if (status === 'testing') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {status === 'connected' ? (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 gap-1.5 py-1 px-3">
          <CheckCircle2 className="w-3 h-3" />
          <Database className="w-3 h-3" />
          Supabase Connected
        </Badge>
      ) : (
        <Badge variant="destructive" className="gap-1.5 py-1 px-3">
          <XCircle className="w-3 h-3" />
          <Database className="w-3 h-3" />
          Supabase Error
        </Badge>
      )}
    </div>
  );
};

export default SupabaseDiagnostic;