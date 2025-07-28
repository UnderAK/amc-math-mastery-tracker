import { TestScore } from "@/types/TestScore";

export interface Badge {
  emoji: string;
  title: string;
  description: string;
  earned: boolean;
}

export interface UserStats {
  scores: TestScore[];
  streak: number;
  xp: number;
  level: number;
  totalTests: number;
  bestScore: number;
  topicCorrectCounts: Record<string, number>;
}

export const getBadges = (stats: UserStats): Badge[] => {
  const allBadges: Omit<Badge, 'earned'>[] = [
    { emoji: "🌟", title: "First Steps", description: "Take your first test" },
    { emoji: "🎯", title: "Sharp Shooter", description: "Score 60% or more on any test" },
    { emoji: "🧠", title: "High Achiever", description: "Score 80% or more on any test" },
    { emoji: "💯", title: "Perfect Score", description: "Get a perfect 100% score" },
    { emoji: "🥉", title: "3-Day Streak", description: "Practice for 3 consecutive days" },
    { emoji: "🥈", title: "7-Day Streak", description: "Practice for a full week" },
    { emoji: "🥇", title: "30-Day Streak", description: "Practice for a month straight" },
    { emoji: "🔥", title: "100-Day Streak", description: "Legendary dedication!" },
    { emoji: "📚", title: "Dedicated Student", description: "Complete 5 tests" },
    { emoji: "📝", title: "Test Master", description: "Complete 10 tests" },
    { emoji: "🧪", title: "Research Scholar", description: "Complete 25 tests" },
    { emoji: "🎓", title: "Graduate", description: "Complete 50 tests" },
    { emoji: "🏛️", title: "Professor", description: "Complete 100 tests" },
    { emoji: "⚡", title: "Power User", description: "Reach 500 XP" },
    { emoji: "🌟", title: "Rising Star", description: "Reach Level 10" },
    { emoji: "🚀", title: "Level 20 Club", description: "Reach Level 20" },
    { emoji: "🧮", title: "Algebra Whiz", description: "Correctly answer 20 Algebra questions" },
    { emoji: "📐", title: "Geometry Genius", description: "Correctly answer 20 Geometry questions" },
    { emoji: "🎲", title: "Combinatorics Captain", description: "Correctly answer 20 Combinatorics questions" },
    { emoji: "🔢", title: "Number Theory Nerd", description: "Correctly answer 20 Number Theory questions" },
  ];

  const earnedStatus = {
    "First Steps": stats.totalTests > 0,
    "Sharp Shooter": stats.bestScore >= 60,
    "High Achiever": stats.bestScore >= 80,
    "Perfect Score": stats.bestScore === 100,
    "3-Day Streak": stats.streak >= 3,
    "7-Day Streak": stats.streak >= 7,
    "30-Day Streak": stats.streak >= 30,
    "100-Day Streak": stats.streak >= 100,
    "Dedicated Student": stats.totalTests >= 5,
    "Test Master": stats.totalTests >= 10,
    "Research Scholar": stats.totalTests >= 25,
    "Graduate": stats.totalTests >= 50,
    "Professor": stats.totalTests >= 100,
    "Power User": stats.xp >= 500,
    "Rising Star": stats.level >= 10,
    "Level 20 Club": stats.level >= 20,
    "Algebra Whiz": (stats.topicCorrectCounts['Algebra'] || 0) >= 20,
    "Geometry Genius": (stats.topicCorrectCounts['Geometry'] || 0) >= 20,
    "Combinatorics Captain": (stats.topicCorrectCounts['Combinatorics'] || 0) >= 20,
    "Number Theory Nerd": (stats.topicCorrectCounts['Number Theory'] || 0) >= 20,
  };

  const processedBadges = allBadges.map(badge => ({ ...badge, earned: earnedStatus[badge.title] || false }));

  if (stats.scores.length > 1) {
    const latestScore = stats.scores[stats.scores.length - 1];
    const previousScores = stats.scores.slice(0, -1);
    const latestPercentage = (latestScore.score / 25) * 100;
    const previousBest = Math.max(...previousScores.map(s => (s.score / 25) * 100), 0);

    if (latestPercentage > previousBest) {
      processedBadges.push({
        emoji: "⏫",
        title: "New Personal Best",
        description: `Beat your previous best of ${previousBest.toFixed(0)}% with ${latestPercentage.toFixed(0)}%`,
        earned: true
      });
    }
  }

  return processedBadges;
};
