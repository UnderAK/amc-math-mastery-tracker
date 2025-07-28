import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Trophy, BarChart, BookOpen, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RandomWelcome } from '@/components/RandomWelcome';
import { LeaderboardOverlay } from '@/components/LeaderboardOverlay';
import { CoinDisplay } from '@/components/CoinDisplay';
import { useToast } from '@/hooks/use-toast';

export const Header = () => {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const shouldBeDark = localStorage.getItem('theme') === 'dark';
    setIsDarkMode(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    toast({ title: newMode ? '🌙 Dark mode on' : '☀️ Light mode on' });
  };

  return (
    <>
      <header className="glass p-4 sm:p-6 rounded-b-3xl shadow-xl flex flex-col items-center gap-4 text-center sticky top-0 z-40 w-full animate-slide-in-down">
        <div className="flex justify-between items-center w-full max-w-6xl mx-auto">
          <Link to="/" className="text-2xl md:text-3xl font-bold gradient-primary bg-clip-text text-transparent tracking-tight hover:opacity-80 transition-opacity">
            AMC Mastery
          </Link>
          <div className="flex items-center gap-2">
            <CoinDisplay />
            <Button onClick={toggleDarkMode} variant="ghost" size="icon" className="rounded-full" aria-label="Toggle theme">
              {isDarkMode ? <Sun /> : <Moon />}
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Link to="/test-entry">
            <Button className="transition-transform hover:scale-105"><Trophy className="mr-2 h-4 w-4"/>Enter Test</Button>
          </Link>
          <Link to="/analytics">
            <Button variant="outline" className="transition-transform hover:scale-105"><BarChart className="mr-2 h-4 w-4"/>Analytics</Button>
          </Link>
          <Link to="/history">
            <Button variant="outline" className="transition-transform hover:scale-105"><BookOpen className="mr-2 h-4 w-4"/>History</Button>
          </Link>
          <Button variant="outline" onClick={() => setIsLeaderboardOpen(true)} className="transition-transform hover:scale-105"><Award className="mr-2 h-4 w-4"/>Leaderboard</Button>
        </div>
      </header>
      <LeaderboardOverlay isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
    </>
  );
};
