import { useState, useEffect, useMemo, useCallback } from "react";
import { AlertTriangle, TrendingDown, Target, BookOpen, TrendingUp } from "lucide-react";
import { TestScore } from "@/types/TestScore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface WeaknessReportProps {
  filterType?: string;
}

interface WeaknessAnalysis {
  weakestTopics: Array<{ topic: string; mistakes: number; attempts: number }>;
  problematicQuestions: Array<{ question: number; errorRate: number; attempts: number }>;
  recommendations: string[];
  overallTrend: string;
}

export const WeaknessReport = ({ filterType = "all" }: WeaknessReportProps) => {
  const [allScores, setAllScores] = useState<TestScore[]>([]);
  const { toast } = useToast();

  const updateScores = useCallback(() => {
    const savedScores: TestScore[] = JSON.parse(localStorage.getItem("scores") || "[]");
    setAllScores(savedScores);
  }, []);

  useEffect(() => {
    updateScores();
    window.addEventListener('dataUpdate', updateScores);
    return () => {
      window.removeEventListener('dataUpdate', updateScores);
    };
  }, [updateScores]);

  const filteredScores = useMemo(() => {
    return filterType === "all"
      ? allScores
      : allScores.filter(s => s.testType && s.testType.replace(/\s+/g, '').toLowerCase() === filterType.replace(/\s+/g, '').toLowerCase());
  }, [allScores, filterType]);

  const [analysis, setAnalysis] = useState<WeaknessAnalysis | null>(null);

  const generateReport = () => {
    if (filteredScores.length === 0) {
      return null;
    }

    const topicData: { [topic: string]: { mistakes: number; attempts: number } } = {};
    const questionData: { [question: number]: { errors: number; attempts: number } } = {};

    for (let i = 1; i <= 25; i++) {
      questionData[i] = { errors: 0, attempts: 0 };
    }

    filteredScores.forEach(score => {
      if (score.questionTopics && score.questionCorrectness) {
        for (let i = 1; i <= 25; i++) {
          const topic = score.questionTopics[i] || 'Other';
          const isCorrect = score.questionCorrectness[i];

          if (!topicData[topic]) topicData[topic] = { mistakes: 0, attempts: 0 };
          topicData[topic].attempts++;
          if (!isCorrect) {
            topicData[topic].mistakes++;
          }

          questionData[i].attempts++;
          if (!isCorrect) {
            questionData[i].errors++;
          }
        }
      }
    });

    const weakestTopics = Object.entries(topicData)
      .map(([topic, data]) => ({ topic, mistakes: data.mistakes, attempts: data.attempts }))
      .filter(t => t.mistakes > 0)
      .sort((a, b) => b.mistakes - a.mistakes || b.attempts - a.attempts)
      .slice(0, 3);

    const problematicQuestions = Object.entries(questionData)
      .map(([question, data]) => ({ question: parseInt(question), errorRate: data.attempts > 0 ? Math.round((data.errors / data.attempts) * 100) : 0, attempts: data.attempts }))
      .filter(q => q.attempts >= 1 && q.errorRate > 30)
      .sort((a, b) => b.errorRate - a.errorRate || b.attempts - a.attempts)
      .slice(0, 5);

    const recommendations: string[] = [];
    if (weakestTopics.length > 0) {
      recommendations.push(`Focus on ${weakestTopics[0].topic}, where you made ${weakestTopics[0].mistakes} mistakes.`);
    }
    if (problematicQuestions.length > 0) {
      recommendations.push(`Practice Question ${problematicQuestions[0].question}, which has a ${problematicQuestions[0].errorRate}% error rate.`);
    }
    if (recommendations.length === 0) {
      recommendations.push("Great job! No specific weaknesses found. Keep practicing.");
    }

    let overallTrend = "Stable";
    if (filteredScores.length >= 5) {
      const recentScores = filteredScores.slice(-3).map(s => s.score);
      const olderScores = filteredScores.slice(0, -3).map(s => s.score);
      const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
      if (recentAvg > olderAvg + 1) overallTrend = "Improving";
      if (recentAvg < olderAvg - 1) overallTrend = "Declining";
    }

    setAnalysis({
      weakestTopics,
      problematicQuestions,
      recommendations,
      overallTrend,
    });

    toast({
      title: "Report Generated",
      description: "Your weakness analysis has been updated.",
    });
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "Improving":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "Declining":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <TrendingUp className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "Improving":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "Declining":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      default:
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
    }
  };

  return (
    <section className="glass p-6 rounded-2xl shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Weakness Analysis
        </h2>
        <Button onClick={generateReport} disabled={filteredScores.length === 0}>
          {analysis ? "Regenerate Report" : "Generate Report"}
        </Button>
      </div>

      {analysis ? (
        <div className="space-y-6">
          {/* Overall Trend */}
          <div className={`p-4 rounded-lg border ${getTrendColor(analysis.overallTrend)}`}>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              {getTrendIcon(analysis.overallTrend)} Performance Trend
            </h3>
            <p className="text-sm">
              Your recent performance is <strong>{analysis.overallTrend}</strong> compared to earlier tests.
            </p>
          </div>

          {/* Weakest Topics */}
          {analysis.weakestTopics.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="font-semibold text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Topics Needing Attention
              </h3>
              <div className="space-y-2">
                {analysis.weakestTopics.map((topic, index) => (
                  <div key={topic.topic} className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      #{index + 1} {topic.topic}
                    </span>
                    <div className="text-sm text-red-600 dark:text-red-400">
                      {topic.mistakes} mistakes ({topic.attempts} attempts)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Problematic Questions */}
          {analysis.problematicQuestions.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h3 className="font-semibold text-amber-700 dark:text-amber-300 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                High-Error Questions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {analysis.problematicQuestions.map(q => (
                  <div key={q.question} className="text-sm bg-white dark:bg-gray-800 p-2 rounded border">
                    <span className="font-medium">Question {q.question}</span>
                    <span className="ml-2 text-amber-600 dark:text-amber-400">
                      {q.errorRate}% error rate ({q.attempts} attempts)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Personalized Recommendations
            </h3>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-muted-foreground">No weakness data yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Complete a few tests to generate your personalized report.
          </p>
        </div>
      )}
    </section>
  );
};
