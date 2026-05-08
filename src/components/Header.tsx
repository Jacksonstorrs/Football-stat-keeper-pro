"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { user, teamCode, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between bg-slate-900 text-white p-4">
      <Link to="/dashboard" className="text-xl font-bold">
        STAT KEEPER PRO
      </Link>
      {user && teamCode && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium bg-slate-800 px-3 py-1 rounded">
            Team: {teamCode}
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      )}
    </header>
  );
};

export default Header;