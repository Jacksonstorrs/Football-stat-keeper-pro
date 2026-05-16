import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { BroadcastProvider } from "@/context/BroadcastContext";
import { SyncProvider } from "@/context/SyncContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/components/Login";
import Dashboard from "@/pages/Dashboard";
import Index from "@/pages/Index";
import Teams from "@/pages/Teams";
import GameReport from "@/pages/GameReport";
import LiveView from "@/pages/LiveView";
import GamesList from "@/pages/GamesList";
import SeasonStats from "@/pages/SeasonStats";
import CoachAnalytics from "@/pages/CoachAnalytics";
import BroadcastSync from "@/pages/BroadcastSync";
import PlayerProfile from "@/pages/PlayerProfile";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <AuthProvider>
            <SyncProvider>
              <BroadcastProvider>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/live/:teamCode" element={<LiveView />} />
                  
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/tracker" element={<Index />} />
                    <Route path="/teams" element={<Teams />} />
                    <Route path="/report" element={<GameReport />} />
                    <Route path="/games" element={<GamesList />} />
                    <Route path="/season-stats" element={<SeasonStats />} />
                    <Route path="/player/:playerId" element={<PlayerProfile />} />
                    <Route path="/coach-analytics" element={<CoachAnalytics />} />
                    <Route path="/broadcast-sync" element={<BroadcastSync />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BroadcastProvider>
            </SyncProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;