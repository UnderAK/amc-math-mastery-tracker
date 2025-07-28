import { useState, useEffect } from "react";
import { Gift, Flame, Calendar, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface DailyBonusData {
  lastClaimed: string;
  streak: number;
  totalBonusClaimed: number;
}

export const DailyBonus = () => {
  const [bonusData, setBonusData] = useState<DailyBonusData>({
    lastClaimed: "",
    streak: 0,
    totalBonusClaimed: 0
  });
  const [isOpen, setIsOpen] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const updateBonusStatus = () => {
      const saved = localStorage.getItem("dailyBonus");
      const data: DailyBonusData = saved ? JSON.parse(saved) : {
        lastClaimed: "",
        streak: 0,
        totalBonusClaimed: 0
      };

      setBonusData(data);

      const today = new Date().toISOString().split("T")[0];
      const canClaimToday = data.lastClaimed !== today;
      setCanClaim(canClaimToday);
      setIsOpen(canClaimToday); // Show popup when can claim

      if (!canClaimToday) {
        // Calculate time until next claim
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const now = new Date();
        const timeDiff = tomorrow.getTime() - now.getTime();
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeUntilNext(`${hours}h ${minutes}m`);
      }
    };

    updateBonusStatus();
    const interval = setInterval(updateBonusStatus, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const claimDailyBonus = () => {
    if (!canClaim) return;

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Calculate streak
    let newStreak = 1;
    if (bonusData.lastClaimed === yesterdayStr) {
      newStreak = bonusData.streak + 1;
    }

    // Calculate bonus XP (base 20 + streak bonus)
    const bonusXP = 20 + Math.min(newStreak * 5, 50); // Max 70 XP per day

    // Update XP
    const currentXP = parseInt(localStorage.getItem("xp") || "0");
    const newXP = currentXP + bonusXP;
    localStorage.setItem("xp", newXP.toString());

    // Update bonus data
    const updatedBonusData: DailyBonusData = {
      lastClaimed: today,
      streak: newStreak,
      totalBonusClaimed: bonusData.totalBonusClaimed + bonusXP
    };

    setBonusData(updatedBonusData);
    localStorage.setItem("dailyBonus", JSON.stringify(updatedBonusData));
    setCanClaim(false);
    setIsOpen(false); // Hide popup after claiming

    // Check for level up
    const newLevel = Math.floor(newXP / 100) + 1;
    const currentLevel = Math.floor(currentXP / 100) + 1;
    if (newLevel > currentLevel) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('levelUp', { detail: { newLevel } }));
      }, 1000);
    }

    toast({
      title: `Daily Bonus Claimed! 🎁`,
      description: `+${bonusXP} XP earned! ${newStreak > 1 ? `${newStreak} day streak!` : ''}`,
    });

    // Trigger data refresh
    window.dispatchEvent(new CustomEvent('dataUpdate'));
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "text-purple-500";
    if (streak >= 14) return "text-orange-500";
    if (streak >= 7) return "text-blue-500";
    if (streak >= 3) return "text-green-500";
    return "text-gray-500";
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return "👑";
    if (streak >= 14) return "🔥";
    if (streak >= 7) return "⚡";
    if (streak >= 3) return "🌟";
    return "✨";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-sm p-0 border-0 bg-transparent shadow-none dark:bg-transparent">
        <div className="bg-background/80 dark:bg-background/60 backdrop-blur-xl rounded-2xl shadow-2xl animate-fade-in-up overflow-hidden border dark:border-border/20">
          <div className="p-8 text-center relative bg-gradient-to-br from-primary/10 to-transparent">
            <div className="absolute inset-0 bg-grid-slate-100/[0.05] dark:bg-grid-slate-900/[0.2] bg-[length:1rem_1rem] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
            <div className="relative z-10">
              <Gift className="w-20 h-20 mx-auto mb-4 text-amber-300 animate-trophy-glow" />
              <h2 className="text-3xl font-bold text-primary mb-1">Daily Bonus</h2>
              <p className="text-muted-foreground">Claim your daily reward!</p>
            </div>
          </div>

          <div className="p-6 text-center">
            {bonusData.streak > 0 && (
              <div className={`mb-4 animate-perk-in-1`}>
                <p className="font-semibold text-lg flex items-center justify-center gap-2">
                  <Flame className={`w-6 h-6 ${getStreakColor(bonusData.streak)}`} />
                  {bonusData.streak} Day Streak!
                </p>
                <p className="text-sm text-muted-foreground">Your consistency is paying off!</p>
              </div>
            )}

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 animate-perk-in-2">
              <p className="text-sm text-muted-foreground">Today's Reward</p>
              <p className="text-2xl font-bold text-primary">{20 + Math.min(bonusData.streak * 5, 50)} XP</p>
            </div>

            <Button 
              onClick={claimDailyBonus}
              className="w-full transition-transform hover:scale-105 animate-perk-in-3"
              aria-label="Claim Daily Bonus"
            >
              <Star className="w-4 h-4 mr-2" />
              Claim Reward
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};