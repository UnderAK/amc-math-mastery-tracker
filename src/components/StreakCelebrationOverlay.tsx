import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export const StreakCelebrationOverlay = () => {
  const [show, setShow] = useState<null | "fire" | "sad">(null);
  const [streak, setStreak] = useState(0);
  const [prevStreak, setPrevStreak] = useState(0);

  useEffect(() => {
    const onFire = (e: any) => {
      setShow("fire");
      setStreak(e.detail?.streak || 1);
      // Fire confetti burst (orange/yellow)
      confetti({
        particleCount: 180,
        spread: 100,
        origin: { y: 0.7 },
        colors: ["#ff9800", "#ffd600", "#ff3d00", "#fff176"]
      });
      setTimeout(() => setShow(null), 3500);
    };
    const onSad = (e: any) => {
      setShow("sad");
      setPrevStreak(e.detail?.prevStreak || 0);
      // Sad blue/gray explosion
      confetti({
        particleCount: 200,
        spread: 140,
        origin: { y: 0.7 },
        colors: ["#90a4ae", "#607d8b", "#bdbdbd", "#1976d2"],
        scalar: 1.3
      });
      setTimeout(() => setShow(null), 4000);
    };
    window.addEventListener('streakCelebration', onFire);
    window.addEventListener('streakBroken', onSad);
    return () => {
      window.removeEventListener('streakCelebration', onFire);
      window.removeEventListener('streakBroken', onSad);
    };
  }, []);

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border-4 border-yellow-400 dark:border-yellow-700 rounded-3xl shadow-2xl px-10 py-8 flex flex-col items-center animate-pop-in">
        {show === "fire" && (
          <>
            <div className="text-7xl mb-3 animate-bounce">🔥</div>
            <div className="text-2xl font-extrabold text-yellow-600 mb-2">Streak Started!</div>
            <div className="text-lg font-semibold text-yellow-700 mb-2">Keep it up for daily rewards!</div>
            <div className="text-base text-yellow-900">Current Streak: <b>{streak}</b></div>
          </>
        )}
        {show === "sad" && (
          <>
            <div className="text-7xl mb-3 animate-pulse">💥</div>
            <div className="text-2xl font-extrabold text-blue-700 mb-2">Streak Broken!</div>
            <div className="text-lg font-semibold text-blue-900 mb-2">Oh no! Your streak of <b>{prevStreak}</b> is over.</div>
            <div className="text-base text-blue-800">Try again tomorrow and rebuild your streak!</div>
          </>
        )}
      </div>
    </div>
  );
};
