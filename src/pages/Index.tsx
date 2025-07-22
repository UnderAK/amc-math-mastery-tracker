import { useState, useEffect } from "react";
import { Trophy, Target, TrendingUp, BookOpen, Award, Moon, Sun, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SummaryPanel } from "@/components/SummaryPanel";
import { LeaderboardOverlay } from "@/components/LeaderboardOverlay";
import { LevelUpModal } from "@/components/LevelUpModal";
import { UserProfile } from "@/components/UserProfile";
import { DailyBonus } from "@/components/DailyBonus";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom"; // Import Link for navigation

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

  const handleResetData = () => {
      const confirmed = confirm("Are you sure you want to reset all your data? This action cannot be undone.");
      if (confirmed) {
          localStorage.removeItem('scores');
          localStorage.removeItem('xp');
          localStorage.removeItem('level'); // Assuming level is also stored
          localStorage.removeItem('streak');
          localStorage.removeItem('lastPracticeDate');
          localStorage.removeItem('dailyBonusClaimed'); // Assuming daily bonus state is stored

          // Dispatch a custom event to notify other components to update
          window.dispatchEvent(new CustomEvent('dataUpdate'));
          window.dispatchEvent(new CustomEvent('levelUp')); // Also trigger level update

          toast({
              title: "Data Reset",
              description: "All your data has been cleared.",
              variant: "default"
          });
      }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <header className="glass p-6 sm:p-8 rounded-3xl shadow-xl relative hover-lift animate-slide-in-left">
          {/* User Profile - Top Right */}
          <div className="absolute top-4 right-4">
            <UserProfile />
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent tracking-tight animate-float">
              📚 AMC8/10/12 Tracker
            </h1>
            <p className="text-sm text-muted-foreground mt-2 animate-slide-in-right">
              Track your progress, earn badges, and level up your math skills!
            </p>

            <div className="mt-4 flex justify-center gap-3 flex-wrap">
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleDarkMode}
                className="hover-scale hover-glow"
              >
                {isDarkMode ? <Sun className="w-4 h-4 mr-2 animate-wiggle" /> : <Moon className="w-4 h-4 mr-2 animate-wiggle" />}
                Toggle Theme
              </Button>
              
              <Button
                onClick={() => setIsLeaderboardOpen(true)}
                className="gradient-primary hover-bounce animate-pulse-glow"
                size="sm"
              >
                <Trophy className="w-4 h-4 mr-2 animate-float" />
                Leaderboard
              </Button>

               {/* Link to Analytics Page */}
               <Link to="/analytics">
                 <Button variant="secondary" size="sm" className="hover-scale hover-glow">
                   📊 Analytics
                 </Button>
               </Link>

                {/* Link to Test Entry Page */}
               <Link to="/test-entry">
                 <Button variant="secondary" size="sm" className="hover-scale hover-glow animate-pulse-glow">
                    ✍️ Enter Test
                 </Button>
               </Link>

            </div>
          </div>
        </header>

        {/* Homepage Content */}
        <main className="space-y-6">
          <div className="glass p-6 rounded-2xl shadow-xl text-center hover-lift animate-slide-in-right">
            <h2 className="text-2xl font-semibold text-primary mb-4 animate-float">Welcome to the AMC Tracker!</h2>
            <p className="text-muted-foreground mb-6">
              Use this tool to track your progress on AMC 8, AMC 10, and AMC 12 tests.
              Enter your test scores, analyze your performance by topic, earn badges, and see how you rank on the leaderboard!
            </p>
            <Link to="/test-entry">
              <Button size="lg" className="gradient-primary hover-bounce hover-glow animate-pulse-glow">
                Get Started: Enter a Test Score
              </Button>
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-2xl shadow-xl text-center hover-lift animate-slide-in-left">
              <div className="text-4xl mb-3 animate-float">🏆</div>
              <h3 className="text-lg font-semibold text-primary mb-2">Earn Badges</h3>
              <p className="text-sm text-muted-foreground">
                Unlock achievements as you improve your math skills and maintain streaks.
              </p>
            </div>
            
            <div className="glass p-6 rounded-2xl shadow-xl text-center hover-lift animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl mb-3 animate-float" style={{ animationDelay: '0.5s' }}>📊</div>
              <h3 className="text-lg font-semibold text-primary mb-2">Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                Detailed analytics show your performance by topic and over time.
              </p>
            </div>
            
            <div className="glass p-6 rounded-2xl shadow-xl text-center hover-lift animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl mb-3 animate-float" style={{ animationDelay: '1s' }}>⚡</div>
              <h3 className="text-lg font-semibold text-primary mb-2">Level Up</h3>
              <p className="text-sm text-muted-foreground">
                Gain XP for every test and unlock new levels with special rewards.
              </p>
            </div>
          </div>

        </main>

        {/* Reset Data Button - Moved to Analytics Page */}
        {/* <div className="flex justify-center mt-10">
            <Button variant="destructive" onClick={handleResetData}>
                <AlertCircle className="w-4 h-4 mr-2" />
                Reset All Data
            </Button>
        </div> */}

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