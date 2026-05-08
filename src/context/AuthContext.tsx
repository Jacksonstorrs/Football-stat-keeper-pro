"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthContextProps {
  teamCode: string | null;
  isAdmin: boolean;
  login: (code: string, password?: string) => boolean;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [teamCode, setTeamCode] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedCode = localStorage.getItem("teamCode");
    const storedAdmin = localStorage.getItem("isAdmin") === "true";
    if (storedCode) {
      setTeamCode(storedCode);
      setIsAdmin(storedAdmin);
    }
    setLoading(false);
  }, []);

  const login = (code: string, password?: string) => {
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) return false;

    const adminCheck = password === "admin";
    
    localStorage.setItem("teamCode", trimmedCode);
    localStorage.setItem("isAdmin", adminCheck.toString());
    
    setTeamCode(trimmedCode);
    setIsAdmin(adminCheck);
    return true;
  };

  const logout = () => {
    localStorage.removeItem("teamCode");
    localStorage.removeItem("isAdmin");
    setTeamCode(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ teamCode, isAdmin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};