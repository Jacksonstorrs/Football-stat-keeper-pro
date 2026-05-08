"use client";

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoute = () => {
  const { teamCode, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400 font-black uppercase tracking-widest">Loading Session...</div>
      </div>
    );
  }

  return teamCode ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;