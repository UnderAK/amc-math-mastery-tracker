import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/MainLayout";
import Index from "./pages/Index";
import Analytics from "./pages/Analytics";
import TestEntryPage from "./pages/TestEntryPage";
import History from "./pages/History";
import Leaderboard from "./pages/Leaderboard";
import PracticePage from "./pages/PracticePage";
import NotFound from "./pages/NotFound";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { KonamiToast } from "@/components/KonamiToast";
import { OfflineBanner } from "@/components/OfflineBanner";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useKonamiCode } from "@/hooks/use-konami-code";
import { useDataMigrator } from '@/hooks/useDataMigrator';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import Auth from './components/Auth';
import { Session } from '@supabase/supabase-js';
import { AuthProvider } from './contexts/AuthContext';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { ScoringModeProvider } from './context/ScoringModeContext';

const queryClient = new QueryClient();

const App = () => {
  const isOnline = useOnlineStatus();
  useKonamiCode();
  const { runMigration } = useDataMigrator();
  const [session, setSession] = useState<Session | null>(null);
  // Default to guest unless explicitly logged out
  const [isGuest, setIsGuest] = useState(sessionStorage.getItem('isGuest') !== 'false');

  useEffect(() => {
    const handleAuthChange = (session: Session | null) => {
      setSession(session);
      if (session) {
        // If a user logs in, they are no longer a guest.
        sessionStorage.setItem('isGuest', 'false');
        setIsGuest(false);
        runMigration();
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session);
    });

    return () => subscription.unsubscribe();
  }, [runMigration]);

  const handleContinueAsGuest = () => {
    sessionStorage.setItem('isGuest', 'true');
    setIsGuest(true);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      sessionStorage.setItem('isGuest', 'false');
      setIsGuest(false);
    }
  };

  if (!session && !isGuest) {
    return <Auth onContinueAsGuest={handleContinueAsGuest} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ScoringModeProvider>
        <AuthProvider value={{ session, isGuest, handleLogout }}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {!isOnline && <OfflineBanner />}
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/test-entry" element={<TestEntryPage />} />
                <Route path="/practice" element={<PracticePage />} />
                <Route path="/history" element={<History />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            {/* Konami code toast */}
            <KonamiToast />
            <VercelAnalytics />
            <SpeedInsights />
          </TooltipProvider>
        </AuthProvider>
      </ScoringModeProvider>
    </QueryClientProvider>
  );
};

export default App;
