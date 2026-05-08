"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Shield } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      login(code);
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md p-8 shadow-xl border-none">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Stat Keeper Pro</h2>
          <p className="text-slate-500 text-sm font-medium">Enter your team access code to begin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Team Access Code</label>
            <Input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. WILDCATS2024"
              className="h-14 text-lg font-bold text-center uppercase tracking-widest border-2 focus-visible:ring-slate-900"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-14 text-lg font-black uppercase tracking-widest bg-slate-900 hover:bg-slate-800 shadow-lg transition-all active:scale-[0.98]"
          >
            Access Dashboard
          </Button>
        </form>
        
        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-xs text-slate-400 font-medium">
            Data is saved locally to this browser.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;