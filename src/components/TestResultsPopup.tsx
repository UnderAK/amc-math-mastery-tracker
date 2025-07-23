import { useState } from "react";
import { Trophy, TrendingUp, AlertCircle, Star, Award, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TestResult {
  score: number;
  totalQuestions: number;
  incorrectQuestions: number[];
  testType: string;
  year: number;
  xpEarned: number;
  newBadges: Array<{
    emoji: string;
    title: string;
    description: string;
  }>;
  averagePercentage?: number;
  isPersonalBest?: boolean;
}

interface TestResultsPopupProps {
  result: TestResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TestResultsPopup = ({ result, isOpen, onClose }: TestResultsPopupProps) => {
  if (!result) return null;

  const percentage = result.totalQuestions > 0 ? Math.round((result.score / result.totalQuestions) * 100) : 0;
  
  const getScoreColor = () => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-blue-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-500";
  };

  const getScoreEmoji = () => {
    if (percentage >= 95) return "🏆";
    if (percentage >= 90) return "🥇";
    if (percentage >= 80) return "🥈";
    if (percentage >= 70) return "🥉";
    if (percentage >= 60) return "👍";
    return "💪";
  };

  const getPerformanceMessage = () => {
    if (result.isPersonalBest) return "New Personal Best! 🎉";
    if (result.averagePercentage && percentage > result.averagePercentage) {
      return `Above your average of ${result.averagePercentage.toFixed(1)}%! 📈`;
    }
    if (result.averagePercentage && percentage < result.averagePercentage) {
      return `Below your average of ${result.averagePercentage.toFixed(1)}%`;
    }
    return "Keep practicing to improve! 💪";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="text-6xl">{getScoreEmoji()}</div>
            <h2 className="text-2xl font-bold">Test Complete!</h2>
            <p className="text-muted-foreground">
              {result.testType.toUpperCase()} {result.year}
            </p>
          </div>

          {/* Score Display */}
          <div className="text-center space-y-2">
            <div className={`text-4xl font-bold ${getScoreColor()}`}>
              {result.score}/{result.totalQuestions}
            </div>
            <div className={`text-2xl font-semibold ${getScoreColor()}`}>
              {percentage}%
            </div>
            <div className="text-sm text-muted-foreground">
              {getPerformanceMessage()}
            </div>
          </div>

          {/* XP Earned */}
          <div className="flex items-center justify-center gap-2 p-3 bg-accent/10 rounded-lg">
            <Star className="w-5 h-5 text-accent" />
            <span className="font-medium">+{result.xpEarned} XP Earned!</span>
          </div>

          {/* Missed Questions */}
          {result.incorrectQuestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Missed Questions ({result.incorrectQuestions.length})
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {result.incorrectQuestions.map((q) => (
                  <Badge key={q} variant="destructive" className="justify-center">
                    #{q}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Review these questions to improve your score next time!
              </p>
            </div>
          )}

          {/* Perfect Score */}
          {result.score === result.totalQuestions && (
            <div className="text-center p-4 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-bold text-yellow-800 dark:text-yellow-200">
                Perfect Score!
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Outstanding performance! You got every question right!
              </p>
            </div>
          )}

          {/* New Badges */}
          {result.newBadges.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Award className="w-5 h-5 text-accent" />
                New Badges Earned! ({result.newBadges.length})
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {result.newBadges.map((badge, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-accent/10 border border-accent/20 rounded-lg animate-bounce-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="text-2xl">{badge.emoji}</div>
                    <div>
                      <div className="font-medium text-sm">{badge.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {badge.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Comparison */}
          {result.averagePercentage && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Your Average</div>
                <div className="text-lg font-semibold">
                  {result.averagePercentage.toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">This Test</div>
                <div className={`text-lg font-semibold ${getScoreColor()}`}>
                  {percentage}%
                </div>
              </div>
            </div>
          )}

          {/* Close Button */}
          <Button onClick={onClose} className="w-full" aria-label="Close results popup">
            Continue Practicing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};