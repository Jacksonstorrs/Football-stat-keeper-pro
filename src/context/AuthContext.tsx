"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthContextProps {
  teamCode: string | null;
  login: (code: string) => void;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedCode = localStorage.getItem("teamCode");
    if (storedCode) {
      setTeamCode(storedCode);
    }
    setLoading(false);
  }, []);

  const login = (code: string) => {
    const trimmedCode = code.trim().toUpperCase();
    if (trimmedCode) {
      localStorage.setItem("teamCode", trimmedCode);
      setTeamCode(trimmedCode);
    }
  };

  const logout = () => {
    localStorage.removeItem("teamCode");
    setTeamCode(null);
  };

  return (
    <AuthContext.Provider value={{ teamCode, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};