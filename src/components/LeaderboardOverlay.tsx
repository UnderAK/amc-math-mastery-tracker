import { useEffect, useState } from "react";
import { Trophy, Medal, Crown, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestScore } from "@/types/TestScore";

// TestScore interface is now imported from shared types

interface LeaderEntry {
  name: string;
  score: number;
  xp: number;
  level: number;
  testsTaken: number;
  averageScore: number;
  streak: number;
  bestScoreTotalQuestions: number;
}

interface LeaderboardOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardOverlay = ({ isOpen, onClose }: LeaderboardOverlayProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    // Generate mock leaderboard data with current user
    const scores: TestScore[] = JSON.parse(localStorage.getItem("scores") || "[]");
    const xp = parseInt(localStorage.getItem("xp") || "0");
    const streak = parseInt(localStorage.getItem("streak") || "0");
    
    let bestScore = 0;
    let bestScoreTotalQuestions = 25;
    if (scores.length > 0) {
      const bestScoreTest = scores.reduce((prev, current) => (prev.score > current.score) ? prev : current);
      bestScore = bestScoreTest.score;
      if (bestScoreTest.questionCorrectness && Object.keys(bestScoreTest.questionCorrectness).length > 0) {
        bestScoreTotalQuestions = Object.keys(bestScoreTest.questionCorrectness).length;
      }
    }

    const totalScores = scores.reduce((sum, score) => sum + score.score, 0);
    const totalQuestions = scores.reduce((sum, score) => {
      if (score.questionCorrectness && Object.keys(score.questionCorrectness).length > 0) {
        return sum + Object.keys(score.questionCorrectness).length;
      }
      return sum + 25; // fallback for old data
    }, 0);

    const averageScore = scores.length > 0 ? totalScores / scores.length : 0;

    const currentUser: LeaderEntry = {
      name: "You",
      score: bestScore,
      xp,
      level: Math.floor(xp / 250) + 1,
      testsTaken: scores.length,
      averageScore: averageScore,
      streak,
      bestScoreTotalQuestions: bestScoreTotalQuestions
    };

    // Generate mock competitors
    const mockUsers: LeaderEntry[] = [
      { name: "MathWiz2024", score: 25, xp: 2450, level: 25, testsTaken: 42, averageScore: 22.3, streak: 15, bestScoreTotalQuestions: 25 },
      { name: "AlgebraKing", score: 24, xp: 1890, level: 19, testsTaken: 38, averageScore: 21.8, streak: 8, bestScoreTotalQuestions: 25 },
      { name: "GeometryQueen", score: 23, xp: 1650, level: 17, testsTaken: 35, averageScore: 20.9, streak: 12, bestScoreTotalQuestions: 25 },
      { name: "CalculusNinja", score: 23, xp: 1420, level: 15, testsTaken: 29, averageScore: 20.1, streak: 5, bestScoreTotalQuestions: 25 },
      { name: "NumberCruncher", score: 22, xp: 1200, level: 13, testsTaken: 26, averageScore: 19.5, streak: 7, bestScoreTotalQuestions: 25 },
      { name: "MathMaster", score: 22, xp: 980, level: 10, testsTaken: 22, averageScore: 18.8, streak: 3, bestScoreTotalQuestions: 25 },
      { name: "ProblemSolver", score: 21, xp: 750, level: 8, testsTaken: 18, averageScore: 17.9, streak: 4, bestScoreTotalQuestions: 25 },
      { name: "Mathlete2025", score: 20, xp: 580, level: 6, testsTaken: 15, averageScore: 16.2, streak: 2, bestScoreTotalQuestions: 25 },
    ];

    // Insert current user and sort by XP
    const allUsers = [...mockUsers, currentUser]
      .sort((a, b) => b.xp - a.xp)
      .map((user, index) => ({ ...user, position: index + 1 }));

    setLeaderboard(allUsers);
  }, [isOpen]);

  if (!isOpen) return null;

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500 trophy-glow" />;
      case 2: return <Trophy className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const getRankBg = (position: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return "bg-primary/20 border-primary/50 animate-pulse-glow";
    switch (position) {
      case 1: return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30";
      case 2: return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30";
      case 3: return "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/30";
      default: return "bg-card/50 border-border/50";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass max-w-2xl w-full max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl slide-in-top">
        {/* Header */}
        <div className="gradient-primary p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 trophy-glow" />
              <div>
                <h2 className="text-2xl font-bold">Leaderboard</h2>
                <p className="text-white/80 text-sm">Top performers worldwide</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
              aria-label="Close leaderboard"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Leaderboard Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-3">
            {leaderboard.map((user, index) => {
              const isCurrentUser = user.name === "You";
              const position = index + 1;
              
              return (
                <div
                  key={user.name}
                  className={`
                    flex items-center gap-4 p-4 rounded-2xl border transition-all
                    ${getRankBg(position, isCurrentUser)}
                    hover:scale-[1.02] fade-in-up
                  `}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-12 h-12">
                    {getRankIcon(position)}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                        {user.name}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            YOU
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Zap className="w-3 h-3" />
                        Level {user.level}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.testsTaken} tests • {user.averageScore.toFixed(1)} avg • {user.streak} day streak
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {user.xp.toLocaleString()} XP
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Best: {user.score}/{user.bestScoreTotalQuestions}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-muted/50">
          <div className="text-center text-sm text-muted-foreground">
            <p>Keep practicing to climb the ranks! 🚀</p>
            <p className="mt-1">Rankings update in real-time based on XP and performance.</p>
          </div>
        </div>
      </div>
    </div>
  );
};