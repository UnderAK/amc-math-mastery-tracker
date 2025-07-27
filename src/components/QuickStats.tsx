import { useState, useEffect } from "react";
import { BarChart, Target, Flame, Star } from 'lucide-react';

export const QuickStats = () => {
  const [stats, setStats] = useState({ tests: 0, avg: 0, streak: 0, xp: 0 });

  useEffect(() => {
    // Function to update stats from localStorage
    const updateStats = () => {
      const scores = JSON.parse(localStorage.getItem("scores") || "[]");
      const xp = Number(localStorage.getItem("xp") || 0);
      const streak = Number(localStorage.getItem("streak") || 0);
      let avg = 0;
      if (scores.length) {
        avg = Math.round(scores.reduce((sum, s) => sum + (s.score || 0), 0) / scores.length);
      }
      setStats({ tests: scores.length, avg, streak, xp });
    };

    updateStats();

    // Listen for custom event to update stats
    window.addEventListener('storageUpdated', updateStats);

    // Cleanup listener
    return () => {
      window.removeEventListener('storageUpdated', updateStats);
    };
  }, []);

  const StatItem = ({ icon, value, label }: { icon: React.ReactNode, value: number, label: string }) => (
    <div className="glass p-3 rounded-lg flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-primary/10 hover:shadow-md cursor-pointer">
      {icon}
      <span className="font-bold text-2xl text-primary mt-1">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );

  return (
    <div>
      <h3 className="text-xl font-semibold text-primary mb-3">Quick Stats</h3>
      <div className="grid grid-cols-2 gap-3">
        <StatItem icon={<BarChart className="w-6 h-6 text-primary/80" />} value={stats.tests} label="Tests Taken" />
        <StatItem icon={<Target className="w-6 h-6 text-primary/80" />} value={stats.avg} label="Avg Score" />
        <StatItem icon={<Flame className="w-6 h-6 text-primary/80" />} value={stats.streak} label="Streak" />
        <StatItem icon={<Star className="w-6 h-6 text-primary/80" />} value={stats.xp} label="Total XP" />
      </div>
    </div>
  );
};
