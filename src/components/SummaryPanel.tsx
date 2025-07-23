import { useState, useEffect } from "react";
import { TrendingUp, Award, Target, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TestScore } from "@/types/TestScore";

// TestScore interface is now imported from shared types

export const SummaryPanel = () => {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [totalTests, setTotalTests] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [averageTotalQuestions, setAverageTotalQuestions] = useState(25);
  const navigate = useNavigate();

  const loadData = () => {
    const savedXp = parseInt(localStorage.getItem("xp") || "0");
    const savedStreak = parseInt(localStorage.getItem("streak") || "0");
    const scores: TestScore[] = JSON.parse(localStorage.getItem("scores") || "[]");

    setXp(savedXp);
    setLevel(Math.floor(savedXp / 250) + 1);
    setStreak(savedStreak);
    setTotalTests(scores.length);

    if (scores.length > 0) {
      const totalScores = scores.reduce((sum, score) => sum + score.score, 0);
      const totalQuestions = scores.reduce((sum, score) => {
        if (score.questionCorrectness && Object.keys(score.questionCorrectness).length > 0) {
          return sum + Object.keys(score.questionCorrectness).length;
        }
        return sum + 25; // fallback for old data
      }, 0);

      const avgScore = totalScores / scores.length;
      const avgTotalQuestions = totalQuestions / scores.length;

      setAverageScore(Math.round(avgScore * 10) / 10);
      setAverageTotalQuestions(Math.round(avgTotalQuestions));
    } else {
      setAverageScore(0);
      setAverageTotalQuestions(25);
    }
  };

  useEffect(() => {
    loadData();

    const handleDataUpdate = () => loadData();
    window.addEventListener('dataUpdate', handleDataUpdate);

    return () => {
      window.removeEventListener('dataUpdate', handleDataUpdate);
    };
  }, []);

  return (
    <div className="glass p-4 rounded-xl shadow-lg mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Level {level}</span>
            <span className="text-xs text-muted-foreground">({xp.toLocaleString()} XP)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">{streak} day streak</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">{totalTests} tests</span>
          </div>
          
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Avg: {averageScore}/{averageTotalQuestions}</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/analytics')}
          className="hover-scale"
          aria-label="View Analytics"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          View Analytics
        </Button>
      </div>
    </div>
  );
};