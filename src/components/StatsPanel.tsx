import { useState, useEffect } from "react";
import { TrendingUp, Calendar, Target, Award, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TestScore {
  date: string;
  score: number;
  testType: string;
  year: number;
}

interface StatsPanelProps {
  filterType?: string;
}

export const StatsPanel = ({ filterType = "all" }: StatsPanelProps) => {
  const [stats, setStats] = useState({
    total: 0,
    lastDate: "—",
    average: "—",
    best: "—"
  });
  const [internalFilter, setInternalFilter] = useState("all");

  useEffect(() => {
    const updateStats = () => {
      const scores: TestScore[] = JSON.parse(localStorage.getItem("scores") || "[]");
      
      // Apply filter based on internalFilter
      const filteredScores = internalFilter === "all" 
        ? scores 
        : scores.filter(s => s.testType === internalFilter);
      
      if (filteredScores.length === 0) {
        setStats({
          total: 0,
          lastDate: "—",
          average: "—",
          best: "—"
        });
        return;
      }

      const total = filteredScores.length;
      const best = Math.max(...filteredScores.map(s => s.score));
      const average = filteredScores.reduce((acc, s) => acc + s.score, 0) / filteredScores.length;
      const lastDate = filteredScores[filteredScores.length - 1].date;

      setStats({
        total,
        lastDate,
        average: average.toFixed(1),
        best: best.toString()
      });
    };

    updateStats();

    // Listen for data updates
    const handleDataUpdate = () => updateStats();
    window.addEventListener('dataUpdate', handleDataUpdate);

    return () => {
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
    }
  ];

  return (
    <section className="glass p-6 rounded-2xl shadow-xl">
      <h2 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        Test Statistics
      </h2>
      
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