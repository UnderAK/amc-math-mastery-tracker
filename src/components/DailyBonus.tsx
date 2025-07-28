import { useState, useEffect } from "react";
import { Gift, Flame, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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
    if (streak >= 14) return "text-orange-500";
    if (streak >= 7) return "text-blue-500";
    if (streak >= 3) return "text-green-500";
    return "text-muted-foreground";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="glass max-w-sm p-6 border-0 shadow-lg">
        <VisuallyHidden>
          <DialogTitle>Daily Bonus</DialogTitle>
        </VisuallyHidden>
        <div className="text-center space-y-4 animate-fade-in-up">
          <Gift className="w-16 h-16 mx-auto text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-primary">Daily Bonus</h2>
            <p className="text-muted-foreground">Claim your daily reward to maintain your streak!</p>
          </div>

          <div className="flex justify-around items-center">
            {bonusData.streak > 0 && (
              <div className={`text-center`}>
                <p className={`font-bold text-2xl ${getStreakColor(bonusData.streak)} flex items-center justify-center gap-2`}>
                  <Flame className={`w-6 h-6`} />
                  {bonusData.streak}
                </p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            )}
            <div className="text-center">
              <p className="font-bold text-2xl text-primary">{20 + Math.min(bonusData.streak * 5, 50)}</p>
              <p className="text-sm text-muted-foreground">XP Reward</p>
            </div>
          </div>

          <Button 
            onClick={claimDailyBonus}
            className="w-full transition-transform hover:scale-105"
            aria-label="Claim Daily Bonus"
          >
            <Star className="w-4 h-4 mr-2" />
            Claim Reward
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};