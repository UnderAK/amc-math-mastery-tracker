import { useState, useEffect, useCallback } from "react";
import { useSettings } from '@/context/SettingsContext';
import { getMaxPoints } from '@/lib/scoring';
import { TestScore } from '@/types/TestScore';
import { BarChart, Target, Flame, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Type guard to check if an object is a valid TestScore
// Type guard to check if an object is a valid TestScore
const isTestScore = (item: any): item is TestScore => {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.id === 'string' &&
    typeof item.score === 'number' &&
    typeof item.date === 'string' &&
    typeof item.year === 'number' &&
    typeof item.testType === 'string'
  );
};

export const QuickStats = () => {
  const { settings } = useSettings();
  const [stats, setStats] = useState({ tests: 0, avg: 0, streak: 0, xp: 0 });
  const [error, setError] = useState<string | null>(null);

  const updateStats = useCallback(() => {
    let scores: TestScore[] = [];
    try {
      const rawData = localStorage.getItem('scores');
      const parsedData = rawData ? JSON.parse(rawData) : [];
      
      if (Array.isArray(parsedData)) {
        const validScores = parsedData.filter(isTestScore);
        
        if (validScores.length !== parsedData.length) {
          localStorage.setItem('scores', JSON.stringify(validScores));
        }
        scores = validScores;
      } else {
        localStorage.removeItem('scores');
        scores = [];
      }
    } catch (e) {
      console.error("Error processing scores from localStorage:", e);
      setError("Could not load scores. Data might be corrupted.");
      localStorage.removeItem('scores');
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
  }, [settings.scoreDisplayMode]);

  useEffect(() => {
    updateStats();

    window.addEventListener('dataUpdate', updateStats);

    return () => {
      window.removeEventListener('dataUpdate', updateStats);
    };
  }, [updateStats]);

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

  const clearCorruptedData = () => {
    localStorage.removeItem('scores');
    setError(null);
    updateStats(); // Re-run stats calculation
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-primary flex items-center"><BarChart className="mr-2"/>Quick Stats</h3>
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg flex items-center justify-between">
          <p className="text-sm">{error}</p>
          <Button variant="destructive" size="sm" onClick={clearCorruptedData}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Data
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatItem icon={<Target className="w-6 h-6 text-primary" />} value={String(stats.tests)} label="Tests Taken" />
        <StatItem icon={<Star className="w-6 h-6 text-primary" />} value={`${stats.avg}${settings.scoreDisplayMode === 'percentage' ? '%' : ''}`} label="Average Score" />
        <StatItem icon={<Flame className="w-6 h-6 text-primary" />} value={String(stats.streak)} label="Current Streak" />
        <StatItem icon={<BarChart className="w-6 h-6 text-primary" />} value={stats.xp.toLocaleString()} label="Experience Points" />
      </div>
    </div>
  );
};
