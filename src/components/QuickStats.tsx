import { useState, useEffect } from "react";

export const QuickStats = () => {
  const [stats, setStats] = useState({ tests: 0, avg: 0, streak: 0, xp: 0 });

  useEffect(() => {
    // Function to update stats from localStorage
    const updateStats = () => {
      const scores = JSON.parse(localStorage.getItem("scores") || "[]");
      const xp = Number(localStorage.getItem("xp") || 0);
      const streak = Number(localStorage.getItem("streak") || 0);
      let avg = 0;
      if (scores.length) {
        avg = Math.round(scores.reduce((sum, s) => sum + (s.score || 0), 0) / scores.length);
      }
      setStats({ tests: scores.length, avg, streak, xp });
    };

    updateStats();

    // Listen for custom event to update stats
    window.addEventListener('storageUpdated', updateStats);

    // Cleanup listener
    return () => {
      window.removeEventListener('storageUpdated', updateStats);
    };
  }, []);

  return (
    <div className="glass p-4 rounded-2xl shadow text-center mb-4 animate-float">
      <h3 className="text-lg font-semibold text-primary mb-2">Your Quick Stats</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><span className="font-bold text-xl">{stats.tests}</span><br />Tests Taken</div>
        <div><span className="font-bold text-xl">{stats.avg}</span><br />Avg Score</div>
        <div><span className="font-bold text-xl">{stats.streak}</span><br />Current Streak</div>
        <div><span className="font-bold text-xl">{stats.xp}</span><br />XP</div>
      </div>
    </div>
  );
};
