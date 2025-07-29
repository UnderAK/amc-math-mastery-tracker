import { useState, useEffect } from "react";
import { useSettings } from '@/context/SettingsContext';
import { getMaxPoints } from '@/lib/scoring';
import { TestScore } from '@/types/TestScore';
import { BarChart, Target, Flame, Star } from 'lucide-react';

// Type guard to check if an object is a valid TestScore
const isTestScore = (item: any): item is TestScore => {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.score === 'number' &&
    typeof item.date === 'string' &&
    typeof item.testType === 'string'
  );
};

export const QuickStats = () => {
  const { settings } = useSettings();
  const [stats, setStats] = useState({ tests: 0, avg: 0, streak: 0, xp: 0 });

  useEffect(() => {
    const updateStats = () => {
      let scores: TestScore[] = [];
      try {
        const rawScores = JSON.parse(localStorage.getItem('scores') || '[]');
        if (Array.isArray(rawScores)) {
          // Check for legacy format (array of numbers/strings) and migrate
          if (rawScores.every(s => typeof s === 'number' || typeof s === 'string')) {
            const migratedScores: TestScore[] = rawScores.map(s => ({
              id: crypto.randomUUID(),
              score: Number(s) || 0,
              date: new Date().toISOString(),
              year: new Date().getFullYear(),
              testType: 'amc10', // Assign a default testType
            }));
            localStorage.setItem('scores', JSON.stringify(migratedScores));
            scores = migratedScores;
          } else {
            // Filter for valid TestScore objects
            scores = rawScores.filter(isTestScore);
          }
        }
      } catch (e) {
        console.error("Failed to parse or migrate scores from localStorage", e);
        scores = [];
      }
      const xp = parseInt(localStorage.getItem('xp') || '0', 10);
      const streak = parseInt(localStorage.getItem('streak') || '0', 10);
      
      let avg = 0;
      if (scores.length > 0) {
        if (settings.scoreDisplayMode === 'percentage') {
          const totalPercentage = scores.reduce((sum, s) => {
            const maxPoints = getMaxPoints(s.testType);
            const percentage = maxPoints > 0 ? (s.score / maxPoints) * 100 : 0;
            return sum + percentage;
          }, 0);
          avg = Math.round(totalPercentage / scores.length);
        } else { // 'points'
          const totalPoints = scores.reduce((sum, s) => sum + (s.score || 0), 0);
          avg = Math.round(totalPoints / scores.length);
        }
      }

      setStats({ tests: scores.length, avg, streak, xp });
    };

    updateStats();

    // Listen for the correct custom event to update stats
    window.addEventListener('dataUpdate', updateStats);

    return () => {
      window.removeEventListener('dataUpdate', updateStats);
    };
  }, [settings.scoreDisplayMode]);

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
                <StatItem icon={<Star className="w-6 h-6 text-primary" />} value={`${stats.avg}${settings.scoreDisplayMode === 'percentage' ? '%' : ''}`} label="Average Score" />
        <StatItem icon={<Flame className="w-6 h-6 text-primary" />} value={stats.streak} label="Current Streak" />
        <StatItem icon={<BarChart className="w-6 h-6 text-primary" />} value={stats.xp.toLocaleString()} label="Experience Points" />
      </div>
    </div>
  );
};
