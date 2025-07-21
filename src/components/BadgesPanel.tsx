import { useState, useEffect } from "react";
import { Award, Trophy, Star, Flame, TrendingUp, Target, BookOpen, Medal } from "lucide-react";

interface Badge {
  emoji: string;
  title: string;
  description: string;
  earned: boolean;
}

interface TestScore {
  date: string;
  score: number;
  testType: string;
  year: number;
}

export const BadgesPanel = () => {
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    const updateBadges = () => {
      const scores: TestScore[] = JSON.parse(localStorage.getItem("scores") || "[]");
      const streak = parseInt(localStorage.getItem("streak") || "0");
      const xp = parseInt(localStorage.getItem("xp") || "0");
      const dailyBonus = JSON.parse(localStorage.getItem("dailyBonus") || '{"streak": 0, "totalBonusClaimed": 0}');
      
      const latestScore = scores.length > 0 ? scores[scores.length - 1].score : 0;
      const bestScore = scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0;
      const totalTests = scores.length;

      const allBadges: Badge[] = [
        // Beginner badges
        {
          emoji: "🌟",
          title: "First Steps",
          description: "Take your first test",
          earned: scores.length > 0
        },
        {
          emoji: "🎯",
          title: "Sharp Shooter",
          description: "Score 15+ on any test",
          earned: bestScore >= 15
        },
        {
          emoji: "🧠",
          title: "High Achiever",
          description: "Score 20+ on any test",
          earned: bestScore >= 20
        },
        {
          emoji: "💯",
          title: "Perfect Score",
          description: "Score 25/25 on any test",
          earned: bestScore === 25
        },

        // Streak badges
        {
          emoji: "🥉",
          title: "3-Day Streak",
          description: "Practice for 3 consecutive days",
          earned: streak >= 3
        },
        {
          emoji: "🥈",
          title: "7-Day Streak",
          description: "Practice for a full week",
          earned: streak >= 7
        },
        {
          emoji: "🥇",
          title: "30-Day Streak",
          description: "Practice for a month straight",
          earned: streak >= 30
        },
        {
          emoji: "🔥",
          title: "100-Day Streak",
          description: "Legendary dedication!",
          earned: streak >= 100
        },

        // Volume badges
        {
          emoji: "📚",
          title: "Dedicated Student",
          description: "Complete 5 tests",
          earned: totalTests >= 5
        },
        {
          emoji: "📝",
          title: "Test Master",
          description: "Complete 10 tests",
          earned: totalTests >= 10
        },
        {
          emoji: "🧪",
          title: "Research Scholar",
          description: "Complete 25 tests",
          earned: totalTests >= 25
        },
        {
          emoji: "🎓",
          title: "Graduate",
          description: "Complete 50 tests",
          earned: totalTests >= 50
        },
        {
          emoji: "🏛️",
          title: "Professor",
          description: "Complete 100 tests",
          earned: totalTests >= 100
        },

        // XP badges
        {
          emoji: "⚡",
          title: "Power User",
          description: "Reach 500 XP",
          earned: xp >= 500
        },
        {
          emoji: "🌟",
          title: "Rising Star",
          description: "Reach Level 10",
          earned: Math.floor(xp / 100) + 1 >= 10
        },
        {
          emoji: "🚀",
          title: "Math Champion",
          description: "Reach Level 25",
          earned: Math.floor(xp / 100) + 1 >= 25
        },
        {
          emoji: "👑",
          title: "Math Royalty",
          description: "Reach Level 50",
          earned: Math.floor(xp / 100) + 1 >= 50
        },

        // Daily bonus badges
        {
          emoji: "🎁",
          title: "Daily Collector",
          description: "Claim daily bonus 7 times",
          earned: dailyBonus.streak >= 7
        },
        {
          emoji: "💰",
          title: "Bonus Hunter",
          description: "Claim 1000 bonus XP total",
          earned: dailyBonus.totalBonusClaimed >= 1000
        },

        // Special achievement badges
        {
          emoji: "🎪",
          title: "Well-Rounded",
          description: "Take tests from all three AMC levels",
          earned: (() => {
            const types = new Set(scores.map(s => s.testType));
            return types.has("amc8") && types.has("amc10") && types.has("amc12");
          })()
        },
        {
          emoji: "💎",
          title: "Diamond Mind",
          description: "Score 23+ on 5 tests",
          earned: scores.filter(s => s.score >= 23).length >= 5
        },
        {
          emoji: "⚗️",
          title: "Perfectionist",
          description: "Get 3 perfect scores",
          earned: scores.filter(s => s.score === 25).length >= 3
        },
        {
          emoji: "🎨",
          title: "Diverse Tester",
          description: "Take tests from 3 different years",
          earned: (() => {
            const years = new Set(scores.map(s => s.year));
            return years.size >= 3;
          })()
        },
        {
          emoji: "🌈",
          title: "Weekend Warrior",
          description: "Take a test on weekend",
          earned: scores.some(s => {
            const date = new Date(s.date);
            const day = date.getDay();
            return day === 0 || day === 6;
          })
        },
        {
          emoji: "🧙‍♂️",
          title: "Quick Learner",
          description: "Score 20+ within first 3 tests",
          earned: scores.slice(0, 3).some(s => s.score >= 20)
        },
        {
          emoji: "🎯",
          title: "Precision Master",
          description: "80%+ average over 10+ tests",
          earned: (() => {
            if (scores.length < 10) return false;
            const average = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
            return (average / 25) >= 0.8;
          })()
        }
      ];

      // Check for improvement badges
      if (scores.length > 1) {
        const prevScore = scores[scores.length - 2].score;
        if (latestScore - prevScore >= 5) {
          allBadges.push({
            emoji: "📈",
            title: "Big Improvement",
            description: "Improve by 5+ points",
            earned: true
          });
        }
        
        if (latestScore === prevScore && latestScore > 0) {
          allBadges.push({
            emoji: "🎯",
            title: "Consistent",
            description: "Same score as previous test",
            earned: true
          });
        }
      }

      // Check for new personal best
      if (latestScore === bestScore && latestScore > 0 && scores.length > 1) {
        allBadges.push({
          emoji: "⏫",
          title: "New Personal Best",
          description: "Beat your previous best score",
          earned: true
        });
      }

      setBadges(allBadges);
    };

    updateBadges();

    // Listen for data updates
    const handleDataUpdate = () => updateBadges();
    window.addEventListener('dataUpdate', handleDataUpdate);

    return () => {
      window.removeEventListener('dataUpdate', handleDataUpdate);
    };
  }, []);

  const earnedBadges = badges.filter(b => b.earned);
  const unearnedBadges = badges.filter(b => !b.earned).slice(0, 6); // Show next 6 to earn

  return (
    <section className="glass p-6 rounded-2xl shadow-xl">
      <h2 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
        <Award className="w-5 h-5" />
        Badges Earned
      </h2>
      
      {earnedBadges.length > 0 ? (
        <div className="space-y-4">
          {/* Earned Badges */}
          <div>
            <h3 className="text-sm font-medium text-accent mb-3">🏆 Earned ({earnedBadges.length})</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {earnedBadges.map((badge, index) => (
                <div
                  key={badge.title}
                  className="relative group p-3 bg-accent/10 border border-accent/20 rounded-lg hover-scale text-center animate-bounce-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-2xl mb-1">{badge.emoji}</div>
                  <div className="text-xs font-medium text-accent">{badge.title}</div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-popover border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap text-xs">
                    {badge.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Badges to Earn */}
          {unearnedBadges.length > 0 && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">🎯 Next to Earn</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {unearnedBadges.map((badge) => (
                  <div
                    key={badge.title}
                    className="relative group p-3 bg-muted/20 border border-muted rounded-lg hover-scale text-center opacity-60"
                  >
                    <div className="text-2xl mb-1 grayscale">{badge.emoji}</div>
                    <div className="text-xs font-medium text-muted-foreground">{badge.title}</div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-popover border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap text-xs">
                      {badge.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🏆</div>
          <p className="text-muted-foreground">No badges yet</p>
          <p className="text-sm text-muted-foreground mt-1">Start taking tests to earn your first badge!</p>
        </div>
      )}
    </section>
  );
};