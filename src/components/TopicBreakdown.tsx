import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, AlertTriangle, BookOpen, Target } from "lucide-react";
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
  const [topicStats, setTopicStats] = useState<TopicStats[]>([]);
  const [relevantStats, setRelevantStats] = useState<TopicStats[]>([]); // Declare relevantStats here

  // Function to determine topic based on question number (can be refined) - Used as a fallback or for older data approximation
  const getDefaultTopicForQuestion = (questionNum: number): string => {
    if (questionNum <= 5) return "Algebra";
    if (questionNum <= 10) return "Geometry";
    if (questionNum <= 15) return "Number Theory";
    if (questionNum <= 20) return "Combinatorics";
    return "Other";
  };

  useEffect(() => {
    const updateTopicStats = () => {
      const scores: TestScore[] = JSON.parse(localStorage.getItem("scores") || "[]");
      const filteredScores = filterType === "all" 
        ? scores 
        : scores.filter(s => s.testType === filterType);

      const topicData: { [topic: string]: { correct: number; total: number; mistakes: number } } = {};
      
       // Define all possible topics to ensure they are initialized (exactly 5 topics)
      const possibleTopics = ["Algebra", "Geometry", "Number Theory", "Combinatorics", "Other"];
      possibleTopics.forEach(topic => {
        topicData[topic] = { correct: 0, total: 0, mistakes: 0 };
      });

      console.log('DEBUG TopicBreakdown: Processing scores:', filteredScores.length);
      
      filteredScores.forEach((score, scoreIndex) => {
        console.log(`DEBUG TopicBreakdown: Processing score ${scoreIndex}:`, {
          date: score.date,
          hasQuestionTopics: !!score.questionTopics,
          hasQuestionCorrectness: !!score.questionCorrectness,
          questionTopics: score.questionTopics
        });
        
        // Prioritize new data structure
        if (score.questionTopics && score.questionCorrectness) {
            console.log('DEBUG TopicBreakdown: Using new data structure');
            for (let i = 1; i <= 25; i++) {
                const topic = score.questionTopics[i] || "Other"; // Assign 'Other' if topic is missing
                const isCorrect = score.questionCorrectness[i];
                
                if (i <= 5) { // Only log first 5 questions to avoid spam
                  console.log(`DEBUG TopicBreakdown: Q${i} - Topic: ${topic}, Correct: ${isCorrect}`);
                }

                // Ensure topic exists in initialized data or add it
                if (!topicData[topic]) {
                     topicData[topic] = { correct: 0, total: 0, mistakes: 0 };
                     console.warn(`Dynamically adding topic: ${topic}`);
                }
                
                topicData[topic].total++;
                if (isCorrect) {
                    topicData[topic].correct++;
                } else {
                    topicData[topic].mistakes++;
                }
            }
        } else if (score.incorrectQuestions) {
            // Handle older scores with incorrectQuestions (approximate topic and attempts)
            // This approach is less accurate for total attempts per topic as it only counts incorrect questions.
            score.incorrectQuestions.forEach(qNum => {
                 // Attempt to get a topic for the incorrect question (might be a rough approximation)
                 const topic = score.topicMistakes?.[getDefaultTopicForQuestion(qNum)] !== undefined 
                                ? getDefaultTopicForQuestion(qNum) : `Question ${qNum} Topic (Approx.)`; // Fallback
                
                // Ensure topic exists in initialized data or add it
                if (!topicData[topic]) {
                     topicData[topic] = { correct: 0, total: 0, mistakes: 0 };
                     console.warn(`Dynamically adding topic (from old data): ${topic}`);
                }

                topicData[topic].mistakes++;
                 // We cannot accurately determine total attempts per topic for older data
                 // Skipping attempt count for older data to avoid misleading totals
            });
             console.warn(`Processing score from ${score.date} with old data structure for topic breakdown (approximate data).`);
        } else {
              console.warn(`Skipping score from ${score.date} for topic breakdown due to missing data.`);
               // Handle scores with completely missing topic data by assigning them to 'Other'
               for (let i = 1; i <= 25; i++) {
                   const topic = "Other";
                    if (!topicData[topic]) {
                      topicData[topic] = { correct: 0, total: 0, mistakes: 0 };
                    }
                    topicData[topic].total++;
                    // We don't know correctness, so we can't increment correct or mistakes based on question number
               }
        }
      });

      // Calculate stats
      const stats: TopicStats[] = Object.entries(topicData).map(([topic, data]) => ({
            topic,
            correct: data.correct,
            total: data.total,
            // Calculate accuracy only if total attempts > 0, otherwise 0%
            accuracy: data.total > 0 ? Math.round(((data.correct) / data.total) * 100) : 0,
            mistakes: data.mistakes
      }));

      // Filter out topics with no attempts and no mistakes
      const relevantStatsData = stats.filter(stat => stat.total > 0 || stat.mistakes > 0);

      setTopicStats(relevantStatsData); // Update topicStats state
      setRelevantStats(relevantStatsData); // Update relevantStats state
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
  // Display topics that have at least one attempt OR at least one mistake
  const displayTopics = topicStats
    .filter(stat => stat.total > 0 || stat.mistakes > 0);

  // Weakest topics: Filter for topics with mistakes and sort by mistake count (descending)
  const weakestTopics = displayTopics
    .filter(stat => stat.mistakes > 0)
    .sort((a, b) => b.mistakes - a.mistakes)
    .slice(0, 2);

  // Strongest topics: Filter for topics with at least 3 attempts and sort by accuracy (descending)
   const strongestTopics = displayTopics
    .filter(stat => stat.total >= 3) // Require at least 3 attempts for a topic to be considered a strength
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
