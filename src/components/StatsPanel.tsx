import { useState, useEffect } from "react";
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

  useEffect(() => {
    const updateStats = () => {
      console.log('DEBUG StatsPanel: updateStats called');
      const allScores: TestScore[] = JSON.parse(localStorage.getItem("scores") || "[]");
      console.log('DEBUG StatsPanel: Retrieved scores from localStorage:', allScores);
      console.log('DEBUG StatsPanel: Number of scores:', allScores.length);
      
      // Apply filter based on internalFilter
      const filteredScores = internalFilter === "all" 
        ? allScores 
        : allScores.filter(s => s.testType === internalFilter);
      
      if (filteredScores.length === 0) {
        setStats({
          total: 0,
          lastDate: "—",
          average: "—",
          best: "—",
          worst: "—",
          improvement: "—",
          consistency: "—",
          recentAverage: "—"
        });
        return;
      }

      const total = filteredScores.length;
      const scoreValues = filteredScores.map(s => s.score);
      const best = Math.max(...scoreValues);
      const worst = Math.min(...scoreValues);
      const average = scoreValues.reduce((acc, s) => acc + s, 0) / scoreValues.length;
      const lastDate = filteredScores[filteredScores.length - 1].date;
      
      // Calculate improvement trend (last 3 vs first 3 tests)
      let improvement = "—";
      if (filteredScores.length >= 6) {
        const firstThree = scoreValues.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
        const lastThree = scoreValues.slice(-3).reduce((a, b) => a + b, 0) / 3;
        const improvementValue = lastThree - firstThree;
        improvement = improvementValue > 0 ? `+${improvementValue.toFixed(1)}` : improvementValue.toFixed(1);
      }
      
      // Calculate consistency (standard deviation)
      let consistency = "—";
      if (filteredScores.length >= 3) {
        const variance = scoreValues.reduce((acc, score) => acc + Math.pow(score - average, 2), 0) / scoreValues.length;
        const stdDev = Math.sqrt(variance);
        const consistencyPercent = Math.max(0, 100 - (stdDev / average) * 100);
        consistency = `${consistencyPercent.toFixed(0)}%`;
      }
      
      // Calculate recent average (last 5 tests)
      let recentAverage = "—";
      if (filteredScores.length >= 3) {
        const recentTests = Math.min(5, filteredScores.length);
        const recentScores = scoreValues.slice(-recentTests);
        const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
        recentAverage = recentAvg.toFixed(1);
      }

      setStats({
        total,
        lastDate,
        average: average.toFixed(1),
        best: best.toString(),
        worst: worst.toString(),
        improvement,
        consistency,
        recentAverage
      });
    };

    console.log('DEBUG StatsPanel: Component mounted, calling initial updateStats');
    updateStats();

    // Listen for data updates
    const handleDataUpdate = () => {
      console.log('DEBUG StatsPanel: dataUpdate event received!');
      updateStats();
    };
    
    console.log('DEBUG StatsPanel: Adding dataUpdate event listener');
    window.addEventListener('dataUpdate', handleDataUpdate);

    return () => {
      console.log('DEBUG StatsPanel: Removing dataUpdate event listener');
      window.removeEventListener('dataUpdate', handleDataUpdate);
    };
  }, [internalFilter]);

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