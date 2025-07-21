import { useState, useEffect } from "react";
import { Trophy, Target, TrendingUp, BookOpen, Award, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestEntryForm } from "@/components/TestEntryForm";
import { GamificationPanel } from "@/components/GamificationPanel";
import { StatsPanel } from "@/components/StatsPanel";
import { BadgesPanel } from "@/components/BadgesPanel";
import { TestHistoryTable } from "@/components/TestHistoryTable";
import { ScoreChart } from "@/components/ScoreChart";
import { QuestionAccuracyTable } from "@/components/QuestionAccuracyTable";
import { LeaderboardOverlay } from "@/components/LeaderboardOverlay";
import { LevelUpModal } from "@/components/LevelUpModal";
import { UserProfile } from "@/components/UserProfile";
import { DailyBonus } from "@/components/DailyBonus";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    // Default to light mode - only use dark mode if explicitly set
    const shouldBeDark = savedTheme === "dark";
    
    setIsDarkMode(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    
    toast({
      title: newMode ? "🌙 Dark mode enabled" : "☀️ Light mode enabled",
      description: "Theme preference saved",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <header className="glass p-6 sm:p-8 rounded-3xl shadow-xl relative">
          {/* User Profile - Top Right */}
          <div className="absolute top-4 right-4">
            <UserProfile />
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent tracking-tight">
              📚 AMC8/10/12 Tracker
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Track your progress, earn badges, and level up your math skills!
            </p>

            <div className="mt-4 flex justify-center gap-3 flex-wrap">
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleDarkMode}
                className="hover-scale"
              >
                {isDarkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                Toggle Theme
              </Button>
              
              <Button
                onClick={() => setIsLeaderboardOpen(true)}
                className="gradient-primary hover-bounce"
                size="sm"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <main className="space-y-6">
          {/* Top Row - 2 Equal Size Components */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-full">
              <GamificationPanel />
            </div>
            <div className="h-full">
              <StatsPanel />
            </div>
          </div>

          {/* Badges Row */}
          <div>
            <BadgesPanel />
          </div>

          {/* Test Entry Form - Main Action */}
          <div>
            <TestEntryForm />
          </div>

          {/* Test History - Recent Activity */}
          <div>
            <TestHistoryTable />
          </div>

          {/* Score Progress Chart - Analytics */}
          <div>
            <div className="glass p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Score Progress
              </h2>
              <ScoreChart />
            </div>
          </div>

          {/* Question Accuracy - Detailed Analytics */}
          <div>
            <QuestionAccuracyTable />
          </div>

          {/* Reset Data Button */}
          <div className="text-center">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm("Are you sure you want to reset all saved data?")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="hover-scale"
            >
              🔄 Reset All Data
            </Button>
          </div>
        </main>
      </div>

      {/* Overlays */}
      <DailyBonus />
      <LeaderboardOverlay
        isOpen={isLeaderboardOpen} 
        onClose={() => setIsLeaderboardOpen(false)} 
      />
      <LevelUpModal />
    </div>
  );
};

export default Index;