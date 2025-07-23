import { useState, useEffect } from "react";
import { User, Edit3, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

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


interface UserProfile {
  username: string;
  avatar: string;
  joinDate: string;
}

export const UserProfile = () => {
  const [profile, setProfile] = useState<UserProfile>({
    username: "Math Enthusiast",
    avatar: "🧑‍🎓",
    joinDate: new Date().toISOString().split("T")[0]
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

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      // First time user, save default profile
      const defaultProfile = {
        username: "Math Enthusiast",
        avatar: "🧑‍🎓",
        joinDate: new Date().toISOString().split("T")[0]
      };
      localStorage.setItem("userProfile", JSON.stringify(defaultProfile));
      setProfile(defaultProfile);
    }
    setUnlockedAvatars(getUnlockedAvatars());
    setCoinBalance(parseInt(localStorage.getItem("coins") || "0"));
    setCoinTransactions((JSON.parse(localStorage.getItem("coinTransactions") || "[]") as any[]).reverse());
    // Listen for coin updates
    const handleCoinUpdate = () => {
      setCoinBalance(parseInt(localStorage.getItem("coins") || "0"));
      setCoinTransactions((JSON.parse(localStorage.getItem("coinTransactions") || "[]") as any[]).reverse());
    };
    window.addEventListener("coinUpdate", handleCoinUpdate);
    return () => {
      window.removeEventListener("coinUpdate", handleCoinUpdate);
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 hover-scale" aria-label="Open user profile dialog">
          <span className="text-xl">{profile.avatar}</span>
          {profile.username}
          <span className="ml-2 px-2 py-1 rounded-full bg-yellow-400/20 text-yellow-600 dark:text-yellow-300 text-xs font-bold flex items-center gap-1">
            <span role="img" aria-label="coin">🪙</span> {coinBalance}
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <User className="w-5 h-5" />
            User Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar Display/Selection */}
          <div className="text-center">
            {isEditing ? (
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 mb-4 p-2 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                {Object.keys(AVATAR_SHOP).map((avatar) => {
                  const isUnlocked = unlockedAvatars.includes(avatar);
                  const price = AVATAR_SHOP[avatar]?.price || 0;
                  return (
                    <button
                      key={avatar}
                      aria-label={`Select avatar ${avatar}${!isUnlocked ? ' (locked)' : ''}`}
                      onClick={() => {
                        if (isUnlocked) {
                          setTempAvatar(avatar);
                        } else {
                          setAvatarToUnlock(avatar);
                          setShowAvatarConfirm(true);
                        }
                      }}
                      className={`text-3xl p-2 rounded-lg transition-all duration-200 relative transform hover:scale-110 ${tempAvatar === avatar ? "bg-primary/20 ring-2 ring-primary scale-110" : "bg-gray-200 dark:bg-gray-700"} ${!isUnlocked ? "opacity-50 cursor-not-allowed" : "hover:bg-secondary"}`}
                      disabled={!isUnlocked && coinBalance < price}
                    >
                      {avatar}
                      {!isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                          <span className="text-xs bg-yellow-300 text-yellow-900 font-bold rounded px-1.5 py-0.5 shadow-md flex items-center gap-1">
                            <span role="img" aria-label="coin">🪙</span> {price}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-7xl mb-4 p-4 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full inline-block shadow-lg">{profile.avatar}</div>
            )}
          </div>

          {/* Avatar unlock confirmation dialog */}
          {showAvatarConfirm && avatarToUnlock && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-xs w-full">
                <div className="text-center text-3xl mb-2">{avatarToUnlock}</div>
                <div className="text-center mb-4 text-lg font-semibold">Unlock this avatar for {AVATAR_SHOP[avatarToUnlock]?.price} coins?</div>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => {
                      const price = AVATAR_SHOP[avatarToUnlock]?.price || 0;
                      if (coinBalance >= price) {
                        // Deduct coins
                        const newBalance = coinBalance - price;
                        localStorage.setItem("coins", newBalance.toString());
                        setCoinBalance(newBalance);
                        // Unlock avatar
                        unlockAvatar(avatarToUnlock);
                        setUnlockedAvatars(getUnlockedAvatars());
                        setTempAvatar(avatarToUnlock);
                        window.dispatchEvent(new CustomEvent('coinUpdate'));
                        setShowAvatarConfirm(false);
                        setAvatarToUnlock(null);
                        // Log transaction
                        const tx = JSON.parse(localStorage.getItem("coinTransactions") || "[]");
                        tx.push({ type: "avatar", amount: -price, date: new Date().toISOString(), note: avatarToUnlock });
                        localStorage.setItem("coinTransactions", JSON.stringify(tx));
                        toast({
                          title: "Avatar Unlocked! 🎉",
                          description: `You have unlocked a new avatar: ${avatarToUnlock}`
                        });
                      }
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    Unlock
                  </Button>
                  <Button
                    variant="outline"
                    aria-label="Cancel avatar unlock"
                    onClick={() => {
                      setShowAvatarConfirm(false);
                      setAvatarToUnlock(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Username change confirmation dialog */}
          {showUsernameConfirm && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-xs w-full">
                <div className="text-center text-2xl mb-2">Change Username</div>
                <div className="text-center mb-4 text-lg font-semibold">
                  Change your username to <span className="font-bold">{pendingUsername}</span> for 20 coins?
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => {
                      if (coinBalance < 20) {
                        toast({
                          title: "Insufficient Coins",
                          description: "You need 20 coins to change your username.",
                          variant: "destructive"
                        });
                        setShowUsernameConfirm(false);
                        setPendingUsername("");
                        return;
                      }
                      // Deduct coins
                      const newBalance = coinBalance - 20;
                      localStorage.setItem("coins", newBalance.toString());
                      setCoinBalance(newBalance);
                      // Save username change
                      saveProfile(pendingUsername, tempAvatar);
                      window.dispatchEvent(new CustomEvent('coinUpdate'));
                      setShowUsernameConfirm(false);
                      setPendingUsername("");
                      // Log transaction
                      const tx = JSON.parse(localStorage.getItem("coinTransactions") || "[]");
                      tx.push({ type: "username", amount: -20, date: new Date().toISOString(), note: `Changed to '${pendingUsername}'` });
                      localStorage.setItem("coinTransactions", JSON.stringify(tx));
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    Change
                  </Button>
                  <Button
                    variant="outline"
                    aria-label="Cancel username change"
                    onClick={() => {
                      setShowUsernameConfirm(false);
                      setPendingUsername("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Coin Transaction History */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2 text-center text-gray-800 dark:text-gray-200">Coin History</h4>
            <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg max-h-32 overflow-y-auto p-2 text-sm space-y-1">
              {coinTransactions.length === 0 ? (
                <div className="text-muted-foreground text-center py-4">No transactions yet. Complete tests to earn coins!</div>
              ) : (
                coinTransactions.map((tx, i) => (
                  <div key={i} className="flex justify-between items-center py-1.5 px-2 rounded-md bg-white dark:bg-gray-900/50">
                    <div>
                      <span className="capitalize font-medium text-gray-800 dark:text-gray-200">{tx.type === "avatar" ? `Avatar Unlock: ${tx.note}` : tx.type === "username" ? "Username Change" : "Test Reward"}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</span>
                    </div>
                    <span className={`font-bold ${tx.amount < 0 ? "text-red-500" : "text-green-500"}`}>{tx.amount > 0 ? "+" : ""}{tx.amount} 🪙</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="text-sm font-medium mb-2 block">Username</label>
            {isEditing ? (
              <Input
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                placeholder="Enter username"
                maxLength={20}
              />
            ) : (
              <div className="p-3 bg-secondary/30 rounded-lg text-center font-medium">
                {profile.username}
              </div>
            )}
          </div>

          {/* Join Date */}
          <div>
            <label className="text-sm font-medium mb-2 block">Member Since</label>
            <div className="p-3 bg-secondary/30 rounded-lg text-center text-muted-foreground">
              {new Date(profile.joinDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button onClick={handleSave} className="flex-1 gap-2" aria-label="Save profile changes">
                  <Save className="w-4 h-4" />
                  Save
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex-1 gap-2" aria-label="Cancel editing profile">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit} className="w-full gap-2" variant="secondary" aria-label="Edit profile">
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
