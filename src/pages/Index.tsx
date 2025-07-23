import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Trophy, Target, TrendingUp, BookOpen, Award, Moon, Sun, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SummaryPanel } from "@/components/SummaryPanel";
import { LeaderboardOverlay } from "@/components/LeaderboardOverlay";
import { LevelUpModal } from "@/components/LevelUpModal";
import { StreakCelebrationOverlay } from "@/components/StreakCelebrationOverlay";
import { UserProfile } from "@/components/UserProfile";
import { DailyBonus } from "@/components/DailyBonus";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom"; // Import Link for navigation
import {
  FacebookShareButton, FacebookIcon,
  TwitterShareButton, TwitterIcon,
  LinkedinShareButton, LinkedinIcon,
  RedditShareButton, RedditIcon
} from 'react-share';

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

// --- Random Welcome Message Component ---
const welcomeMessages = [
  "Welcome, mathlete! Ready to conquer some AMC problems today?",
  "Track your AMC journey and unlock your math superpowers!",
  "Did you know: Consistency beats cramming. A little practice every day goes a long way!",
  "Welcome! Pro tip: Try the Konami code on this page. (👀)",
  "Math is the only place people buy 60 watermelons and nobody wonders why. Let's get solving!",
  "You found the secret message! (Or did you?)",
  "Welcome back! Remember: Every wrong answer is a step closer to mastery.",
  "Rumor has it, solving question 25 unlocks a hidden badge...",
  "If you can read this, you're already ahead of the curve!",
  "May the odds be ever in your favor. (Just kidding, it's all skill here!)"
];
const RandomWelcome = () => {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    setMsg(welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]);
  }, []);
  return (
    <h1 className="text-base text-primary/80 font-medium mt-3 mb-2 animate-fade-in">
      {msg}
    </h1>
  );
};

