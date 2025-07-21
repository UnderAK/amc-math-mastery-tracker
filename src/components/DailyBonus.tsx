import { useState, useEffect } from "react";
import { Gift, Flame, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="glass p-4 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Gift className="w-4 h-4 text-accent" />
          Daily Bonus
        </h3>
        {bonusData.streak > 0 && (
          <div className={`flex items-center gap-1 text-sm font-medium ${getStreakColor(bonusData.streak)}`}>
            <Flame className="w-4 h-4" />
            {bonusData.streak}
          </div>
        )}
      </div>

      {canClaim ? (
        <Button 
          onClick={claimDailyBonus}
          className="w-full gradient-primary hover-bounce gap-2"
          size="sm"
        >
          <Star className="w-4 h-4" />
          Claim Bonus ({20 + Math.min(bonusData.streak * 5, 50)} XP)
        </Button>
      ) : (
        <div className="text-center space-y-2">
          <div className="text-2xl">{getStreakEmoji(bonusData.streak)}</div>
          <div className="text-sm text-muted-foreground">
            Next bonus in {timeUntilNext}
          </div>
          {bonusData.streak > 0 && (
            <div className="text-xs text-muted-foreground">
              {bonusData.streak} day streak
            </div>
          )}
        </div>
      )}

      {bonusData.totalBonusClaimed > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground text-center">
          Total bonus XP: {bonusData.totalBonusClaimed}
        </div>
      )}
    </div>
  );
};