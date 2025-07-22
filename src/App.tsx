import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Analytics from "./pages/Analytics";
import TestEntryPage from "./pages/TestEntryPage"; // Import TestEntryPage
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

import React, { useEffect, useState } from "react";

const OfflineBanner = () => {
  const [show, setShow] = useState(true);
  if (!show) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1000 }}>
      <div className="bg-yellow-300 text-yellow-900 py-2 px-4 text-center font-semibold shadow-md flex items-center justify-center gap-2">
        <span role="img" aria-label="offline">📶❌</span>
        You are offline. Most features work, but some (like leaderboard) require internet.
        <button className="ml-4 bg-yellow-400 px-2 py-1 rounded text-xs font-bold" onClick={() => setShow(false)}>Dismiss</button>
      </div>
    </div>
  );
};

const App = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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
            <Route path="/test-entry" element={<TestEntryPage />} /> {/* Add route for TestEntryPage */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
