import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/components/Login";
import Register from "@/components/Register";
import Dashboard from "@/pages/Dashboard";
import Teams from "@/pages/Teams";
import GameReport from "@/pages/GameReport";
import LiveGame from "@/pages/LiveGame";
import GamesList from "@/pages/GamesList";
import SeasonStats from "@/pages/SeasonStats";
import CoachAnalytics from "@/pages/CoachAnalytics";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/report" element={<GameReport />} />
              <Route path="/live/:gameId" element={<LiveGame />} />
              <Route path="/games" element={<GamesList />} />
              <Route path="/season-stats" element={<SeasonStats />} />
              <Route path="/coach-analytics" element={<CoachAnalytics />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;