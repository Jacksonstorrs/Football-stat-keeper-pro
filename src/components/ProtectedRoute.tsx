"use client";

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoute = () => {
  const { session, teamCode, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-pulse text-slate-400 font-black uppercase tracking-widest">Verifying Session...</div>
      </div>
    );
  }

  // If not logged in at all, go to login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but no team code, go to login (which will show the team code entry)
  if (!teamCode) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;