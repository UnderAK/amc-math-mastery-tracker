import { useState, useEffect } from "react";
import { BookOpen, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface TestScore {
  date: string;
  score: number;
  testType: string;
  year: number;
  input?: string;
  key?: string;
  incorrectQuestions?: number[];
  topicMistakes?: { [topic: string]: number };
  questionTopics?: { [questionNum: number]: string }; // Added field to store topic for all questions
}

interface TopicStats {
  topic: string;
  correct: number;
  total: number;
  accuracy: number;
  mistakes: number;
}

export const TopicBreakdown = () => {
  const [topicStats, setTopicStats] = useState<TopicStats[]>([]);
  const [filterType, setFilterType] = useState("all");

  // Function to determine topic based on question number (can be refined)
  const getTopicForQuestion = (questionNum: number): string => {
    if (questionNum <= 5) return "Basic Arithmetic";
    if (questionNum <= 10) return "Algebra";
    if (questionNum <= 15) return "Geometry";
    if (questionNum <= 20) return "Number Theory";
    return "Advanced Topics";
  };

  useEffect(() => {
    const updateTopicStats = () => {
      const scores: TestScore[] = JSON.parse(localStorage.getItem("scores") || "[]");
      const filteredScores = filterType === "all" 
        ? scores 
        : scores.filter(s => s.testType === filterType);

      const topicData: { [topic: string]: { correct: number; total: number; mistakes: number } } = {};
      
      // Initialize topic data structure with 0s
      const allTopics = ["Basic Arithmetic", "Algebra", "Geometry", "Number Theory", "Combinatorics", "Advanced Topics", "Other"];
      allTopics.forEach(topic => {
        topicData[topic] = { correct: 0, total: 0, mistakes: 0 };
      });

      filteredScores.forEach(score => {
        // Count attempts and correct answers by topic
        // We use questionTopics if available, otherwise fallback to getTopicForQuestion
        for (let i = 1; i <= 25; i++) {
          const topic = score.questionTopics?.[i] || getTopicForQuestion(i);
          if (!topicData[topic]) topicData[topic] = { correct: 0, total: 0, mistakes: 0 }; // Ensure topic exists
          topicData[topic].total++;
          
          if (score.input && score.key && score.input[i-1] === score.key[i-1]) {
            topicData[topic].correct++;
          }
        }

        // Add mistake data from topicMistakes (overwrites correct/total if topicMistakes is more accurate)
        // Keeping this for compatibility, but questionTopics approach is preferred.
        if (score.topicMistakes) {
          Object.entries(score.topicMistakes).forEach(([topic, mistakes]) => {
            if (topicData[topic]) {
              topicData[topic].mistakes += mistakes;
              // If using topicMistakes, accuracy calculation should ideally rely on this
              // However, without a 'total attempted' for topicMistakes entries, we stick to the questionTopics total
            }
          });
        }
      });

      // Calculate stats only if there's any data
      const stats: TopicStats[] = Object.keys(topicData).length > 0 
        ? Object.entries(topicData).map(([topic, data]) => ({
            topic,
            correct: data.correct,
            total: data.total,
            accuracy: data.total > 0 ? Math.round(((data.correct) / data.total) * 100) : 0, // Use correct for accuracy
            mistakes: data.mistakes
          }))
        : [];

      // Filter out topics with no attempts unless they have mistakes recorded
      const relevantStats = stats.filter(stat => stat.total > 0 || stat.mistakes > 0);

      setTopicStats(relevantStats);
    };

    updateTopicStats();

    const handleDataUpdate = () => updateTopicStats();
    window.addEventListener('dataUpdate', handleDataUpdate);

    return () => {
      window.removeEventListener('dataUpdate', handleDataUpdate);
    };
  }, [filterType]);

  const hasData = topicStats.some(stat => stat.total > 0 || stat.mistakes > 0);
  
  // Filter and sort topics for display
  const displayTopics = topicStats
    .filter(stat => stat.total >= 1 || stat.mistakes > 0); // Show if at least one attempt or any mistakes

  const weakestTopics = displayTopics
    .filter(stat => stat.total >= 3 && stat.accuracy < 70) // Consider topics with at least 3 attempts and < 70% accuracy as weak
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 2);

  const strongestTopics = displayTopics
    .filter(stat => stat.total >= 3 && stat.accuracy >= 80) // Consider topics with at least 3 attempts and >= 80% accuracy as strong
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 2);

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
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tests</SelectItem>
            <SelectItem value="amc8">AMC 8</SelectItem>
            <SelectItem value="amc10">AMC 10</SelectItem>
            <SelectItem value="amc12">AMC 12</SelectItem>
          </SelectContent>
        </Select>
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
                      <span className="text-sm text-red-600 dark:text-red-400">{topic.accuracy}%</span>
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
                      <span className="text-sm text-green-600 dark:text-green-400">{topic.accuracy}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Detailed Topic Breakdown */}
          <div className="space-y-4">
            {relevantStats.map((topic, index) => (
              <div 
                key={topic.topic} 
                className="bg-secondary/30 rounded-lg p-4 hover:bg-secondary/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getTopicIcon(topic.topic)}</span>
                    <div>
                      <h3 className="font-medium text-foreground">{topic.topic}</h3>
                      {/* We can only show mistakes, not total correct, with current data structure */}
                      <p className="text-sm text-muted-foreground">
                        {topic.correct}/{topic.total} correct
                        {topic.mistakes > 0 && ` • ${topic.mistakes} mistakes`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAccuracyColor(topic.accuracy)}`}>
                      {topic.accuracy}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress value={topic.accuracy} className="h-2" />
                  
                  {topic.accuracy < 70 && topic.total >= 3 && (
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
            Complete some tests and enter topics for incorrect questions to see your performance by topic
          </p>
        </div>
      )}
    </section>
  );
};
