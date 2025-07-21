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
      
      const latestScore = scores.length > 0 ? scores[scores.length - 1].score : 0;
      const bestScore = scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0;
      const totalTests = scores.length;

      const allBadges: Badge[] = [
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
        {
          emoji: "💯",
          title: "Perfect Score",
          description: "Score 25/25 on any test",
          earned: bestScore === 25
        },
        {
          emoji: "🧠",
          title: "High Achiever",
          description: "Score 20+ on any test",
          earned: bestScore >= 20
        },
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