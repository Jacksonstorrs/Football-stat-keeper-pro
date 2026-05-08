import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase, reconnectSupabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";
import { GameState, Player, Play, Drive } from "@/types/football";

const Dashboard = () => {
  const { user, teamCode } = useAuth();
  const navigate = useNavigate();

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);

  // Load game data on mount
  useEffect(() => {
    if (!teamCode) {
      setLoading(false);
      return;
    }

    const loadGame = async () => {
      const { data, error } = await supabase
        .from("game_data")
        .select("data")
        .eq("team_code", teamCode)
        .single();

      if (error) {
        showError("Failed to load game data");
        console.error(error);
      } else if (data) {
        setGameState(data.data);
      }
      setLoading(false);
    };

    loadGame();

    // Real‑time subscription
    const channel = supabase
      .channel(`team:${teamCode}:game`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "game_data" },
        (payload) => {
          if (payload.new?.data) {
            setGameState(payload.new.data);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamCode]);

  // Ensure Supabase client is reinitialized on component mount
  useEffect(() => {
    reconnectSupabase();
  }, []);

  /* ... rest of component (UI, handlers, etc.) ... */

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      {/* Dashboard UI goes here */}
    </div>
  );
};

export default Dashboard;