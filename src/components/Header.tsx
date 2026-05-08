"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";

const Header = () => {
  const { teamCode, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-slate-900 text-white border-b border-white/10">
      <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-400" />
          <span className="text-lg font-black tracking-tighter uppercase">Stat Keeper Pro</span>
        </Link>
        
        {teamCode && (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Team</span>
              <span className="text-xs font-bold text-blue-400">{teamCode}</span>
            </div>
            <div className="h-8 w-[1px] bg-white/10 mx-2" />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-slate-400 hover:text-white hover:bg-white/5 gap-2 font-bold uppercase text-[10px]"
            >
              <LogOut className="w-4 h-4" />
              Exit
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;