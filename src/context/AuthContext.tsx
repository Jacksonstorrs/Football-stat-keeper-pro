"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface AuthContextProps {
  user: any | null;
  loading: boolean;
  teamCode: string | null;
  signIn: (email: string, password: string, teamCode: string) => Promise<void>;
  signUp: (email: string, password: string, teamCode: string, teamName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamCode, setTeamCode] = useState<string | null>(null);

  // Listen to auth changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          const storedCode = localStorage.getItem("teamCode");
          if (storedCode) setTeamCode(storedCode);
        } else {
          setTeamCode(null);
          localStorage.removeItem("teamCode");
        }
      }
    );
    // Initial check
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        const storedCode = localStorage.getItem("teamCode");
        if (storedCode) setTeamCode(storedCode);
      }
    })();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string, code: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // Verify team code exists
    const { data, error: teamErr } = await supabase
      .from("teams")
      .select("code")
      .eq("code", code)
      .single();

    if (teamErr || !data) {
      await supabase.auth.signOut();
      throw new Error("Invalid team code");
    }

    localStorage.setItem("teamCode", code);
    setTeamCode(code);
  };

  const signUp = async (
    email: string,
    password: string,
    code: string,
    teamName: string
  ) => {
    // Create team if it doesn't exist
    const { data: existing, error: existingErr } = await supabase
      .from("teams")
      .select("code")
      .eq("code", code)
      .single();

    if (!existing && !existingErr) {
      // Team already exists – reject duplicate code
      throw new Error("Team code already taken");
    }

    // Insert new team
    const { error: insertErr } = await supabase
      .from("teams")
      .insert([{ code, name: teamName }]);

    if (insertErr) throw insertErr;

    // Register user
    const { error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpErr) throw signUpErr;

    // Auto‑login after sign‑up
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInErr) throw signInErr;

    localStorage.setItem("teamCode", code);
    setTeamCode(code);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("teamCode");
    setTeamCode(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, teamCode, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};