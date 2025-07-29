import { useState, useEffect } from "react";
import { UserProfileData } from '@/types/amc';

import { Switch } from '@/components/ui/switch';
import { User, Edit3, Save, X, ShoppingCart, Coins, Calendar, ChevronsRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// Avatar shop configuration
const AVATAR_SHOP: { [avatar: string]: { price: number } } = {
  "🧑‍🎓": { price: 0 }, "👨‍🎓": { price: 0 }, "👩‍🎓": { price: 0 }, "🤓": { price: 10 }, "🧠": { price: 10 },
  "🦸‍♂️": { price: 20 }, "🦸‍♀️": { price: 20 }, "🥸": { price: 20 }, "😎": { price: 20 }, "🤗": { price: 10 },
  "🐱": { price: 10 }, "🐶": { price: 10 }, "🦊": { price: 15 }, "🐨": { price: 15 }, "🐼": { price: 15 },
  "🦁": { price: 15 }, "🐸": { price: 15 }, "🐧": { price: 15 }, "🦉": { price: 15 }, "🦄": { price: 25 },
  "⭐": { price: 20 }, "💎": { price: 25 }, "🏆": { price: 30 }, "👑": { price: 30 }, "🎯": { price: 20 },
  "🚀": { price: 25 }, "💪": { price: 20 }, "🔥": { price: 20 }, "⚡": { price: 20 }, "🌟": { price: 25 }
};

function getUnlockedAvatars(): string[] {
  const unlocked = JSON.parse(localStorage.getItem("unlockedAvatars") || "[]");
  // Default avatars are always unlocked
  return Array.from(new Set(["🧑‍🎓", "👨‍🎓", "👩‍🎓", ...unlocked]));
}

function unlockAvatar(avatar: string) {
  const unlocked = getUnlockedAvatars();
  if (!unlocked.includes(avatar)) {
    unlocked.push(avatar);
    localStorage.setItem("unlockedAvatars", JSON.stringify(unlocked));
  }
}




interface UserProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfile = ({ isOpen, onClose }: UserProfilePopupProps) => {
  const [profile, setProfile] = useState<UserProfileData>({
    username: "Math Enthusiast",
    avatar: "🧑‍🎓",
    joinDate: new Date().toISOString().split("T")[0],
    xp: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const [tempAvatar, setTempAvatar] = useState("");
  const [coinBalance, setCoinBalance] = useState<number>(parseInt(localStorage.getItem("coins") || "0"));
  const [unlockedAvatars, setUnlockedAvatars] = useState<string[]>(getUnlockedAvatars());
  const [coinTransactions, setCoinTransactions] = useState<any[]>([]);
  const [showAvatarConfirm, setShowAvatarConfirm] = useState(false);
  const [avatarToUnlock, setAvatarToUnlock] = useState<string | null>(null);
  const [showUsernameConfirm, setShowUsernameConfirm] = useState(false);
  const [pendingUsername, setPendingUsername] = useState("");
  const { toast } = useToast();
  const [isGuest, setIsGuest] = useState(false);


  useEffect(() => {
    const updateData = () => {
      const savedProfile = localStorage.getItem("userProfile");
      const currentXp = parseInt(localStorage.getItem('xp') || '0', 10);

      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile({ ...parsedProfile, xp: currentXp });
      } else {
        const defaultProfile = {
          username: "Math Enthusiast",
          avatar: "🧑‍🎓",
          joinDate: new Date().toISOString().split("T")[0],
          xp: currentXp
        };
        localStorage.setItem("userProfile", JSON.stringify(defaultProfile));
        setProfile(defaultProfile);
      }
      
      setIsGuest(sessionStorage.getItem('isGuest') === 'true');
      setUnlockedAvatars(getUnlockedAvatars());
      setCoinBalance(parseInt(localStorage.getItem("coins") || "0"));
      setCoinTransactions((JSON.parse(localStorage.getItem("coinTransactions") || "[]") as any[]).reverse());
    };

    updateData(); // Initial load

    window.addEventListener("dataUpdate", updateData);

    return () => {
      window.removeEventListener("dataUpdate", updateData);
    };
  }, []);

  const handleEdit = () => {
    setTempUsername(profile.username);
    setTempAvatar(profile.avatar);
    setIsEditing(true);
  };

  function saveProfile(newUsername: string, newAvatar: string) {
    const updatedProfile = {
      ...profile,
      username: newUsername,
      avatar: newAvatar
    };
    setProfile(updatedProfile);
    localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
    setIsEditing(false);
    toast({
      title: "Profile Updated! ✨",
      description: "Your profile has been saved successfully"
    });
    window.dispatchEvent(new CustomEvent('profileUpdate'));
  }

  const handleSave = () => {
    if (tempUsername.trim() !== profile.username) {
      // Username is being changed, require coins
      setPendingUsername(tempUsername.trim());
      setShowUsernameConfirm(true);
      return;
    }
    // Avatar-only change
    saveProfile(tempUsername.trim(), tempAvatar);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempUsername("");
    setTempAvatar("");
  };

  const StatItem = ({ icon, value, label }: { icon: React.ReactNode, value: string | number, label: string }) => (
    <div className="group relative bg-primary/5 p-4 rounded-lg flex items-center space-x-4 transition-all duration-300 hover:bg-primary/10 hover:shadow-lg hover:-translate-y-1">
      <div className="bg-primary/10 p-3 rounded-full transition-colors duration-300 group-hover:bg-primary/20">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-primary transition-colors duration-300">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass max-w-lg p-6 border-0 shadow-lg">
        <VisuallyHidden>
          <DialogTitle>User Profile</DialogTitle>
        </VisuallyHidden>
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex items-center space-x-4">
            <div className={`text-6xl p-2 bg-secondary rounded-full inline-block`}>
              {isEditing ? tempAvatar : profile.avatar}
            </div>
            <div className="flex-grow">
              {isEditing ? (
                <Input
                  type="text"
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  className="text-center"
                  placeholder="Enter username"
                />
              ) : (
                <h2 className="text-2xl font-bold text-primary">{profile.username}</h2>
              )}
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Member since {profile.joinDate}
              </p>
            </div>
          </div>

          <div className="p-0 space-y-6">
            {isEditing ? (
              <div>
                <h3 className="text-lg font-semibold text-primary mb-3 text-center flex items-center justify-center gap-2"><ShoppingCart className="w-5 h-5"/> Avatar Shop</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">Unlock new looks with your coins!</p>
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 mb-4 p-3 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20">
                  {Object.keys(AVATAR_SHOP).map((avatar) => {
                    const isUnlocked = unlockedAvatars.includes(avatar);
                    const isSelected = tempAvatar === avatar;
                    const price = AVATAR_SHOP[avatar as keyof typeof AVATAR_SHOP].price;

                    return (
                      <button
                        key={avatar}
                        disabled={!isUnlocked && coinBalance < price}
                        onClick={() => {
                          if (isUnlocked) {
                            setTempAvatar(avatar);
                          } else {
                            setAvatarToUnlock(avatar);
                            setShowAvatarConfirm(true);
                          }
                        }}
                        className={`relative aspect-square rounded-lg flex items-center justify-center text-3xl transition-all duration-200 
                          ${isSelected ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                          ${!isUnlocked ? 'bg-muted/50' : 'bg-secondary hover:bg-muted'}
                          ${!isUnlocked && coinBalance < price ? 'opacity-50 cursor-not-allowed' : ''}`
                        }
                      >
                        {avatar}
                        {!isUnlocked && (
                          <div className="absolute inset-0 bg-background/60 rounded-lg flex items-center justify-center text-foreground text-xs font-bold">
                            <Coins className="w-3 h-3 mr-1"/> {price}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatItem icon={<Star className="w-6 h-6 text-primary" />} value={profile.xp.toLocaleString()} label="Experience Points" />
                <StatItem icon={<Coins className="w-6 h-6 text-primary" />} value={coinBalance.toLocaleString()} label="Coins" />
              </div>
            )}

            {/* Avatar unlock confirmation dialog */}
            {showAvatarConfirm && avatarToUnlock && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
                <div className="bg-background rounded-lg shadow-lg p-6 max-w-xs w-full border border-border animate-fade-in-up">
                  <div className="text-center text-5xl mb-3">{avatarToUnlock}</div>
                  <div className="text-center mb-4 text-lg font-semibold">Unlock this avatar for {AVATAR_SHOP[avatarToUnlock]?.price} coins?</div>
                  <div className="flex gap-3 justify-center">
                    <Button
                      aria-label={`Unlock ${avatarToUnlock} for ${AVATAR_SHOP[avatarToUnlock!].price} coins`}
                      onClick={() => {
                        const price = AVATAR_SHOP[avatarToUnlock!].price;
                        if (coinBalance < price) {
                          toast({ title: "Not enough coins!", description: "Complete more tests to earn coins.", variant: "destructive" });
                          setShowAvatarConfirm(false);
                          setAvatarToUnlock(null);
                          return;
                        }
                        const newBalance = coinBalance - price;
                        localStorage.setItem("coins", newBalance.toString());
                        setCoinBalance(newBalance);
                        unlockAvatar(avatarToUnlock!);
                        setUnlockedAvatars(getUnlockedAvatars());
                        saveProfile(profile.username, avatarToUnlock!);
                        window.dispatchEvent(new CustomEvent('coinUpdate'));
                        setShowAvatarConfirm(false);
                        setAvatarToUnlock(null);
                        const tx = JSON.parse(localStorage.getItem("coinTransactions") || "[]");
                        tx.push({ type: "avatar", amount: -price, date: new Date().toISOString(), note: avatarToUnlock! });
                        localStorage.setItem("coinTransactions", JSON.stringify(tx));
                      }}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground flex-1"
                    >
                      <Coins className="w-4 h-4 mr-2"/> Unlock
                    </Button>
                    <Button
                      variant="outline"
                      aria-label="Cancel avatar unlock"
                      onClick={() => {
                        setShowAvatarConfirm(false);
                        setAvatarToUnlock(null);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Username change confirmation dialog */}
            {showUsernameConfirm && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
                <div className="bg-background rounded-lg shadow-lg p-6 max-w-xs w-full border border-border animate-fade-in-up">
                  <div className="text-center text-2xl mb-2">Change Username</div>
                  <div className="text-center mb-4 text-lg font-semibold">
                    Change to <span className="font-bold text-primary">{pendingUsername}</span> for 20 coins?
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button
                      aria-label="Confirm username change"
                      onClick={() => {
                        if (coinBalance < 20) {
                          toast({ title: "Not enough coins!", description: "You need 20 coins to change your username.", variant: "destructive" });
                          setShowUsernameConfirm(false);
                          setPendingUsername("");
                          return;
                        }
                        const newBalance = coinBalance - 20;
                        localStorage.setItem("coins", newBalance.toString());
                        setCoinBalance(newBalance);
                        saveProfile(pendingUsername, tempAvatar);
                        window.dispatchEvent(new CustomEvent('coinUpdate'));
                        setShowUsernameConfirm(false);
                        setPendingUsername("");
                        const tx = JSON.parse(localStorage.getItem("coinTransactions") || "[]");
                        tx.push({ type: "username", amount: -20, date: new Date().toISOString(), note: `Changed to '${pendingUsername}'` });
                        localStorage.setItem("coinTransactions", JSON.stringify(tx));
                      }}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1"
                    >
                      <Coins className="w-4 h-4 mr-2"/> Change
                    </Button>
                    <Button
                      variant="outline"
                      aria-label="Cancel username change"
                      onClick={() => {
                        setShowUsernameConfirm(false);
                        setPendingUsername("");
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Coin Transaction History */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-2 text-center flex items-center justify-center gap-2"><ChevronsRight className="w-5 h-5"/> Coin History</h3>
              <div className="bg-primary/5 dark:bg-primary/10 rounded-xl max-h-36 overflow-y-auto p-2 text-sm space-y-1 border border-primary/20">
                {coinTransactions.length === 0 ? (
                  <div className="text-muted-foreground text-center py-4">No transactions yet. Complete tests to earn coins!</div>
                ) : (
                  coinTransactions.map((tx, i) => (
                    <div key={i} className="flex justify-between items-center py-1.5 px-3 rounded-md bg-background/50 dark:bg-background/80">
                      <div>
                        <span className="capitalize font-medium text-foreground">{tx.type === "avatar" ? `Avatar: ${tx.note}` : tx.type === "username" ? "Username Change" : "Test Reward"}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</span>
                      </div>
                      <span className={`font-bold ${tx.amount < 0 ? "text-destructive" : "text-accent"}`}>{tx.amount > 0 ? "+" : ""}{tx.amount} 🪙</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border/20">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} className="flex-1 gap-2 transition-transform hover:scale-105">
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel} className="flex-1 gap-2 transition-transform hover:scale-105">
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit} className="w-full gap-2 transition-transform hover:scale-105" variant="outline">
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </Button>
              )}
              {isGuest && (
                <Button
                  onClick={() => {
                    sessionStorage.removeItem('isGuest');
                    window.location.href = '/';
                  }}
                  className="w-full gap-2 transition-transform hover:scale-105 mt-2"
                  variant="default"
                >
                  <User className="w-4 h-4" />
                  Login / Sign Up
                </Button>
              )}
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};
