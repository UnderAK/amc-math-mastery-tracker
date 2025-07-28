import { useState, useEffect } from "react";
import { X, Trophy, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

export const LevelUpModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [newLevel, setNewLevel] = useState(1);

  useEffect(() => {
    const handleLevelUp = (event: CustomEvent) => {
      if (event.detail && event.detail.newLevel) {
        setNewLevel(event.detail.newLevel);
        setIsOpen(true);

        // Trigger confetti celebration
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        // Additional confetti bursts
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 },
          });
        }, 250);

        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.8 },
          });
        }, 500);
      }
    };

    window.addEventListener('levelUp', handleLevelUp as EventListener);

    return () => {
      window.removeEventListener('levelUp', handleLevelUp as EventListener);
    };
  }, []);

  const closeLevelUpModal = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass max-w-sm w-full rounded-3xl shadow-2xl animate-fade-in-up">
        <div className="bg-primary p-8 rounded-t-3xl text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-100/[0.05] bg-[length:1rem_1rem] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
          <div className="relative z-10">
            <Trophy className="w-20 h-20 mx-auto mb-4 text-amber-300 animate-trophy-glow" />
            <h2 className="text-3xl font-bold text-primary-foreground mb-2">LEVEL UP!</h2>
            <p className="text-lg text-primary-foreground/80">You've reached Level {newLevel}!</p>
          </div>
        </div>

        <div className="p-6 text-center bg-card text-card-foreground rounded-b-3xl">
          <p className="text-muted-foreground mb-4">
            Your dedication is paying off. Keep up the excellent work!
          </p>

          <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-primary mb-3 flex items-center justify-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              Level {newLevel} Perks Unlocked
            </h3>
            <div className="text-sm text-left space-y-2 text-muted-foreground">
              <p className="animate-perk-in-1">✅ Increased XP multiplier</p>
              <p className="animate-perk-in-2">✅ New badge opportunities</p>
              <p className="animate-perk-in-3">✅ Higher leaderboard ranking</p>
              {newLevel >= 10 && <p className="animate-perk-in-4">🌟 Elite status unlocked!</p>}
            </div>
          </div>

          <Button
            onClick={closeLevelUpModal}
            className="w-full transition-transform hover:scale-105"
            aria-label="Continue Journey"
          >
            Continue Journey
          </Button>
        </div>
      </div>
    </div>
  );
};