// --- Simple Accordion Component ---
const Accordion = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-2">
      <Button
        variant="outline"
        className="w-full justify-between text-left h-auto py-3 px-4"
        onClick={() => setOpen(!open)}
      >
        <h4 className="font-semibold text-primary">{title}</h4>
        <span className={`transform transition-transform ${open ? 'rotate-180' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
        </span>
      </Button>
      {open && <div className="p-4 bg-background/30 backdrop-blur-sm rounded-b-lg border-x border-b border-border">{children}</div>}
    </div>
  );
};

const KONAMI = [38,38,40,40,37,39,37,39,66,65];

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Konami code confetti
  useEffect(() => {
    let seq: number[] = [];
    const handler = (e: KeyboardEvent) => {
      seq.push(e.keyCode);
      if (seq.length > KONAMI.length) seq.shift();
      if (KONAMI.every((v, i) => seq[i] === v)) {
        confetti({
          particleCount: 200,
          spread: 120,
          origin: { y: 0.6 }
        });
        toast({ title: "Konami code unlocked! 🎉", description: "You found the secret!", variant: "default" });
        seq = [];
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toast]);

  // Show intro popup on first visit
  useEffect(() => {
    const scores = localStorage.getItem("scores");
    if (!scores) setShowIntro(true);
  }, []);

  // Import/export logic
  const handleExport = () => {
    const keys = ["scores","xp","streak","level","earnedBadges","profile","settings"];
    const data: Record<string, any> = {};
    keys.forEach(k => { const v = localStorage.getItem(k); if (v) data[k] = v; });
    const blob = new Blob([JSON.stringify(data,null,2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "amc-math-mastery-save.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Progress exported!", description: "Your data has been saved as a file." });
  };
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        Object.entries(json).forEach(([k,v]) => localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)));
        window.dispatchEvent(new CustomEvent('dataUpdate'));
        toast({ title: "Import successful!", description: "Your progress has been restored." });
      } catch {
        toast({ title: "Import failed", description: "Invalid file format.", variant: "destructive" });
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  // Theme effect (fix lint)
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
            <RandomWelcome />

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
                {isDarkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                Toggle Theme
              </Button>
              
              <Button
                onClick={() => setIsLeaderboardOpen(true)} 
                variant="secondary" className="hover-scale hover-glow"
                size="sm"
              >
                🏆 Leaderboard
              </Button>

               {/* Link to Analytics Page */}
               <Link to="/analytics">
                 <Button variant="secondary" size="sm" className="hover-scale hover-glow">
                   📊 Analytics
                 </Button>
               </Link>

                {/* Link to Test Entry Page */}
               <Link to="/test-entry">
                 <Button variant="secondary" size="sm" className="hover-scale hover-glow">
                    ✍️ Enter Test
                 </Button>
               </Link>

            </div>
          </div>
        </header>

        {/* Import/Export Buttons */}
        <div className="flex justify-center gap-2 mb-4">
          <Button variant="outline" onClick={handleExport}>
            Export Progress
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={importing}>
            {importing ? "Importing..." : "Import Progress"}
          </Button>
          <input type="file" accept="application/json" ref={fileInputRef} style={{ display: "none" }} onChange={handleImport} />
        </div>

        {/* Introduction Popup */}
        {showIntro && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 max-w-lg w-full shadow-xl relative animate-fade-in">
              <Button variant="ghost" size="icon" className="absolute top-3 right-3 text-xl font-bold text-zinc-400 hover:text-primary" onClick={() => { setShowIntro(false); localStorage.setItem('introSeen','1'); }}>&times;</Button>
              <h2 className="text-2xl font-bold mb-2 text-primary">Welcome to AMC Math Mastery Tracker!</h2>
              <div className="mb-4 text-muted-foreground">Track your AMC progress, analyze your strengths, and earn badges as you level up your math skills.</div>
              <ol className="space-y-3 mb-4">
                <li className="flex items-center gap-3">
                  <img src="/icons/192x192.png" alt="Test" className="w-10 h-10 rounded shadow" />
                  <span><b>Enter Tests:</b> Record your answers for AMC 8/10/12 and see instant results.</span>
                </li>
                <li className="flex items-center gap-3">
                  <img src="/icons/512x512.png" alt="Analytics" className="w-10 h-10 rounded shadow" />
                  <span><b>Analyze:</b> Use Analytics to see your progress by topic and question.</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-3xl">🏅</span>
                  <span><b>Earn Badges:</b> Achieve milestones and keep your practice streak alive!</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-3xl">📤</span>
                  <span><b>Export:</b> Save your progress and import it on any device.</span>
                </li>
              </ol>
              <Button className="w-full mt-2" onClick={() => { setShowIntro(false); localStorage.setItem('introSeen','1'); }}>Get Started</Button>
            </div>
          </div>
        )}


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
            <div className="flex items-center justify-center p-4">
              <button className="liquid-button group relative px-7 py-3 rounded-2xl font-semibold overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-transform duration-300 hover:scale-[1.03]" onClick={() => console.log('Explore Now button clicked!')}>
                <h5 className="relative z-10">Explore Now</h5>
                <span className="relative z-10">Explore Now</span>
                {/* Inner liquid shine */}
                <div className="liquid-shine"></div>
                {/* Glow ring */}
                <div className="liquid-glow"></div>
              </button>
            </div>
            <ol className="text-left list-decimal list-inside text-muted-foreground space-y-2">
              <li><b>Enter a Test:</b> Click <b>Enter Test</b> to start. Choose your AMC year and type, then fill in your answers for all 25 questions. Don't worry if you skip any—just leave them blank. (Hint: You can assign topics to each question for deeper analytics!)</li>
              <li><b>Grade Instantly:</b> Hit grade to see your score, which questions you got right or wrong, and your answer breakdown. You'll also see which topics you need to review most.</li>
              <li><b>Track Your Progress:</b> Every test you enter is saved automatically. Head to <b>Analytics</b> to view your performance by topic, see your improvement over time, and analyze which questions trip you up most often.</li>
              <li><b>Earn Rewards:</b> You'll earn XP for every test, and badges for achievements like streaks, high scores, and more. (Psst: Try to discover all the badges!)</li>
              <li><b>Climb the Leaderboard:</b> See how you rank against other users and challenge yourself to reach the top. Friendly competition makes practice more fun!</li>
              <li><b>Bonus:</b> Keep an eye out for special events and hidden features. Who knows what you might find? 🥚</li>
            </ol>
          </Accordion>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-2xl shadow-xl text-center hover-lift animate-slide-in-left">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="text-lg font-semibold text-primary mb-2">Earn Badges</h3>
              <p className="text-sm text-muted-foreground">
                Unlock achievements as you improve your math skills and maintain streaks.
              </p>
            </div>
            
            <div className="glass p-6 rounded-2xl shadow-xl text-center hover-lift animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-primary mb-2">Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                Detailed analytics show your performance by topic and over time.
              </p>
            </div>
            
            <div className="glass p-6 rounded-2xl shadow-xl text-center hover-lift animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl mb-3">⚡</div>
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
                <p className="text-muted-foreground">To enter a test, simply click the <b>Enter Test</b> button at the top of the homepage or in the sidebar. You'll be prompted to select the AMC type (8, 10, or 12) and the year. Enter your answers for each question—leave any blank if you skipped them. When you're done, click <b>Grade</b> to instantly see your results and save your progress. You can also assign topics to each question for richer analytics. Don't worry, you can always edit your answers or topics later!</p>
              </Accordion>
              <Accordion title="Can I see my progress by topic?">
                <p className="text-muted-foreground">Absolutely! The <b>Analytics</b> page is your dashboard for deep insights. Here, you can view your accuracy by topic (like Algebra, Geometry, etc.), track how your scores change over time, and even see which questions or topics are your strongest—and your trickiest. Use these insights to focus your study sessions and maximize your improvement. Try clicking on different topics or questions for more details!</p>
              </Accordion>
              <Accordion title="What are badges and XP?">
                <p className="text-muted-foreground">Badges are special achievements you earn for hitting milestones, such as completing your first test, maintaining a streak, or achieving a high score. Some badges are easy to get, while others are hidden or require a bit of detective work (hint: try something unusual!). XP (Experience Points) are awarded for every test you complete. As you accumulate XP, you'll level up—each level unlocks new rewards and sometimes even surprises. Check your profile to see your badge and XP progress!</p>
              </Accordion>
              <Accordion title="How do I reset my data?">
                <p className="text-muted-foreground">If you ever want a fresh start, go to the <b>Analytics</b> page and click the <b>Reset All Data</b> button at the top right. This will erase all your test records, XP, streaks, badges, and progress—so be sure you really want to! After resetting, the app will behave as if you're a new user. (Pro tip: If you reset three times in a row, you might discover something special...)</p>
              </Accordion>
              <Accordion title="How do coins and the shop work?">
                <p className="text-muted-foreground">You earn coins by completing tests. Coins can be spent in the avatar shop to unlock new profile pictures, or to change your username. Your coin balance and transaction history are shown in your profile. Spend wisely!</p>
              </Accordion>
              <Accordion title="How do I unlock avatars?">
                <p className="text-muted-foreground">Visit your profile and open the avatar shop. Each avatar has a coin price. Click on a locked avatar to purchase it using your coins. Once unlocked, you can select it as your profile picture anytime!</p>
              </Accordion>
              <Accordion title="Can I edit my username?">
                <p className="text-muted-foreground">Yes! In your profile, click the edit icon next to your username. Changing your username costs coins, so make sure you have enough. Confirm your new name and enjoy your unique identity!</p>
              </Accordion>
              <Accordion title="How do I export/import my progress?">
                <p className="text-muted-foreground">Use the Export and Import buttons on the homepage. Export saves your progress to a file, which you can later import to restore your data on any device. Your progress is never uploaded to a server—it's all local and private.</p>
              </Accordion>
              <Accordion title="Is my data private and secure?">
                <p className="text-muted-foreground">Yes! All your progress, coins, and settings are stored locally in your browser. Nothing is uploaded or shared unless you export your data yourself. You control your privacy.</p>
              </Accordion>
              <Accordion title="What is the Konami code?">
                <p className="text-muted-foreground">The Konami code is a classic gaming easter egg: Up, Up, Down, Down, Left, Right, Left, Right, B, A. Try entering it on the homepage for a fun surprise!</p>
              </Accordion>
              <Accordion title="Who made this app?">
                <p className="text-muted-foreground">This app was created by Aarav and contributors, inspired by a love of math competitions. If you have feedback or ideas, check the GitHub repository for ways to contribute or get in touch!</p>
              </Accordion>
            </div>
          </Accordion>

          {/* Social Share Section */}
          <div className="glass p-6 rounded-2xl shadow-xl text-center hover-lift animate-slide-in-up">
            <h2 className="text-xl font-semibold text-primary mb-3">Share the Love!</h2>
            <p className="text-muted-foreground mb-4">If you find this tracker helpful, share it with your friends and fellow mathletes!</p>
            <div className="flex justify-center gap-4">
              <TwitterShareButton
                url={"https://amc-math-mastery-tracker.vercel.app"}
                title={"Check out this AMC Math Mastery Tracker!"}
                hashtags={["AMC", "MathCompetition"]}
              >
                <TwitterIcon size={40} round />
              </TwitterShareButton>
              <FacebookShareButton
                url={"https://amc-math-mastery-tracker.vercel.app"}
                hashtag={"#MathCompetition"}
              >
                <FacebookIcon size={40} round />
              </FacebookShareButton>
              <LinkedinShareButton
                url={"https://amc-math-mastery-tracker.vercel.app"}
                title={"AMC Math Mastery Tracker"}
                summary={"A free tool to track and analyze your performance on past American Mathematics Competitions (AMC)."}
                source={"AMC Math Mastery Tracker"}
              >
                <LinkedinIcon size={40} round />
              </LinkedinShareButton>
              <RedditShareButton
                url={"https://amc-math-mastery-tracker.vercel.app"}
                title={"A Great Tool for AMC Prep - Math Mastery Tracker"}
              >
                <RedditIcon size={40} round />
              </RedditShareButton>
            </div>
          </div>

        </main>

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
      <StreakCelebrationOverlay />
      <LevelUpModal />

    </div>
  );
};

export default Index;