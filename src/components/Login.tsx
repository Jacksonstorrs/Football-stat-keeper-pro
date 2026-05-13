"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Shield, Users, LogIn } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const { session, login, teamCode } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  // Redirect if already fully logged in
  useEffect(() => {
    if (session && teamCode) {
      navigate("/");
    }
  }, [session, teamCode, navigate]);

  const handleTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      login(code);
      showSuccess("Session activated");
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl border-white/5 bg-slate-900 text-white">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/20">
            <Shield className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase">Stat Keeper Pro</h2>
          <p className="text-slate-400 text-sm font-medium mt-2">
            {!session ? "Secure Authentication" : "Team Access Terminal"}
          </p>
        </div>

        {!session ? (
          <div className="space-y-4">
            <Auth
              supabaseClient={supabase}
              appearance={{ 
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#2563eb',
                      brandAccent: '#3b82f6',
                    }
                  }
                }
              }}
              theme="dark"
              providers={[]}
            />
          </div>
        ) : (
          <form onSubmit={handleTeamSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-6">
              <p className="text-xs text-blue-400 font-bold text-center">
                Authenticated as {session.user.email}
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Enter Team Access Code</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="WILDCATS2024"
                  className="h-14 pl-12 text-lg font-bold uppercase tracking-widest bg-slate-800 border-white/10 focus-visible:ring-blue-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 shadow-lg transition-all active:scale-[0.98]"
            >
              Access Dashboard
            </Button>
          </form>
        )}
        
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
            {session ? "Step 2: Team Isolation" : "Step 1: Identity Verification"}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;