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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass max-w-sm w-full rounded-3xl shadow-2xl animate-bounce-in">
        {/* Animated Background */}
        <div className="gradient-primary p-8 rounded-t-3xl text-center relative overflow-hidden animate-pulse-glow">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-2 left-4 animate-bounce">⭐</div>
            <div className="absolute top-4 right-6 animate-bounce delay-200">✨</div>
            <div className="absolute bottom-3 left-6 animate-bounce delay-300">🎉</div>
            <div className="absolute bottom-2 right-4 animate-bounce delay-100">🌟</div>
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 animate-bounce delay-500">🌠</div>
          </div>
          
          <div className="relative z-10">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-white trophy-glow animate-bounce" />
            <h2 className="text-2xl font-bold text-white mb-2">🎉 Level Up!</h2>
            <div className="flex items-center justify-center gap-2 text-white/90">
              <Zap className="w-5 h-5" />
              <span className="text-lg">You reached Level {newLevel}!</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-3 animate-pulse">{newLevel}</div>
            <p className="text-muted-foreground">
              Keep up the excellent work! Your dedication to mathematics is paying off.
            </p>
          </div>

          {/* Level Rewards Info */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-accent mb-2 flex items-center justify-center gap-2">
              <Star className="w-4 h-4" />
              Level {newLevel} Perks
            </h3>
            <div className="text-sm space-y-1">
              <p>• Increased XP multiplier</p>
              <p>• New badge opportunities</p>
              <p>• Higher leaderboard ranking</p>
              {newLevel >= 10 && <p>• 🌟 Elite status unlocked!</p>}
            </div>
          </div>

          <Button
            onClick={closeLevelUpModal}
            className="w-full gradient-primary hover-bounce"
            aria-label="Continue Journey"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Continue Journey
          </Button>
        </div>
      </div>
    </div>
  );
};