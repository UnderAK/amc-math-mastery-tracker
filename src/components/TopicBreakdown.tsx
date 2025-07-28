import { useState, useEffect, useMemo, useCallback } from "react";
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, BookOpen, Target } from "lucide-react";
import { TestScore } from "@/types/TestScore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface TopicStats {
  topic: string;
  correct: number;
  total: number;
  accuracy: number;
  mistakes: number;
}

interface TopicBreakdownProps {
  filterType?: string;
}

export const TopicBreakdown = ({ filterType = "all" }: TopicBreakdownProps) => {
  const [allScores, setAllScores] = useState<TestScore[]>([]);

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
      : allScores.filter(s => s.testType === filterType);
  }, [allScores, filterType]);

  const topicStats = useMemo(() => {
    const topicData: { [topic: string]: { correct: number; total: number; mistakes: number } } = {};
    const possibleTopics = ["Algebra", "Geometry", "Number Theory", "Combinatorics", "Other"];
    possibleTopics.forEach(topic => {
      topicData[topic] = { correct: 0, total: 0, mistakes: 0 };
    });

    filteredScores.forEach(score => {
      if (score.questionTopics && score.questionCorrectness) {
        for (let i = 1; i <= 25; i++) {
          const rawTopic = score.questionTopics[i] || "Other";
          const topic = possibleTopics.includes(rawTopic) ? rawTopic : "Other";
          const isCorrect = score.questionCorrectness[i];

          topicData[topic].total++;
          if (isCorrect) {
            topicData[topic].correct++;
          } else {
            topicData[topic].mistakes++;
          }
        }
      } else {
        for (let i = 1; i <= 25; i++) {
          const topic = "Other";
          topicData[topic].total++;
        }
      }
    });

    const stats: TopicStats[] = possibleTopics.map(topic => ({
      topic,
      correct: topicData[topic].correct,
      total: topicData[topic].total,
      accuracy: topicData[topic].total > 0 ? Math.round(((topicData[topic].correct) / topicData[topic].total) * 100) : 0,
      mistakes: topicData[topic].mistakes
    }));

    return stats.filter(stat => stat.total > 0 || stat.mistakes > 0);
  }, [filteredScores]);

  const hasData = useMemo(() => topicStats.some(stat => stat.total > 0 || stat.mistakes > 0), [topicStats]);

  const { strongestTopics, weakestTopics } = useMemo(() => {
    const sortedByAccuracy = [...topicStats].sort((a, b) => b.accuracy - a.accuracy);
    const sortedByMistakes = [...topicStats].sort((a, b) => b.mistakes - a.mistakes);

    const strongest = sortedByAccuracy
      .filter(t => t.accuracy >= 80 && t.total > 5)
      .slice(0, 2);

    const strongTopicNames = new Set(strongest.map(t => t.topic));

    const weakest = sortedByMistakes
      .filter(t => t.mistakes > 0 && t.total > 5 && !strongTopicNames.has(t.topic))
      .slice(0, 2);

    return { strongestTopics: strongest, weakestTopics: weakest };
  }, [topicStats]);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return "text-green-600 bg-green-50 dark:bg-green-900/20";
    if (accuracy >= 75) return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
    if (accuracy >= 60) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
    return "text-red-600 bg-red-50 dark:bg-red-900/20";
  };

  const getTopicIcon = (topic: string) => {
    switch (topic) {
      case "Algebra": return "📐";
      case "Geometry": return "📏";
      case "Number Theory": return "🧮";
      case "Combinatorics": return "🎯";
      case "Basic Arithmetic": return "➕";
      case "Advanced Topics": return "🧠";
      case "Unknown": return "❓"; // Added icon for Unknown topic
      default: return "📚";
    }
  };

  return (
    <section className="glass p-6 rounded-2xl shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Topic Performance
        </h2>
      </div>

      {hasData ? (
        <div className="space-y-6">
          {/* Quick Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weakestTopics.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  Focus Areas
                </h3>
                <div className="space-y-2">
                  {weakestTopics.map(topic => (
                    <div key={topic.topic} className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        {getTopicIcon(topic.topic)} {topic.topic}
                      </span>
                      {/* Display mistakes count for weakest topics */}
                      <span className="text-sm text-red-600 dark:text-red-400">{topic.mistakes} mistakes</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {strongestTopics.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Strengths
                </h3>
                <div className="space-y-2">
                  {strongestTopics.map(topic => (
                    <div key={topic.topic} className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        {getTopicIcon(topic.topic)} {topic.topic}
                      </span>
                      {/* Display accuracy for strongest topics */}
                      <span className="text-sm text-green-600 dark:text-green-400">{topic.accuracy}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Detailed Topic Breakdown */}
          <div className="space-y-4">
            {topicStats.map((topic, index) => (
              <div 
                key={topic.topic} 
                className="bg-secondary/30 rounded-lg p-4 hover:bg-secondary/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getTopicIcon(topic.topic)}</span>
                    <div>
                      <h3 className="font-medium text-foreground">{topic.topic}</h3>
                      <p className="text-sm text-muted-foreground">
                        {topic.correct}/{topic.total} correct
                        {topic.mistakes > 0 && ` • ${topic.mistakes} mistakes`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {/* Display accuracy if total attempts > 0, otherwise indicate no data */}
                    {topic.total > 0 ? (
                       <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAccuracyColor(topic.accuracy)}`}>
                         {topic.accuracy}%
                       </span>
                    ) : (
                        <span className="px-3 py-1 rounded-full text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800">
                          No Data
                        </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Show progress bar only if there are attempts */}
                  {topic.total > 0 && (
                     <Progress value={topic.accuracy} className="h-2" />
                  )}
                  
                  {/* Show recommendation based on accuracy and attempts */}
                  {topic.total >= 3 && topic.accuracy < 70 && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Recommended for focused practice</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-muted-foreground">No topic data yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Complete some tests and enter topics for all questions to see your performance by topic.
          </p>
        </div>
      )}
    </section>
  );
};
