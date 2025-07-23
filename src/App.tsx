import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Analytics from "./pages/Analytics";
import TestEntryPage from "./pages/TestEntryPage"; // Import TestEntryPage
import NotFound from "./pages/NotFound";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";

const queryClient = new QueryClient();

import confetti from "canvas-confetti";
import React, { useEffect, useState } from "react";

const OfflineBanner = () => {
  const [show, setShow] = useState(true);
  if (!show) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1000 }}>
      <div className="bg-yellow-300 text-yellow-900 py-2 px-4 text-center font-semibold shadow-md flex items-center justify-center gap-2">
        <span role="img" aria-label="offline">📶❌</span>
        You are offline. Most features work, but some (like leaderboard) require internet.
        <Button variant="outline" size="sm" className="ml-4 text-xs font-bold" onClick={() => setShow(false)}>Dismiss</Button>
      </div>
    </div>
  );
};

const KONAMI_CODE = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a"
];

const App = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [konamiIdx, setKonamiIdx] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Konami code easter egg
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === KONAMI_CODE[konamiIdx]) {
        setKonamiIdx((idx) => idx + 1);
        if (konamiIdx + 1 === KONAMI_CODE.length) {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 }
          });
          // Show a toast or alert
          window.dispatchEvent(new CustomEvent("konamiEasterEgg"));
          setKonamiIdx(0);
        }
      } else {
        setKonamiIdx(e.key === KONAMI_CODE[0] ? 1 : 0);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [konamiIdx]);

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

// Konami toast component
const KonamiToast = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const handler = () => {
      setShow(true);
      setTimeout(() => setShow(false), 3500);
    };
    window.addEventListener("konamiEasterEgg", handler);
    return () => window.removeEventListener("konamiEasterEgg", handler);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] bg-gradient-to-r from-yellow-300 to-pink-300 px-6 py-3 rounded-xl shadow-lg border-2 border-yellow-500 text-lg font-bold flex items-center gap-2 animate-bounce">
      🥚✨ Konami code unlocked! Enjoy the magic!
    </div>
  );
};

export default App;
