import { useState, useEffect } from "react";
import { Flame, Star, Target, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TestScore {
  date: string;
  score: number;
  testType: string;
  year: number;
  maxQuestions?: number;
}

export const GamificationPanel = () => {
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [problemStats, setProblemStats] = useState({ correct: 0, total: 0 });

  const loadData = () => {
    const savedXp = parseInt(localStorage.getItem("xp") || "0");
    const savedStreak = parseInt(localStorage.getItem("streak") || "0");
    const scores: TestScore[] = JSON.parse(localStorage.getItem("scores") || "[]");

    setXp(savedXp);
    setStreak(savedStreak);
    setLevel(Math.floor(savedXp / 250) + 1); // Changed from 100 to 250 XP per level

    // Calculate problem statistics
    let totalCorrect = 0;
    let totalQuestions = 0;
    
    scores.forEach(score => {
      totalCorrect += score.score;
      // Use maxQuestions if available, otherwise default based on test type
      const maxQuestions = score.maxQuestions || (score.testType === "mathcounts-sprint" ? 30 : score.testType === "mathcounts-target" ? 8 : score.testType === "mathcounts-team" ? 10 : 25);
      totalQuestions += maxQuestions;
    });

    setProblemStats({ correct: totalCorrect, total: totalQuestions });
  };

  useEffect(() => {
    loadData();

    // Listen for data updates
    const handleDataUpdate = () => {
      loadData();
    };

    window.addEventListener('dataUpdate', handleDataUpdate);

    return () => {
      window.removeEventListener('dataUpdate', handleDataUpdate);
    };
  }, []);

  const xpForNextLevel = (level) * 250; // Changed from 100 to 250 XP per level
  const progressToNextLevel = xp - ((level - 1) * 250);
  const progressPercent = Math.min(100, Math.round((progressToNextLevel / 250) * 100));
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

      {/* Level Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Level {level} Progress</span>
          <span className="text-sm text-muted-foreground">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-3" />
        <div className="text-xs text-muted-foreground mt-1 text-right">
          <Target className="w-3 h-3 inline mr-1" />
          Next Level: {xpForNextLevel} XP ({250 - progressToNextLevel} XP to go)
        </div>
      </div>

      {/* Problem Distribution Chart */}
      <div className="mt-6">
        <h3 className="text-md font-semibold mb-3 text-primary flex items-center gap-2">
          📌 Problem Distribution
        </h3>
        
        {problemStats.total > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-green-600">✓ Correct: {problemStats.correct}</span>
              <span className="text-red-500">✗ Incorrect: {problemStats.total - problemStats.correct}</span>
            </div>
            
            {/* Dual Progress Bar */}
            <div className="relative w-full bg-secondary rounded-full h-4 overflow-hidden">
              <div 
                className="absolute left-0 h-full gradient-success transition-all duration-700 ease-out"
                style={{ width: `${correctPercent}%` }}
              />
              <div 
                className="absolute right-0 h-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-700 ease-out"
                style={{ width: `${100 - correctPercent}%` }}
              />
            </div>
            
            <div className="text-center">
              <span className="text-lg font-bold text-accent">{correctPercent}%</span>
              <span className="text-sm text-muted-foreground ml-2">accuracy</span>
            </div>

            {/* Gamification Elements */}
            <div className="space-y-3 pt-4 border-t border-border/50">
              {/* Accuracy Status */}
              <div className="text-center">
                {correctPercent >= 90 && (
                  <div className="animate-pulse">
                    <div className="text-2xl mb-1">🏆</div>
                    <div className="text-sm font-medium text-amber-600">Master Level!</div>
                  </div>
                )}
                {correctPercent >= 80 && correctPercent < 90 && (
                  <div>
                    <div className="text-2xl mb-1">🌟</div>
                    <div className="text-sm font-medium text-blue-600">Expert Level</div>
                  </div>
                )}
                {correctPercent >= 70 && correctPercent < 80 && (
                  <div>
                    <div className="text-2xl mb-1">📈</div>
                    <div className="text-sm font-medium text-green-600">Strong Performance</div>
                  </div>
                )}
                {correctPercent >= 60 && correctPercent < 70 && (
                  <div>
                    <div className="text-2xl mb-1">💪</div>
                    <div className="text-sm font-medium text-yellow-600">Good Progress</div>
                  </div>
                )}
                {correctPercent < 60 && (
                  <div>
                    <div className="text-2xl mb-1">🎯</div>
                    <div className="text-sm font-medium text-muted-foreground">Keep Practicing!</div>
                  </div>
                )}
              </div>

              {/* Accuracy Milestone Progress */}
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">Accuracy Milestone Progress</span>
                  <span className="text-xs text-muted-foreground">
                    Target: {correctPercent < 60 ? "60%" : 
                     correctPercent < 70 ? "70%" : 
                     correctPercent < 80 ? "80%" : 
                     correctPercent < 90 ? "90%" : "100%"}
                  </span>
                </div>
                <div className="w-full bg-secondary/50 rounded-full h-2">
                  <div 
                    className="h-full gradient-primary rounded-full transition-all duration-500"
                    style={{ 
                      width: `${correctPercent < 60 ? (correctPercent / 60) * 100 : 
                               correctPercent < 70 ? ((correctPercent - 60) / 10) * 100 : 
                               correctPercent < 80 ? ((correctPercent - 70) / 10) * 100 : 
                               correctPercent < 90 ? ((correctPercent - 80) / 10) * 100 : 
                               correctPercent >= 90 ? 100 : 0}%` 
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {correctPercent >= 100 ? "Perfect accuracy achieved!" : 
                   `${Math.max(0, (correctPercent < 60 ? 60 : 
                    correctPercent < 70 ? 70 : 
                    correctPercent < 80 ? 80 : 
                    correctPercent < 90 ? 90 : 100) - correctPercent)}% until next milestone`}
                </div>
              </div>
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