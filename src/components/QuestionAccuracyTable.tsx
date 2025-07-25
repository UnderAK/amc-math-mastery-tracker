import { useState, useEffect, useCallback } from "react";
import { Target, TrendingUp, AlertTriangle } from "lucide-react";
import { TestScore } from "@/types/TestScore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// TestScore interface is now imported from shared types

interface QuestionStat {
  question: number;
  correct: number;
  total: number;
  accuracy: number;
}

interface QuestionAccuracyTableProps {
  filterType?: string;
}

export const QuestionAccuracyTable = ({ filterType = "all" }: QuestionAccuracyTableProps) => {
  const [questionStats, setQuestionStats] = useState<QuestionStat[]>([]);

  const [allScores, setAllScores] = useState<TestScore[]>([]);

  const updateQuestionStats = useCallback(() => {
    const filteredScores = filterType === "all" 
      ? allScores 
      : allScores.filter(s => 
          s.testType &&
          s.testType.replace(/\s+/g, '').toLowerCase() === filterType.replace(/\s+/g, '').toLowerCase()
        );

    const stats: { [key: number]: QuestionStat } = {};

    filteredScores.forEach(score => {
      if (score.questionCorrectness && Object.keys(score.questionCorrectness).length > 0) {
        Object.entries(score.questionCorrectness).forEach(([qNumStr, isCorrect]) => {
          const qNum = parseInt(qNumStr, 10);
          if (!stats[qNum]) {
            stats[qNum] = { question: qNum, correct: 0, total: 0, accuracy: 0 };
          }
          stats[qNum].total++;
          if (isCorrect) {
            stats[qNum].correct++;
          }
        });
      } else {
        const input = score.input || "";
        const key = score.key || "";
        const questionsInTest = Math.max(input.length, key.length);
        for (let i = 0; i < questionsInTest; i++) {
          if (typeof key[i] !== "undefined") {
            const qNum = i + 1;
            if (!stats[qNum]) {
              stats[qNum] = { question: qNum, correct: 0, total: 0, accuracy: 0 };
            }
            stats[qNum].total++;
            if (input[i] && input[i] === key[i]) {
              stats[qNum].correct++;
            }
          }
        }
      }
    });

    const sortedStats = Object.keys(stats)
      .map(Number)
      .sort((a, b) => a - b)
      .map(qNum => {
        const stat = stats[qNum];
        stat.accuracy = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
        return { ...stat, question: qNum };
      });

    const maxQuestion = sortedStats.length > 0 ? Math.max(...sortedStats.map(s => s.question)) : 0;
    const finalStats: QuestionStat[] = [];
    for (let i = 1; i <= Math.max(25, maxQuestion); i++) {
      const existingStat = sortedStats.find(s => s.question === i);
      if (existingStat) {
        finalStats[i - 1] = existingStat;
      } else {
        finalStats[i - 1] = { question: i, correct: 0, total: 0, accuracy: 0 };
      }
    }

    setQuestionStats(finalStats);
  }, [allScores, filterType]);

  // Effect to load scores and listen for updates
  useEffect(() => {
    const loadScores = () => {
      const scoresFromStorage: TestScore[] = JSON.parse(localStorage.getItem("scores") || "[]");
      setAllScores(scoresFromStorage);
    };

    loadScores(); // Initial load

    window.addEventListener('dataUpdate', loadScores);
    return () => {
      window.removeEventListener('dataUpdate', loadScores);
    };
  }, []);

  // Effect to recalculate stats when data or filter changes
  useEffect(() => {
    updateQuestionStats();
  }, [updateQuestionStats]);

  const hasData = questionStats.some(stat => stat.total > 0);
  const worstQuestions = questionStats
    .filter(stat => stat.total >= 3 && stat.accuracy < 100) // Only questions attempted at least 3 times and not perfect
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  const bestQuestions = questionStats
    .filter(stat => stat.total >= 3)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 3);

  const hasImperfectQuestions = worstQuestions.length > 0;

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return "text-green-600 bg-green-50 dark:bg-green-900/20";
    if (accuracy >= 75) return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
    if (accuracy >= 60) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
    return "text-red-600 bg-red-50 dark:bg-red-900/20";
  };

  return (
    <section className="glass p-6 rounded-2xl shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
          <Target className="w-5 h-5" />
          Question Accuracy
        </h2>
      </div>

      {hasData ? (
        <div className="space-y-6">
          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {hasImperfectQuestions && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Need Practice
                </h3>
                <div className="space-y-1">
                  {worstQuestions.map(q => (
                    <div key={q.question} className="text-sm">
                      <span className="font-medium">Q{q.question}:</span> {q.accuracy}% ({q.correct}/{q.total})
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={`bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 ${!hasImperfectQuestions ? 'md:col-span-2' : ''}`}>
              <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Strengths
              </h3>
              <div className="space-y-1">
                {bestQuestions.length > 0 ? bestQuestions.map(q => (
                  <div key={q.question} className="text-sm">
                    <span className="font-medium">Q{q.question}:</span> {q.accuracy}% ({q.correct}/{q.total})
                  </div>
                )) : (
                  <div className="text-sm text-green-600">
                    🎉 Perfect performance across all questions!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Table */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm text-center">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-3 py-3 font-medium">Q#</th>
                  <th className="px-3 py-3 font-medium">Correct</th>
                  <th className="px-3 py-3 font-medium">Total</th>
                  <th className="px-3 py-3 font-medium">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {questionStats.map((stat, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-secondary/20 transition-colors fade-in-up"
                    style={{ animationDelay: `${index * 0.02}s` }}
                  >
                    <td className="px-3 py-2 font-medium">
                      Q{index + 1}
                    </td>
                    <td className="px-3 py-2 text-accent font-medium">
                      {stat.correct}
                    </td>
                    <td className="px-3 py-2">
                      {stat.total}
                    </td>
                    <td className="px-3 py-2">
                      {stat.total > 0 ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccuracyColor(stat.accuracy)}`}>
                          {stat.accuracy}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-muted-foreground">No question data yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Complete some tests to analyze your question-by-question performance
          </p>
        </div>
      )}
    </section>
  );
};