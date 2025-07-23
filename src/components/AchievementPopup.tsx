import React, { useEffect } from "react";

interface Achievement {
  emoji: string;
  title: string;
  description: string;
}

interface AchievementPopupProps {
  achievements: Achievement[];
  onClose: () => void;
  visible: boolean;
}

export const AchievementPopup: React.FC<AchievementPopupProps> = ({ achievements, onClose, visible }) => {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [visible, onClose]);

  if (!visible || achievements.length === 0) return null;

  return (
    <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-zinc-900 border border-accent shadow-2xl rounded-xl p-6 flex flex-col items-center animate-fade-in-up">
      <h3 className="text-lg font-bold mb-2 text-emerald-600 flex items-center gap-2">
        🏆 Achievements Unlocked!
      </h3>
      <div className="flex flex-wrap gap-4 justify-center mb-2">
        {achievements.map((ach, idx) => (
          <div key={ach.title + idx} className="flex flex-col items-center px-2">
            <span className="text-3xl mb-1">{ach.emoji}</span>
            <span className="font-semibold text-accent text-sm text-center">{ach.title}</span>
            <span className="text-xs text-muted-foreground text-center">{ach.description}</span>
          </div>
        ))}
      </div>
      <button onClick={onClose} className="mt-2 text-xs text-blue-600 underline" aria-label="Dismiss achievements popup">Dismiss</button>
    </div>
  );
};
