import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Analytics from "./pages/Analytics";
import TestEntryPage from "./pages/TestEntryPage";
import History from "./pages/History";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { KonamiToast } from "@/components/KonamiToast";
import { OfflineBanner } from "@/components/OfflineBanner";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useKonamiCode } from "@/hooks/use-konami-code";

const queryClient = new QueryClient();

const App = () => {
  const isOnline = useOnlineStatus();
  useKonamiCode();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {!isOnline && <OfflineBanner />}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/test-entry" element={<TestEntryPage />} />
            <Route path="/history" element={<History />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        {/* Konami code toast */}
        <KonamiToast />
        <VercelAnalytics />
      </TooltipProvider>
    </QueryClientProvider>
  );
};



export default App;
