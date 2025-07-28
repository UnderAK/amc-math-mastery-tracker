import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  Trophy,
  TrendingUp,
  Settings,
  FileDown,
  FileUp,
  BarChart,
  Target,
  BookOpen,
  Award,
  Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Newly created components
import { QuickStats } from "@/components/QuickStats";
import { RandomWelcome } from "@/components/RandomWelcome";
import { FeatureCard } from '@/components/FeatureCard';

// Existing components
import { UserProfile } from "@/components/UserProfile";
import { LevelUpModal } from "@/components/LevelUpModal";
import { StreakCelebrationOverlay } from "@/components/StreakCelebrationOverlay";
import { DailyBonus } from "@/components/DailyBonus";
import { LeaderboardOverlay } from "@/components/LeaderboardOverlay";
import { Accordion } from "@/components/Accordion";





const Index = () => {
  const [showIntro, setShowIntro] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();



  // Show intro popup on first visit
  useEffect(() => {
    if (!localStorage.getItem("hasSeenIntro")) {
      setShowIntro(true);
    }
  }, []);

  const handleCloseIntro = () => {
    setShowIntro(false);
    localStorage.setItem('hasSeenIntro', 'true');
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
        window.dispatchEvent(new CustomEvent('dataUpdate')); // Notify components
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


          {/* Features Section */}
          <section className="py-12 px-4">
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Target className="w-8 h-8 text-primary" />} 
                title="Track Your Progress"
                description="Log your AMC test scores and see detailed performance analytics to identify strengths and weaknesses."
              />
              <FeatureCard 
                icon={<BookOpen className="w-8 h-8 text-primary" />} 
                title="Master Key Concepts"
                description="Practice problems by topic to build mastery in areas like Algebra, Geometry, and Number Theory."
              />
              <FeatureCard 
                icon={<Award className="w-8 h-8 text-primary" />} 
                title="Compete & Improve"
                description="Compare your progress on the leaderboard, earn coins, and unlock new avatars as you climb the ranks."
              />
            </div>
          </section>

          {/* --- Main Content --- */}
          <main className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Quick Stats */}
              <div className="glass p-6 rounded-lg">
                <QuickStats />
              </div>

              {/* Settings & Data */}
              <div className="glass p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-primary mb-1 flex items-center"><Settings className="mr-2"/>Settings & Data</h2>
                <p className="text-sm text-muted-foreground mb-4">Backup or restore your progress.</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={handleExport} variant="outline"><FileDown className="mr-2 h-4 w-4"/>Export Data</Button>
                  <Button onClick={() => document.getElementById('import-input')?.click()} variant="outline" disabled={importing}>
                    {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4"/>}
                    {importing ? 'Importing...' : 'Import Data'}
                  </Button>
                  <input type="file" id="import-input" accept=".json" onChange={handleImport} className="hidden" />
                </div>
              </div>
            </div>

            {/* How It Works & FAQ */}
            <div className="glass p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-primary mb-3 flex items-center"><BookOpen className="mr-2"/>How It Works & FAQ</h2>
              <div className="space-y-2">
                <Accordion title="How to use this app?">
                  <ol className="list-decimal list-inside text-muted-foreground space-y-1">
                    <li>Click <strong>Enter Test</strong> to log a new AMC score.</li>
                    <li>Fill in your score, test date, and answers.</li>
                    <li>Use the <strong>Analytics</strong> page to see your progress.</li>
                    <li>Use the <strong>Export/Import</strong> buttons to back up and restore your data.</li>
                  </ol>
                </Accordion>
                <Accordion title="How is my data saved?"><p className="text-muted-foreground">All your data is stored locally in your browser. It is not uploaded to any server, ensuring your data remains private. Use the export/import feature to back up or transfer your data between devices.</p></Accordion>
                <Accordion title="Can I use this on multiple devices?"><p className="text-muted-foreground">Yes, but you need to manually transfer your data. Since all data is stored locally, you can use the <strong>Export</strong> button on one device to save your progress to a file, and then use the <strong>Import</strong> button on another device to load it.</p></Accordion>
                <Accordion title="How are XP and Levels calculated?"><p className="text-muted-foreground">You earn XP for each test you complete, based on your score and other factors. Gaining XP increases your Level, unlocking new milestones. The goal is to make consistent practice rewarding!</p></Accordion>
              </div>
            </div>


          </main>
        </div>
      </div>

      {/* --- Overlays & Popups --- */}

      <DailyBonus />
      <StreakCelebrationOverlay />
      <LevelUpModal />

      {showIntro && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-background p-8 rounded-2xl shadow-2xl max-w-md text-center">
            <h2 className="text-2xl font-bold text-primary mb-3">Welcome to the AMC Tracker!</h2>
            <p className="text-muted-foreground mb-6">It looks like you're new here. Take a practice test to start your journey. Your progress is saved automatically in your browser.</p>
            <Button onClick={handleCloseIntro}>Let's Go!</Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Index;