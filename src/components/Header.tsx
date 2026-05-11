"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Shield, LayoutDashboard, Radio } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const Header = () => {
  const { teamCode, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tighter uppercase text-foreground">Stat Keeper Pro</span>
          </Link>
          
          {teamCode && (
            <nav className="hidden md:flex items-center gap-1">
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-wider gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/broadcast-sync">
                <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-wider gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <Radio className="w-4 h-4" />
                  Broadcast
                </Button>
              </Link>
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {teamCode && (
            <>
              <div className="h-8 w-[1px] bg-border mx-2" />
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Session</span>
                <span className="text-xs font-bold text-foreground">{teamCode}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2 font-bold uppercase text-[10px]"
              >
                <LogOut className="w-4 h-4" />
                Exit
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;