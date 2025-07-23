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
  avatar: string;
}

interface LeaderboardOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- Podium Component for Top 3 ---
const PodiumEntry = ({ user, rank }: { user: LeaderEntry; rank: number }) => {
  const rankStyles = {
    1: {
      container: "h-48 md:h-56 bg-gradient-to-b from-yellow-400/50 to-yellow-600/50 border-yellow-500 shadow-yellow-500/30",
      avatarSize: "w-20 h-20 md:w-24 md:h-24",
      rankIcon: <Crown className="w-8 h-8 text-yellow-300 drop-shadow-lg" />,
      name: "text-xl md:text-2xl font-bold text-white",
      xp: "text-yellow-200",
    },
    2: {
      container: "h-40 md:h-48 bg-gradient-to-b from-gray-400/40 to-gray-500/40 border-gray-400 shadow-gray-400/20",
      avatarSize: "w-16 h-16 md:w-20 md:h-20",
      rankIcon: <Trophy className="w-6 h-6 text-gray-200" />,
      name: "text-lg md:text-xl font-semibold text-white/90",
      xp: "text-gray-200",
    },
    3: {
      container: "h-40 md:h-48 bg-gradient-to-b from-amber-600/40 to-amber-700/40 border-amber-600 shadow-amber-600/20",
      avatarSize: "w-16 h-16 md:w-20 md:h-20",
      rankIcon: <Medal className="w-6 h-6 text-amber-300" />,
      name: "text-lg md:text-xl font-semibold text-white/90",
      xp: "text-amber-200",
    },
  }[rank];

  return (
    <div className={`relative flex flex-col items-center justify-end w-1/3 p-2 rounded-t-2xl border-b-4 transition-all duration-300 ease-in-out transform hover:-translate-y-2 ${rankStyles.container}`}>
      <div className="absolute top-2 right-2">{rankStyles.rankIcon}</div>
      <img src={user.avatar} alt={user.name} className={`rounded-full border-4 border-white/20 shadow-lg ${rankStyles.avatarSize}`} />
      <h3 className={`mt-2 truncate w-full text-center ${rankStyles.name}`}>{user.name}</h3>
      <p className={`font-bold ${rankStyles.xp}`}>{user.xp.toLocaleString()} XP</p>
    </div>
  );
};

// --- List Item for Ranks 4+ ---
const LeaderboardItem = ({ user, rank, isCurrentUser }: { user: LeaderEntry; rank: number; isCurrentUser: boolean }) => (
  <div
    className={`flex items-center gap-4 p-3 rounded-xl border transition-all hover:bg-primary/10 ${isCurrentUser ? 'bg-primary/20 border-primary/50 animate-pulse-glow' : 'bg-card/50 border-border/50'}`}>
    <div className="flex items-center justify-center w-8 font-bold text-lg text-muted-foreground">{rank}</div>
    <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border-2 border-white/10" />
    <div className="flex-1 min-w-0">
      <h4 className={`font-semibold truncate ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>{user.name}</h4>
      <p className="text-sm text-muted-foreground">Level {user.level} • {user.averageScore.toFixed(1)} avg</p>
    </div>
    <div className="text-right">
      <p className="font-bold text-lg text-foreground">{user.xp.toLocaleString()} XP</p>
      <p className="text-xs text-muted-foreground">Best: {user.score}/{user.bestScoreTotalQuestions}</p>
    </div>
  </div>
);

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

    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const currentUserAvatar = userProfile.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Casper';

    const currentUser: LeaderEntry = {
      name: "You",
      score: bestScore,
      xp,
      level: Math.floor(xp / 250) + 1,
      testsTaken: scores.length,
      averageScore: averageScore,
      streak,
      bestScoreTotalQuestions: bestScoreTotalQuestions,
      avatar: currentUserAvatar,
    };

    // Generate mock competitors with cool avatars
    const mockUsers: LeaderEntry[] = [
      { name: "MathWiz", score: 25, xp: 2450, level: 25, testsTaken: 42, averageScore: 22.3, streak: 15, bestScoreTotalQuestions: 25, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Max' },
      { name: "AlgebraKing", score: 24, xp: 1890, level: 19, testsTaken: 38, averageScore: 21.8, streak: 8, bestScoreTotalQuestions: 25, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo' },
      { name: "GeoQueen", score: 23, xp: 1650, level: 17, testsTaken: 35, averageScore: 20.9, streak: 12, bestScoreTotalQuestions: 25, avatar: 'https://api.dicebear.com/7.x/female/svg?seed=Zoe' },
      { name: "CalculusNinja", score: 23, xp: 1420, level: 15, testsTaken: 29, averageScore: 20.1, streak: 5, bestScoreTotalQuestions: 25, avatar: 'https://api.dicebear.com/7.x/ninja/svg?seed=Toby' },
      { name: "NumberCrunch", score: 22, xp: 1200, level: 13, testsTaken: 26, averageScore: 19.5, streak: 7, bestScoreTotalQuestions: 25, avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=Rocky' },
      { name: "MathMaster", score: 22, xp: 980, level: 10, testsTaken: 22, averageScore: 18.8, streak: 3, bestScoreTotalQuestions: 25, avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Milo' },
      { name: "ProblemSolver", score: 21, xp: 750, level: 8, testsTaken: 18, averageScore: 17.9, streak: 4, bestScoreTotalQuestions: 25, avatar: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=Simon' },
      { name: "Mathlete", score: 20, xp: 580, level: 6, testsTaken: 15, averageScore: 16.2, streak: 2, bestScoreTotalQuestions: 25, avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Loki' },
    ];

    // Combine user with mock data
    const allUsers = [...mockUsers, currentUser];

    // Sort by XP to find the top player
    const sortedUsers = allUsers.sort((a, b) => b.xp - a.xp);

    // Keep the top player fixed, and shuffle the rest
    const topPlayer = sortedUsers[0];
    const otherPlayers = sortedUsers.slice(1);

    // Fisher-Yates shuffle algorithm
    for (let i = otherPlayers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [otherPlayers[i], otherPlayers[j]] = [otherPlayers[j], otherPlayers[i]];
    }

    // Reconstruct the leaderboard and assign ranks
    const finalLeaderboard = [topPlayer, ...otherPlayers]
      .map((user, index) => ({ ...user, rank: index + 1 }));

    setLeaderboard(finalLeaderboard);
  }, [isOpen]);

  if (!isOpen) return null;

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
        <div className="p-6 bg-background/80 max-h-[70vh] overflow-y-auto">
          {leaderboard.length > 0 && (
            <div className="relative flex justify-center items-end gap-2 md:gap-4 px-4 pt-12 pb-8">
              {/* Podium: 2nd Place */}
              {leaderboard[1] && <PodiumEntry user={leaderboard[1]} rank={2} />}
              {/* Podium: 1st Place */}
              {leaderboard[0] && <PodiumEntry user={leaderboard[0]} rank={1} />}
              {/* Podium: 3rd Place */}
              {leaderboard[2] && <PodiumEntry user={leaderboard[2]} rank={3} />}
            </div>
          )}

          <div className="space-y-2 px-2">
            {leaderboard.slice(3).map((user, index) => {
              const isCurrentUser = user.name === "You";
              return <LeaderboardItem key={user.name} user={user} rank={index + 4} isCurrentUser={isCurrentUser} />;
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