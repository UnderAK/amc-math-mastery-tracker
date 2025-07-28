import { useState, useEffect, useMemo } from "react";
import { Award } from "lucide-react";
import { TestScore } from "@/types/TestScore";
import { getBadges, Badge, UserStats, calculateLevel } from "@/lib/gamification";

export const BadgesPanel = () => {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const fetchData = () => {
      const scores: TestScore[] = JSON.parse(localStorage.getItem("scores") || "[]");
      const streak = parseInt(localStorage.getItem("streak") || "0");
      const xp = parseInt(localStorage.getItem("xp") || "0");
      const { level } = calculateLevel(xp);

      const scoresWithData = scores.map(s => {
        const totalQuestions = 
          (s.questionCorrectness && Object.keys(s.questionCorrectness).length > 0) 
          ? Object.keys(s.questionCorrectness).length 
          : (s.key && s.key.length > 0) ? s.key.length : 25;
        const bestScore = totalQuestions > 0 ? (s.score / totalQuestions) * 100 : 0;
        return { ...s, totalQuestions, bestScore };
      });

      const topicCorrectCounts = scores.reduce((acc, score) => {
        const topics = score.questionTopics || {};
        const correctness = score.questionCorrectness || {};
        for (const qNum in topics) {
          if (correctness[qNum]) {
            const topic = topics[qNum];
            acc[topic] = (acc[topic] || 0) + 1;
          }
        }
        return acc;
      }, {} as Record<string, number>);

      setStats({
        scores,
        streak,
        xp,
        level,
        totalTests: scores.length,
        bestScore: scoresWithData.length > 0 ? Math.max(...scoresWithData.map(s => s.bestScore)) : 0,
        topicCorrectCounts,
      });
    };

    fetchData();
    window.addEventListener('dataUpdate', fetchData);
    return () => window.removeEventListener('dataUpdate', fetchData);
  }, []);

  const badges = useMemo(() => {
    if (!stats) return [];
    return getBadges(stats);
  }, [stats]);

  const earnedBadges = badges.filter(b => b.earned);
  const unearnedBadges = badges.filter(b => !b.earned).slice(0, 6); // Show next 6 to earn

  return (
    <section className="glass p-6 rounded-2xl shadow-xl hover-lift animate-slide-in-left">
      <h2 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 animate-float" />
        Badges Earned
      </h2>
      
      {stats && badges.some(b => b.earned) ? (
        <div className="space-y-4">
          {/* Earned Badges */}
          {earnedBadges.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-accent mb-3">🏆 Earned ({earnedBadges.length})</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {earnedBadges.map((badge, index) => (
                  <div
                    key={badge.title}
                    className="relative group p-3 bg-accent/10 border border-accent/20 rounded-lg hover-scale hover-bounce text-center animate-bounce-in cursor-pointer"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="text-2xl mb-1 transform group-hover:scale-110 transition-transform duration-200">{badge.emoji}</div>
                    <div className="text-xs font-medium text-accent">{badge.title}</div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-popover border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap text-xs">
                      {badge.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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