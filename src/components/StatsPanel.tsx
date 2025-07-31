import { useState, useEffect } from "react";
import { useScoringMode } from '@/context/SettingsContext';
import { getTotalQuestions, getMaxPoints } from '@/lib/scoring';
import { TrendingUp, Calendar, Target, Award, Filter, BarChart3, Zap, TrendingDown, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TestScore } from "@/types/TestScore";

// TestScore interface is now imported from shared types

interface StatsPanelProps {
  filterType?: string;
}

export const StatsPanel = ({ filterType = "all" }: StatsPanelProps) => {
  const [stats, setStats] = useState({
    total: 0,
    lastDate: "—",
    average: "—",
    best: "—",
    worst: "—",
    improvement: "—",
    consistency: "—",
    recentAverage: "—"
  });
  const [internalFilter, setInternalFilter] = useState("all");
  const { scoringMode } = useScoringMode();

  useEffect(() => {
    const updateStats = () => {
      const allScores: TestScore[] = JSON.parse(localStorage.getItem("scores") || "[]");
      
      const getCorrectCount = (score: TestScore): number => {
        if (score.questionCorrectness) {
          return Object.values(score.questionCorrectness).filter(Boolean).length;
        }
        if (score.input && score.key) {
          return score.input.split('').filter((char, i) => char.toLowerCase() === score.key![i].toLowerCase()).length;
        }
        return score.score; // Fallback to the score property if others are missing
      };

      const filteredScores = internalFilter === "all" 
        ? allScores 
        : allScores.filter(s => s.testType === internalFilter);
      
      const scoresWithData = filteredScores.map(s => {
        const correctCount = getCorrectCount(s);
        const totalQuestions = getTotalQuestions(s.testType);
        const maxPoints = getMaxPoints(s.testType);

        const displayValue = scoringMode === 'points' ? s.score : correctCount;
        const maxValue = scoringMode === 'points' ? maxPoints : totalQuestions;
        const percentage = maxValue > 0 ? (displayValue / maxValue) * 100 : 0;
        
        return { ...s, displayValue, maxValue, percentage };
      });

      if (scoresWithData.length === 0) {
        setStats({
          total: 0, lastDate: "—", average: "—", best: "—", worst: "—",
          improvement: "—", consistency: "—", recentAverage: "—"
        });
        return;
      }

      const total = scoresWithData.length;
      const lastDate = scoresWithData[scoresWithData.length - 1].date;
      const displayValues = scoresWithData.map(s => s.displayValue);
      const maxValues = scoresWithData.map(s => s.maxValue);
      
      const bestValue = Math.max(...displayValues);
      const worstValue = Math.min(...displayValues);
      const averageValue = displayValues.reduce((acc, p) => acc + p, 0) / displayValues.length;
      const averageMax = maxValues.reduce((acc, p) => acc + p, 0) / maxValues.length;

      const formatValue = (val: number) => scoringMode === 'points' ? val.toFixed(0) : val.toFixed(1);

      let improvement = "—";
      if (scoresWithData.length >= 6) {
        const firstThree = scoresWithData.slice(0, 3).reduce((a, b) => a + b.percentage, 0) / 3;
        const lastThree = scoresWithData.slice(-3).reduce((a, b) => a + b.percentage, 0) / 3;
        const improvementValue = lastThree - firstThree;
        improvement = `${improvementValue > 0 ? '+' : ''}${improvementValue.toFixed(1)}%`;
      }

      let consistency = "—";
      if (scoresWithData.length >= 3) {
        const percentages = scoresWithData.map(s => s.percentage);
        const mean = percentages.reduce((a, b) => a + b, 0) / percentages.length;
        const variance = percentages.reduce((acc, p) => acc + Math.pow(p - mean, 2), 0) / percentages.length;
        const stdDev = Math.sqrt(variance);
        const consistencyPercent = Math.max(0, 100 - (stdDev / 25) * 100);
        consistency = `${consistencyPercent.toFixed(0)}%`;
      }

      let recentAverage = "—";
      if (scoresWithData.length >= 3) {
        const recentTests = Math.min(5, scoresWithData.length);
        const recentScores = displayValues.slice(-recentTests);
        const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
        recentAverage = formatValue(recentAvg);
      }

      setStats({
        total,
        lastDate: new Date(lastDate).toLocaleDateString(),
        average: `${formatValue(averageValue)} / ${formatValue(averageMax)}`,
        best: `${formatValue(bestValue)} / ${formatValue(maxValues[displayValues.indexOf(bestValue)])}`,
        worst: `${formatValue(worstValue)} / ${formatValue(maxValues[displayValues.indexOf(worstValue)])}`,
        improvement,
        consistency,
        recentAverage
      });
    };

    updateStats();

    const handleDataUpdate = () => {
      updateStats();
    };
    
    window.addEventListener('dataUpdate', handleDataUpdate);

    return () => {
      window.removeEventListener('dataUpdate', handleDataUpdate);
    };
  }, [internalFilter, scoringMode]);

  const statItems = [
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: "Total Tests Taken",
      value: stats.total,
      color: "text-blue-600"
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      label: "Last Test Date",
      value: stats.lastDate,
      color: "text-green-600"
    },
    {
      icon: <Target className="w-4 h-4" />,
      label: "Average Score",
      value: stats.average,
      color: "text-yellow-600"
    },
    {
      icon: <Award className="w-4 h-4" />,
      label: "Best Score",
      value: stats.best,
      color: "text-purple-600"
    },
    {
      icon: <TrendingDown className="w-4 h-4" />,
      label: "Worst Score",
      value: stats.worst,
      color: "text-red-600"
    },
    {
      icon: <Zap className="w-4 h-4" />,
      label: "Improvement",
      value: stats.improvement,
      color: "text-emerald-600"
    },
    {
      icon: <BarChart3 className="w-4 h-4" />,
      label: "Consistency",
      value: stats.consistency,
      color: "text-indigo-600"
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: "Recent Average",
      value: stats.recentAverage,
      color: "text-orange-600"
    }
  ];

  return (
    <section className="glass p-6 rounded-2xl shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Test Statistics
        </h2>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={internalFilter} onValueChange={setInternalFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tests</SelectItem>
              <SelectItem value="8">AMC 8</SelectItem>
              <SelectItem value="10">AMC 10</SelectItem>
              <SelectItem value="12">AMC 12</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-4">
        {statItems.map((item, index) => (
          <div 
            key={item.label}
            className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover-scale"
          >
            <div className="flex items-center gap-3">
              <div className={`${item.color}`}>
                {item.icon}
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <span className="font-bold text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
};