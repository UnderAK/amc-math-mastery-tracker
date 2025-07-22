import { useState, useEffect } from "react";
import { TrendingUp, Calendar, Target, Award, BarChart3, Clock, Zap, Percent } from "lucide-react";

interface TestScore {
  date: string;
  score: number;
  testType: string;
  year: number;
}

export const StatsPanel = () => {
  const [stats, setStats] = useState({
    total: 0,
    lastDate: "—",
    average: "—",
    best: "—",
    worst: "—",
    improvement: "—",
    totalQuestions: 0,
    accuracy: "—",
    streak: 0
  });

  useEffect(() => {
    const updateStats = () => {
      const scores: TestScore[] = JSON.parse(localStorage.getItem("scores") || "[]");
      const streak = parseInt(localStorage.getItem("streak") || "0");
      
      if (scores.length === 0) {
        setStats({
          total: 0,
          lastDate: "—",
          average: "—",
          best: "—",
          worst: "—",
          improvement: "—",
          totalQuestions: 0,
          accuracy: "—",
          streak: 0
        });
        return;
      }

      const total = scores.length;
      const scoreValues = scores.map(s => s.score);
      const best = Math.max(...scoreValues);
      const worst = Math.min(...scoreValues);
      const average = scores.reduce((acc, s) => acc + s.score, 0) / scores.length;
      const lastDate = scores[scores.length - 1].date;
      const totalQuestions = scores.length * 25;
      const totalCorrect = scores.reduce((acc, s) => acc + s.score, 0);
      const accuracy = (totalCorrect / totalQuestions) * 100;

      // Calculate improvement (recent vs older scores)
      let improvement = "—";
      if (scores.length >= 6) {
        const recent = scores.slice(-3);
        const older = scores.slice(-6, -3);
        const recentAvg = recent.reduce((acc, s) => acc + s.score, 0) / recent.length;
        const olderAvg = older.reduce((acc, s) => acc + s.score, 0) / older.length;
        const diff = recentAvg - olderAvg;
        improvement = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
      }

      setStats({
        total,
        lastDate,
        average: average.toFixed(1),
        best: best.toString(),
        worst: worst.toString(),
        improvement,
        totalQuestions,
        accuracy: accuracy.toFixed(1) + "%",
        streak
      });
    };

    updateStats();

    // Listen for data updates
    const handleDataUpdate = () => updateStats();
    window.addEventListener('dataUpdate', handleDataUpdate);

    return () => {
      window.removeEventListener('dataUpdate', handleDataUpdate);
    };
  }, []);

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
      icon: <BarChart3 className="w-4 h-4" />,
      label: "Worst Score",
      value: stats.worst,
      color: "text-red-600"
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: "Recent Improvement",
      value: stats.improvement,
      color: "text-cyan-600"
    },
    {
      icon: <Zap className="w-4 h-4" />,
      label: "Total Questions",
      value: stats.totalQuestions,
      color: "text-orange-600"
    },
    {
      icon: <Percent className="w-4 h-4" />,
      label: "Overall Accuracy",
      value: stats.accuracy,
      color: "text-teal-600"
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