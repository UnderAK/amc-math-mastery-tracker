import { useState, useEffect } from "react";
import { Flame, Star, Target, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TestScore {
  date: string;
  score: number;
  testType: string;
  year: number;
}

export const GamificationPanel = () => {
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [problemStats, setProblemStats] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    // Load saved data
    const savedXp = parseInt(localStorage.getItem("xp") || "0");
    const savedStreak = parseInt(localStorage.getItem("streak") || "0");
    const scores: TestScore[] = JSON.parse(localStorage.getItem("scores") || "[]");

    setXp(savedXp);
    setStreak(savedStreak);
    setLevel(Math.floor(savedXp / 100) + 1);

    // Calculate problem statistics
    let totalCorrect = 0;
    let totalQuestions = 0;
    
    scores.forEach(score => {
      totalCorrect += score.score;
      totalQuestions += 25; // Each test has 25 questions
    });

    setProblemStats({ correct: totalCorrect, total: totalQuestions });
  }, []);

  const dailyGoal = 100;
  const progressPercent = Math.min(100, Math.round((xp % dailyGoal) / dailyGoal * 100));
  const correctPercent = problemStats.total > 0 ? Math.round((problemStats.correct / problemStats.total) * 100) : 0;

  return (
    <section className="glass p-6 rounded-2xl shadow-xl">
      <h2 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5" />
        Gamification Panel
      </h2>
      
      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-lg">
            <Flame className="w-5 h-5 text-orange-500" />
            <strong>Streak:</strong>
          </div>
          <span className="text-2xl font-bold text-orange-500">{streak}</span>
          <div className="text-sm text-muted-foreground">days</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-lg">
            <Star className="w-5 h-5 text-yellow-500" />
            <strong>XP:</strong>
          </div>
          <span className="text-2xl font-bold text-yellow-500">{xp.toLocaleString()}</span>
          <div className="text-sm text-muted-foreground">Level {level}</div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Daily Progress</span>
          <span className="text-sm text-muted-foreground">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-3" />
        <div className="text-xs text-muted-foreground mt-1 text-right">
          <Target className="w-3 h-3 inline mr-1" />
          Daily Goal: {dailyGoal} XP
        </div>
      </div>

      {/* Problem Distribution Chart */}
      <div className="mt-6">
        <h3 className="text-md font-semibold mb-3 text-primary flex items-center gap-2">
          📌 Problem Distribution
        </h3>
        
        {problemStats.total > 0 ? (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Correct: {problemStats.correct}</span>
              <span>Incorrect: {problemStats.total - problemStats.correct}</span>
            </div>
            
            <div className="w-full bg-secondary rounded-full h-4 overflow-hidden">
              <div 
                className="h-full gradient-success transition-all duration-700 ease-out"
                style={{ width: `${correctPercent}%` }}
              />
            </div>
            
            <div className="text-center">
              <span className="text-lg font-bold text-accent">{correctPercent}%</span>
              <span className="text-sm text-muted-foreground ml-2">accuracy</span>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Start taking tests to see your progress!</p>
          </div>
        )}
      </div>
    </section>
  );
};