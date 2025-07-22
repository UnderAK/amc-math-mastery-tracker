import { useState, useEffect } from "react";
import { User, Edit3, Save, X, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CoinSystem, AVATAR_SHOP, USERNAME_CHANGE_COST } from "@/utils/coinSystem";
import { CoinBalance } from "./CoinBalance";
import { AvatarShop } from "./AvatarShop";

const AVATAR_OPTIONS = [
  "🧑‍🎓", "👨‍🎓", "👩‍🎓", "🤓", "🧠", "🦸‍♂️", "🦸‍♀️", "🥸", "😎", "🤗",
  "🐱", "🐶", "🦊", "🐨", "🐼", "🦁", "🐸", "🐧", "🦉", "🦄",
  "⭐", "💎", "🏆", "👑", "🎯", "🚀", "💪", "🔥", "⚡", "🌟"
];

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
  }, []);

  const handleEdit = () => {
    setTempUsername(profile.username);
    setTempAvatar(profile.avatar);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (tempUsername.trim().length < 2) {
      toast({
        title: "Invalid Username",
        description: "Username must be at least 2 characters long",
        variant: "destructive"
      });
      return;
    }

    const updatedProfile = {
      ...profile,
      username: tempUsername.trim(),
      avatar: tempAvatar
    };

    setProfile(updatedProfile);
    localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
    setIsEditing(false);

    toast({
      title: "Profile Updated! ✨",
      description: "Your profile has been saved successfully"
    });

    // Trigger data update for other components
    window.dispatchEvent(new CustomEvent('profileUpdate'));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempUsername("");
    setTempAvatar("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 hover-scale">
          <span className="text-lg">{profile.avatar}</span>
          <User className="w-4 h-4" />
          {profile.username}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            User Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar Display/Selection */}
          <div className="text-center">
            <div className="text-6xl mb-4">{isEditing ? tempAvatar : profile.avatar}</div>
            
            {isEditing && (
              <div className="grid grid-cols-6 gap-2 mb-4">
                {AVATAR_OPTIONS.map((avatar) => (
                  <button
                    key={avatar}
                    onClick={() => setTempAvatar(avatar)}
                    className={`text-2xl p-2 rounded-lg hover:bg-secondary transition-colors ${
                      tempAvatar === avatar ? "bg-primary/20 ring-2 ring-primary" : ""
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            )}
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
                <Button onClick={handleSave} className="flex-1 gap-2">
                  <Save className="w-4 h-4" />
                  Save
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex-1 gap-2">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit} className="w-full gap-2">
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