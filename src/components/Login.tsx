"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Users } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      const success = login(code, showAdmin ? password : "");
      if (success) {
        showSuccess(showAdmin && password === "admin" ? "Logged in as Admin" : "Logged in as Viewer");
        navigate("/");
      } else {
        showError("Invalid login credentials");
      }
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
          <p className="text-slate-400 text-sm font-medium mt-2">Real-time Football Analytics</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Team Access Code</label>
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

          {showAdmin && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Admin Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-14 pl-12 text-lg font-bold bg-slate-800 border-white/10 focus-visible:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full h-14 text-lg font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 shadow-lg transition-all active:scale-[0.98]"
            >
              {showAdmin ? "Login as Admin" : "Join Session"}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAdmin(!showAdmin)}
              className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest"
            >
              {showAdmin ? "Switch to Viewer Mode" : "Admin Login"}
            </Button>
          </div>
        </form>
        
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
            Cloud Sync Enabled
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;