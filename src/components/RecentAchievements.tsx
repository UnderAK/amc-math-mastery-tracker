import { useState, useEffect } from "react";

export const RecentAchievements = () => {
  const [badges, setBadges] = useState<string[]>([]);

  useEffect(() => {
    const earned = JSON.parse(localStorage.getItem("earnedBadges") || "[]");
    setBadges(earned.slice(-3).reverse()); // Show up to 3 most recent
  }, []);

  if (!badges.length) return null;

  return (
    <div className="glass p-4 rounded-2xl shadow-xl text-center animate-float mb-4">
      <h3 className="text-lg font-semibold text-primary mb-2">Recent Achievements</h3>
      <div className="flex flex-wrap justify-center gap-3">
        {badges.map((b, i) => (
          <span key={i} className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-200 px-3 py-1 rounded-full font-semibold shadow">
            {b}
          </span>
        ))}
      </div>
    </div>
  );
};
