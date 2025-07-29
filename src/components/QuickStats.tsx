import { useState, useEffect } from "react";
import { useScoringMode } from '@/context/ScoringModeContext';
import { getCorrectCount, getTotalQuestions, getMaxPoints } from '@/lib/scoring';
import { BarChart, Target, Flame, Star } from 'lucide-react';

export const QuickStats = () => {
  const [stats, setStats] = useState({ tests: 0, avg: 0, streak: 0, xp: 0 });

  useEffect(() => {
    const updateStats = () => {
      const scores = JSON.parse(localStorage.getItem('scores') || '[]');
      const xp = parseInt(localStorage.getItem('xp') || '0', 10);
      const streak = parseInt(localStorage.getItem('streak') || '0', 10);
      const avg = scores.length > 0
        ? Math.round(scores.reduce((sum: number, s: { score: number }) => sum + (s.score || 0), 0) / scores.length)
        : 0;
      setStats({ tests: scores.length, avg, streak, xp });
    };

    updateStats();

    // Listen for the correct custom event to update stats
    window.addEventListener('dataUpdate', updateStats);

    return () => {
      window.removeEventListener('dataUpdate', updateStats);
    };
  }, []);

  const StatItem = ({ icon, value, label }: { icon: React.ReactNode, value: string | number, label: string }) => (
    <div className="group relative glass p-4 rounded-lg flex items-center space-x-4 transition-all duration-300 hover:bg-primary/10 hover:shadow-lg hover:-translate-y-1">
      <div className="bg-primary/10 p-3 rounded-full transition-colors duration-300 group-hover:bg-primary/20">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-primary transition-colors duration-300">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-primary flex items-center"><BarChart className="mr-2"/>Quick Stats</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatItem icon={<Target className="w-6 h-6 text-primary" />} value={stats.tests} label="Tests Taken" />
        <StatItem icon={<Star className="w-6 h-6 text-primary" />} value={stats.avg} label="Average Score" />
        <StatItem icon={<Flame className="w-6 h-6 text-primary" />} value={stats.streak} label="Current Streak" />
        <StatItem icon={<BarChart className="w-6 h-6 text-primary" />} value={stats.xp.toLocaleString()} label="Experience Points" />
      </div>
    </div>
  );
};
