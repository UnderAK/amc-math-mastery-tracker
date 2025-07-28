import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Trophy, BarChart, BookOpen, Award, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeaderboardOverlay } from '@/components/LeaderboardOverlay';
import { CoinDisplay } from '@/components/CoinDisplay';
import { UserProfile } from '@/components/UserProfile';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const Header = () => {
  const { session, isGuest, handleLogout } = useAuth();
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDarkMode = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    localStorage.setItem('darkMode', newIsDarkMode.toString());
    document.documentElement.classList.toggle('dark', newIsDarkMode);
    toast({
      title: `Switched to ${newIsDarkMode ? 'Dark' : 'Light'} Mode`,
    });
  };

  return (
    <>
      <header className="glass p-4 sm:p-6 rounded-b-3xl shadow-xl flex items-center justify-between sticky top-0 z-40 w-full animate-slide-in-down">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-2xl md:text-3xl font-bold gradient-primary bg-clip-text text-transparent tracking-tight hover:opacity-80 transition-opacity">
            AMC Mastery
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-2">
          <Link to="/test-entry">
            <Button className="transition-transform hover:scale-105"><Trophy className="mr-2 h-4 w-4"/>Enter Test</Button>
          </Link>
          <Link to="/analytics">
            <Button variant="outline" className="transition-transform hover:scale-105"><BarChart className="mr-2 h-4 w-4"/>Analytics</Button>
          </Link>
          <Link to="/history">
            <Button variant="outline" className="transition-transform hover:scale-105"><BookOpen className="mr-2 h-4 w-4"/>History</Button>
          </Link>
          {(session || isGuest) && (
            <Link to="/leaderboard">
              <Button variant="outline" className="transition-transform hover:scale-105"><Award className="mr-2 h-4 w-4"/>Leaderboard</Button>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {(session || isGuest) ? (
            <>
              <CoinDisplay />
              <Button onClick={() => setIsProfileOpen(true)} variant="ghost" size="icon" className="rounded-full" aria-label="Profile">
                <User />
              </Button>
              <Button onClick={handleLogout} variant="outline">{isGuest ? 'Exit Guest' : 'Logout'}</Button>
            </>
          ) : (
            <Button onClick={handleLogout}>Login</Button>
          )}
          <Button onClick={toggleDarkMode} variant="ghost" size="icon" className="rounded-full" aria-label="Toggle theme">
            {isDarkMode ? <Sun /> : <Moon />}
          </Button>
        </div>
      </header>

      <UserProfile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};
