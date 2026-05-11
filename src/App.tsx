import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/components/Login";
import Dashboard from "@/pages/Dashboard";
import Index from "@/pages/Index";
import Teams from "@/pages/Teams";
import GameReport from "@/pages/GameReport";
import LiveGame from "@/pages/LiveGame";
import GamesList from "@/pages/GamesList";
import SeasonStats from "@/pages/SeasonStats";
import CoachAnalytics from "@/pages/CoachAnalytics";
import BroadcastSync from "@/pages/BroadcastSync";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/tracker" element={<Index />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/report" element={<GameReport />} />
                <Route path="/live/:gameId" element={<LiveGame />} />
                <Route path="/games" element={<GamesList />} />
                <Route path="/season-stats" element={<SeasonStats />} />
                <Route path="/coach-analytics" element={<CoachAnalytics />} />
                <Route path="/broadcast-sync" element={<BroadcastSync />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;