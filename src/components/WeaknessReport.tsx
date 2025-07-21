import { useState, useEffect } from "react";
import { AlertTriangle, Target, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface TestScore {
  date: string;
  score: number;
  testType: string;
  year: number;
  topicMistakes?: { [topic: string]: number };
  incorrectQuestions?: number[];
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
        return;
      }

      // Analyze topic weaknesses using stored topicMistakes
      const topicData: { [topic: string]: { mistakes: number; attempts: number } } = {};
      // Analyze topic weaknesses using stored topicMistakes
      const topicData: { [topic: string]: { mistakes: number; attempts: number } } = {};
      const questionData: { [question: number]: { errors: number; attempts: number } } = {};

      scores.forEach(score => {
        // Topic analysis using saved topicMistakes
        // Topic analysis using saved topicMistakes
        if (score.topicMistakes) {
          Object.entries(score.topicMistakes).forEach(([topic, mistakes]) => {
            if (!topicData[topic]) topicData[topic] = { mistakes: 0, attempts: 0 };
            if (!topicData[topic]) topicData[topic] = { mistakes: 0, attempts: 0 };
            topicData[topic].mistakes += mistakes;
            // We are focusing on topics with mistakes, so attempts calculation is simplified
            topicData[topic].attempts++; 
          });
        }

        // Question analysis
        if (score.incorrectQuestions) {
          score.incorrectQuestions.forEach(q => {
            if (!questionData[q]) questionData[q] = { errors: 0, attempts: 0 };
            questionData[q].errors++;
          });
        }

        // Count total attempts per question for error rate calculation
        for (let i = 1; i <= 25; i++) {
          if (!questionData[i]) questionData[i] = { errors: 0, attempts: 0 };
           // Only increment attempts if the test had this question number
           // This is a simplified approach; a more robust solution would track which questions were presented in each test.
           // For now, we assume all tests cover questions 1-25 for attempt counting.
          questionData[i].attempts++;
        }
      });

      // Find weakest topics (those with mistakes)
      const weakestTopics = Object.entries(topicData)
        .map(([topic, data]) => ({
          topic,
          mistakes: data.mistakes,
        }))
        .filter(t => t.mistakes > 0)
        .sort((a, b) => b.mistakes - a.mistakes)
        .slice(0, 3);

      // Find problematic questions
      const problematicQuestions = Object.entries(questionData)
        .map(([question, data]) => ({
          question: parseInt(question),
          errorRate: data.attempts > 0 ? Math.round((data.errors / data.attempts) * 100) : 0,
          errorRate: data.attempts > 0 ? Math.round((data.errors / data.attempts) * 100) : 0,
          attempts: data.attempts
        }))
        .filter(q => q.attempts >= 3 && q.errorRate > 30)
        .sort((a, b) => b.errorRate - a.errorRate)
        .slice(0, 5);

      // Generate recommendations
      const recommendations: string[] = [];
      
      if (weakestTopics.length > 0) {
        recommendations.push(`Focus on ${weakestTopics[0].topic} - your weakest area with ${weakestTopics[0].mistakes} mistakes recorded.`);
      }
      
      if (problematicQuestions.length > 0) {
        recommendations.push(`Practice question types similar to Q${problematicQuestions[0].question}${problematicQuestions[0].errorRate > 0 ? ` (${problematicQuestions[0].errorRate}% error rate)` : ''}`);
        recommendations.push(`Practice question types similar to Q${problematicQuestions[0].question}${problematicQuestions[0].errorRate > 0 ? ` (${problematicQuestions[0].errorRate}% error rate)` : ''}`);
      }

      // Calculate recent vs older scores for trend
      const recentScores = scores.slice(-5);
      const olderScores = scores.slice(0, Math.max(0, scores.length - 5)); // Ensure olderScores is not empty
      const olderScores = scores.slice(0, Math.max(0, scores.length - 5)); // Ensure olderScores is not empty
      const recentAvg = recentScores.reduce((sum, s) => sum + s.score, 0) / recentScores.length;
      const olderAvg = olderScores.length > 0 ? olderScores.reduce((sum, s) => sum + s.score, 0) / olderScores.length : recentAvg; // Handle case with less than 5 scores
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

