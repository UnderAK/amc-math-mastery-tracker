import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Trophy, BarChart, BookOpen, Award, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RandomWelcome } from '@/components/RandomWelcome';
import { LeaderboardOverlay } from '@/components/LeaderboardOverlay';
import { CoinDisplay } from '@/components/CoinDisplay';
import { UserProfile } from '@/components/UserProfile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

export const Header = () => {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(sessionStorage.getItem('isGuest') === 'true');
  const { toast } = useToast();

  useEffect(() => {
    const updateSession = () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      });
      setIsGuest(sessionStorage.getItem('isGuest') === 'true');
    }

    updateSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // If user logs in or out, guest status should be cleared
      sessionStorage.removeItem('isGuest');
      setIsGuest(false);
    });

    // Listen for guest status changes
    window.addEventListener('storage', updateSession);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', updateSession);
    };
  }, []);

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

  const handleLogout = async () => {
    if (isGuest) {
      sessionStorage.removeItem('isGuest');
      setIsGuest(false);
      // Force a re-render of App.tsx to show Auth page
      window.location.href = '/';
    } else {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({ title: 'Logout failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Logged out successfully' });
        window.location.href = '/'; // Redirect to home to show Auth page
      }
    }
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
            <Button variant="outline" onClick={() => setIsLeaderboardOpen(true)} className="transition-transform hover:scale-105"><Award className="mr-2 h-4 w-4"/>Leaderboard</Button>
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
            <Link to="/">
              <Button>Login</Button>
            </Link>
          )}
          <Button onClick={toggleDarkMode} variant="ghost" size="icon" className="rounded-full" aria-label="Toggle theme">
            {isDarkMode ? <Sun /> : <Moon />}
          </Button>
        </div>
      </header>
      <LeaderboardOverlay isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
      <UserProfile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};
