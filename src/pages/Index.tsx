import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  Sun,
  Moon,
  Trophy,
  TrendingUp,
  Settings,
  FileDown,
  FileUp,
  BarChart
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Newly created components
import { QuickStats } from "@/components/QuickStats";
import { RandomWelcome } from "@/components/RandomWelcome";

// Existing components
import { UserProfile } from "@/components/UserProfile";
import { LevelUpModal } from "@/components/LevelUpModal";
import { StreakCelebrationOverlay } from "@/components/StreakCelebrationOverlay";
import { DailyBonus } from "@/components/DailyBonus";
import { LeaderboardOverlay } from "@/components/LeaderboardOverlay";

// --- Simple Accordion Component for FAQ ---
const Accordion = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left py-4 px-2 flex justify-between items-center hover:bg-muted/50 transition-colors"
      >
        <span className="font-semibold">{title}</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && <div className="p-4 pt-0 text-muted-foreground">{children}</div>}
    </div>
  );
};

const KONAMI = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

const Index = () => {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Konami code effect
  useEffect(() => {
    let seq: number[] = [];
    const handler = (e: KeyboardEvent) => {
      seq.push(e.keyCode);
      if (seq.length > KONAMI.length) seq.shift();
      if (KONAMI.every((v, i) => seq[i] === v)) {
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } });
        toast({ title: "Konami code unlocked! 🎉", description: "You found the secret!" });
        seq = [];
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toast]);

  // Show intro popup on first visit
  useEffect(() => {
    if (!localStorage.getItem("scores")) setShowIntro(true);
  }, []);

  // Handle theme changes
  useEffect(() => {
    const shouldBeDark = localStorage.getItem("theme") === "dark";
    setIsDarkMode(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    toast({ title: newMode ? "🌙 Dark mode on" : "☀️ Light mode on" });
  };

  const handleExport = () => {
    const keys = ["scores", "xp", "streak", "level", "earnedBadges", "profile", "settings"];
    const data: Record<string, any> = {};
    keys.forEach(k => { const v = localStorage.getItem(k); if (v) data[k] = v; });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "amc-math-mastery-save.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Progress Exported!", description: "Your data has been saved." });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        Object.entries(json).forEach(([k, v]) => localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)));
        window.dispatchEvent(new CustomEvent('storageUpdated')); // Notify components
        toast({ title: "Import Successful!", description: "Your progress is restored." });
      } catch {
        toast({ title: "Import Failed", description: "Invalid file format.", variant: "destructive" });
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* --- Header --- */}
          <header className="glass p-6 rounded-3xl shadow-xl relative hover-lift animate-slide-in-left">
            <div className="absolute top-4 right-4">
              <UserProfile />
            </div>
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold gradient-primary bg-clip-text text-transparent tracking-tight animate-float">
                AMC Mastery Tracker
              </h1>
              <RandomWelcome />
              <div className="mt-4 flex justify-center items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsLeaderboardOpen(true)}><TrendingUp className="w-4 h-4 mr-1"/>Leaderboard</Button>
                <Button asChild variant="ghost" size="sm"><Link to="/analytics"><BarChart className="w-4 h-4 mr-1"/>Analytics</Link></Button>
                <Button asChild variant="ghost" size="sm"><Link to="/test-entry"><Trophy className="w-4 h-4 mr-1"/>Enter Test</Link></Button>
                <Button onClick={toggleDarkMode} variant="ghost" size="icon"><span className="sr-only">Toggle Theme</span>{isDarkMode ? <Sun /> : <Moon />}</Button>
              </div>
            </div>
          </header>

          {/* --- Main Content --- */}
          <main className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <QuickStats />
              <div className="glass p-6 rounded-2xl shadow-xl hover-lift animate-slide-in-up">
                <h2 className="text-xl font-semibold text-primary mb-3 flex items-center"><Settings className="mr-2"/>Settings & Data</h2>
                <p className="text-sm text-muted-foreground mb-4">Save or load your progress.</p>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Button onClick={handleExport} variant="outline"><FileDown className="w-4 h-4 mr-2" />Export</Button>
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" disabled={importing}><FileUp className="w-4 h-4 mr-2" />{importing ? "Importing..." : "Import"}</Button>
                  <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Accordion title="How to Use">
                <div className="text-muted-foreground space-y-2">
                  <p>1. Click <strong>'Enter Test'</strong> to log a new practice test score.</p>
                  <p>2. View your progress and stats on the <strong>'Analytics'</strong> page.</p>
                  <p>3. Check the <strong>'Leaderboard'</strong> to see how you stack up (coming soon!).</p>
                  <p>4. Use the <strong>Export/Import</strong> buttons to back up and restore your data.</p>
                </div>
              </Accordion>
              <Accordion title="Frequently Asked Questions (FAQ)">
                <div className="space-y-4">
                  <Accordion title="What is this app for?"><p className="text-muted-foreground">This app helps you track your scores on past American Mathematics Competitions (AMC 10/12). By recording your performance, you can analyze your strengths and weaknesses, see your progress over time, and stay motivated on your journey to math mastery.</p></Accordion>
                  <Accordion title="How is my data saved?"><p className="text-muted-foreground">All your data is stored locally in your browser. It is not uploaded to any server, ensuring your data remains private. Use the export/import feature to back up or transfer your data between devices.</p></Accordion>
                  <Accordion title="How are XP and Levels calculated?"><p className="text-muted-foreground">You earn XP for each test you complete, based on your score and other factors. Gaining XP increases your Level, unlocking new milestones. The goal is to make consistent practice rewarding!</p></Accordion>
                  <Accordion title="Can I use this on multiple devices?"><p className="text-muted-foreground">Yes, but you need to manually transfer your data. Since all data is stored locally, you can use the <strong>Export</strong> button on one device to save your progress to a file, and then use the <strong>Import</strong> button on another device to load it.</p></Accordion>
                </div>
              </Accordion>
            </div>
          </main>
        </div>
      </div>

      {/* --- Overlays & Popups --- */}
      <LeaderboardOverlay isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
      <DailyBonus />
      <StreakCelebrationOverlay />
      <LevelUpModal />

      {showIntro && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-background p-8 rounded-2xl shadow-2xl max-w-md text-center">
            <h2 className="text-2xl font-bold text-primary mb-3">Welcome to the AMC Tracker!</h2>
            <p className="text-muted-foreground mb-6">It looks like you're new here. Take a practice test to start your journey. Your progress is saved automatically in your browser.</p>
            <Button onClick={() => setShowIntro(false)}>Let's Go!</Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Index;