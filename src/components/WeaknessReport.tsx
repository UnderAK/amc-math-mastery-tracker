import { useState, useEffect } from "react";
import { AlertTriangle, Target, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface TestScore {
  date: string;
  score: number;
  testType: string;
  year: number;
  // We now use questionTopics and questionCorrectness
  label?: string;
  questionTopics: { [questionNum: number]: string }; // Store topic for ALL 25 questions
  questionCorrectness: { [questionNum: number]: boolean }; // Store correctness for ALL 25 questions
}

interface WeaknessAnalysis {
  weakestTopics: Array<{ topic: string; mistakes: number }>;
  problematicQuestions: Array<{ question: number; errorRate: number; attempts: number }>;
  recommendations: string[];
  overallTrend: string;
}

export const WeaknessReport = () => {
  const [analysis, setAnalysis] = useState<WeaknessAnalysis | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateReport = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const scores: TestScore[] = JSON.parse(localStorage.getItem("scores") || "[]");
      
      if (scores.length === 0) {
        toast({
          title: "No Data Available",
          description: "Complete some tests first to generate a weakness report",
          variant: "destructive",
        });
        setIsGenerating(false);
        setAnalysis(null); // Clear previous analysis if no data
        return;
      }

      const topicData: { [topic: string]: { mistakes: number; attempts: number } } = {};
      const questionData: { [question: number]: { errors: number; attempts: number } } = {};

      scores.forEach(score => {
        // Use the new questionTopics and questionCorrectness fields
        if (score.questionTopics && score.questionCorrectness) {
            for (let i = 1; i <= 25; i++) {
                const topic = score.questionTopics[i];
                const isCorrect = score.questionCorrectness[i];
                const questionNum = i;

                // Topic analysis
                if (!topicData[topic]) topicData[topic] = { mistakes: 0, attempts: 0 };
                topicData[topic].attempts++;
                if (!isCorrect) {
                    topicData[topic].mistakes++;
                }

                // Question analysis
                 if (!questionData[questionNum]) questionData[questionNum] = { errors: 0, attempts: 0 };
                 questionData[questionNum].attempts++;
                 if (!isCorrect) {
                     questionData[questionNum].errors++;
                 }
            }
        } else {
            // Handle older scores that might not have the new data structure
            // For weakness report, we can still use incorrectQuestions if available.
            if (score.incorrectQuestions) {
                 score.incorrectQuestions.forEach(q => {
                    // Approximate topic for older scores if not available
                    const topic = score.questionTopics?.[q] || `Question ${q} Topic`; // Fallback topic name
                    if (!topicData[topic]) topicData[topic] = { mistakes: 0, attempts: 0 };
                    topicData[topic].mistakes++;
                    // We cannot accurately get attempts per topic for older scores, skipping attempts count here.
                 });
            }
             // For problematic questions from older scores, we can still use incorrectQuestions
             if (score.incorrectQuestions) {
                 score.incorrectQuestions.forEach(q => {
                     if (!questionData[q]) questionData[q] = { errors: 0, attempts: 0 };
                     questionData[q].errors++;
                      // We cannot accurately get attempts per question for older scores, skipping attempts count here.
                 });
             }
            console.warn(`Processing score from ${score.date} with old data structure for weakness report.`);
        }
      });

      // Find weakest topics (those with mistakes). Include topics from older data.
      const weakestTopics = Object.entries(topicData)
        .map(([topic, data]) => ({
          topic,
          mistakes: data.mistakes,
          // Cannot calculate accuracy accurately with mixed new/old data, focus on mistakes count
        }))
        .filter(t => t.mistakes > 0)
        .sort((a, b) => b.mistakes - a.mistakes)
        .slice(0, 3);

      // Find problematic questions (from all data, attempts might be approximated for older scores)
      const problematicQuestions = Object.entries(questionData)
        .map(([question, data]) => ({
          question: parseInt(question),
          errorRate: data.attempts > 0 ? Math.round((data.errors / data.attempts) * 100) : (data.errors > 0 ? 100 : 0), // Handle 0 attempts
          attempts: data.attempts > 0 ? data.attempts : (data.errors > 0 ? data.errors : 0), // Approximate attempts if only errors are recorded
        }))
        .filter(q => q.attempts >= 1 && q.errorRate > 30) // Consider questions with at least 1 attempt and > 30% error rate
        .sort((a, b) => b.errorRate - a.errorRate)
        .slice(0, 5);

      // Generate recommendations
      const recommendations: string[] = [];
      
      if (weakestTopics.length > 0) {
        recommendations.push(`Focus on ${weakestTopics[0].topic} - your weakest area with ${weakestTopics[0].mistakes} mistakes recorded.`);
      }
      
      if (problematicQuestions.length > 0) {
        recommendations.push(`Practice question types similar to Q${problematicQuestions[0].question}${problematicQuestions[0].errorRate > 0 ? ` (${problematicQuestions[0].errorRate}% error rate)` : ''}`);
      }

      // Calculate recent vs older scores for trend (using overall score, not topic specific)
      const recentScores = scores.slice(-5);
      const olderScores = scores.slice(0, Math.max(0, scores.length - 5)); // Ensure olderScores is not empty
      const recentAvg = recentScores.reduce((sum, s) => sum + s.score, 0) / (recentScores.length || 1); // Handle division by zero
      const olderAvg = olderScores.length > 0 ? olderScores.reduce((sum, s) => sum + s.score, 0) / olderScores.length : recentAvg; // Handle case with less than 5 scores
      
      let overallTrend = "stable";
      if (recentAvg > olderAvg + 1) overallTrend = "improving";
      else if (recentAvg < olderAvg - 1) overallTrend = "declining";

      // Add trend-based recommendations
      if (overallTrend === "improving") {
        recommendations.push("Great progress! Keep up the current study routine");
      } else if (overallTrend === "declining") {
        recommendations.push("Consider reviewing fundamentals and taking more practice tests");
      } else {
        recommendations.push("Try focusing on specific weak areas to break through the plateau");
      }

      setAnalysis({
        weakestTopics,
        problematicQuestions,
        recommendations,
        overallTrend
      });

      setIsGenerating(false);
      
      toast({
        title: "Report Generated! 📊",
        description: "Your personalized weakness analysis is ready",
      });
    }, 1500); // Simulate analysis time
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving": return "📈";
      case "declining": return "📉";
      default: return "➡️";
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving": return "text-green-600 bg-green-50 dark:bg-green-900/20";
      case "declining": return "text-red-600 bg-red-50 dark:bg-red-900/20";
      default: return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
    }
  };

  // Re-generate report when data updates (after test grading or topic input)
  useEffect(() => {
    generateReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    const handleDataUpdate = () => {
      generateReport();
    };
    window.addEventListener('dataUpdate', handleDataUpdate);
    return () => {
      window.removeEventListener('dataUpdate', handleDataUpdate);
    };
  }, [generateReport]); // Re-run effect if generateReport changes


  return (
    <section className="glass p-6 rounded-2xl shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Weakness Report
        </h2>
        
        <Button 
          onClick={generateReport}
          disabled={isGenerating}
          className="gradient-primary"
        >
          {isGenerating ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Target className="w-4 h-4 mr-2" />
              Generate Report
            </>
          )}
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
                      {topic.mistakes} mistakes
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
                      {q.errorRate}% error rate
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
          <p className="text-muted-foreground mb-4">Generate a personalized weakness report</p>
          <p className="text-sm text-muted-foreground">
            Get insights into your problem areas and recommendations for improvement
          </p>
        </div>
      )}
    </section>
  );
};
