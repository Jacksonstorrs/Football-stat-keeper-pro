"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  teamCode: string | null;
  login: (code: string) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [teamCode, setTeamCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      // If logged in, try to get the team code from metadata or local storage
      const storedCode = localStorage.getItem("teamCode");
      if (storedCode) setTeamCode(storedCode);

      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (!session) {
        setTeamCode(null);
        localStorage.removeItem("teamCode");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = (code: string) => {
    const trimmedCode = code.trim().toUpperCase();
    if (trimmedCode) {
      localStorage.setItem("teamCode", trimmedCode);
      setTeamCode(trimmedCode);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("teamCode");
    setTeamCode(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, teamCode, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};