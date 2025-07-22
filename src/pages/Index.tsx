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

// --- Quick Stats Component ---
const QuickStats = () => {
  const [stats, setStats] = useState({ tests: 0, avg: 0, streak: 0, xp: 0 });
  useEffect(() => {
    const scores = JSON.parse(localStorage.getItem("scores") || "[]");
    const xp = Number(localStorage.getItem("xp") || 0);
    const streak = Number(localStorage.getItem("streak") || 0);
    let avg = 0;
    if (scores.length) {
      avg = Math.round(scores.reduce((sum, s) => sum + (s.score || 0), 0) / scores.length);
    }
    setStats({ tests: scores.length, avg, streak, xp });
  }, []);
  return (
    <div className="glass p-4 rounded-2xl shadow text-center mb-4 animate-float">
      <h3 className="text-lg font-semibold text-primary mb-2">Your Quick Stats</h3>
      <div className="flex flex-wrap justify-center gap-6 text-sm">
        <div><span className="font-bold text-xl">{stats.tests}</span><br />Tests Taken</div>
        <div><span className="font-bold text-xl">{stats.avg}</span><br />Avg Score</div>
        <div><span className="font-bold text-xl">{stats.streak}</span><br />Current Streak</div>
        <div><span className="font-bold text-xl">{stats.xp}</span><br />XP</div>
      </div>
    </div>
  );
};

// --- Recent Achievements Component ---
const RecentAchievements = () => {
  const [badges, setBadges] = useState<string[]>([]);
  useEffect(() => {
    const earned = JSON.parse(localStorage.getItem("earnedBadges") || "[]");
    setBadges(earned.slice(-3).reverse()); // Show up to 3 most recent
  }, []);
  if (!badges.length) return null;
  return (
    <div className="glass p-4 rounded-2xl shadow-xl text-center animate-float mb-4">
      <h3 className="text-lg font-semibold text-primary mb-2">Recent Achievements</h3>
      <div className="flex flex-wrap justify-center gap-3">
        {badges.map((b, i) => (
          <span key={i} className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-200 px-3 py-1 rounded-full font-semibold shadow">
            {b}
          </span>
        ))}
      </div>
    </div>
  );
};

// --- Simple Accordion Component ---
const Accordion = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-lg mb-2 bg-white dark:bg-zinc-900/60">
      <button
        className="w-full px-4 py-2 flex justify-between items-center font-semibold text-left text-primary focus:outline-none focus:ring hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        {title}
        <span className={"ml-2 transition-transform " + (open ? "rotate-90" : "rotate-0")}>▶</span>
      </button>
      {open && <div className="px-4 pb-4 pt-2 animate-fade-in">{children}</div>}
    </div>
  );
};

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
          {/* About Section */}
          <div className="glass p-6 rounded-2xl shadow-xl text-center hover-lift animate-slide-in-up">
            <h2 className="text-xl font-semibold text-primary mb-2">What is AMC? Why Track?</h2>
            <p className="text-muted-foreground mb-3">
              The AMC 8, 10, and 12 are prestigious national math competitions that challenge students to solve interesting problems and grow their mathematical thinking. Tracking your AMC practice helps you identify strengths, target weaknesses, and see your improvement over time—making your prep smarter and more fun!
            </p>
          </div>

          {/* How It Works Section (Dropdown) */}
          <Accordion title="How It Works">
            <ol className="text-left list-decimal list-inside text-muted-foreground space-y-1">
              <li>Click <b>Enter Test</b> to fill in your answers for an AMC test.</li>
              <li>Grade your test to instantly see your score and which questions you missed.</li>
              <li>Assign topics to each question for deeper analytics.</li>
              <li>Visit <b>Analytics</b> to see your progress by topic, question, and over time.</li>
              <li>Earn badges and XP for milestones and streaks!</li>
            </ol>
          </Accordion>

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

          {/* Quick Stats Section */}
          <QuickStats />

          {/* Achievements Section */}
          <RecentAchievements />

          {/* FAQ Section (Dropdown) */}
          <Accordion title="Frequently Asked Questions">
            <div className="text-left space-y-4">
              <Accordion title="How do I enter a test?">
                <p className="text-muted-foreground">Click "Enter Test" above or on the sidebar, then fill in your answers and click grade.</p>
              </Accordion>
              <Accordion title="Can I see my progress by topic?">
                <p className="text-muted-foreground">Yes! The Analytics page breaks down your performance by topic and question.</p>
              </Accordion>
              <Accordion title="What are badges and XP?">
                <p className="text-muted-foreground">Badges are earned for milestones and streaks. XP is awarded for every test and helps you level up!</p>
              </Accordion>
              <Accordion title="How do I reset my data?">
                <p className="text-muted-foreground">Visit the Analytics page and click "Reset All Data" at the top right.</p>
              </Accordion>
            </div>
          </Accordion>

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