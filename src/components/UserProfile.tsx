import { useState, useEffect } from "react";
import { User, Edit3, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

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
  const [highContrast, setHighContrast] = useState(false);
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
    // Load contrast preference
    setHighContrast(localStorage.getItem("profileHighContrast") === "1");
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
        <Button
          variant="outline"
          size="sm"
          className="gap-2 px-3 py-2 rounded-lg shadow focus:ring-2 focus:ring-primary focus:outline-none transition-all text-base font-semibold"
          style={{ minWidth: 90, alignItems: 'center', display: 'flex' }}
        >
          <span className="text-2xl">{profile.avatar}</span>
          <span className="truncate max-w-[70px]">{profile.username}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className={`max-w-md ${highContrast ? "high-contrast border-4 border-yellow-500 shadow-lg" : ""}`}>
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

          {/* Username Edit */}
          {isEditing ? (
            <div className="space-y-2">
              <input
                className="input input-bordered w-full"
                value={tempUsername}
                onChange={e => setTempUsername(e.target.value)}
                maxLength={24}
                minLength={2}
                placeholder="Enter username"
                autoFocus
              />
              {/* Contrast Toggle - only in edit mode */}
              <div className="flex items-center gap-3 mt-2 mb-1 border-t pt-3">
                <label htmlFor="contrast-toggle" className="text-sm font-semibold mr-2">
                  High Contrast Mode
                </label>
                <button
                  id="contrast-toggle"
                  type="button"
                  aria-pressed={highContrast}
                  onClick={() => {
                    setHighContrast(!highContrast);
                    localStorage.setItem("profileHighContrast", !highContrast ? "1" : "0");
                  }}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary border ${highContrast ? 'bg-yellow-400 border-yellow-600' : 'bg-zinc-300 border-zinc-400'}`}
                  style={{ minWidth: 48 }}
                >
                  <span
                    className={`absolute left-0 top-0 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${highContrast ? 'translate-x-6' : ''}`}
                    style={{ transform: highContrast ? 'translateX(24px)' : 'translateX(0)' }}
                  />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-lg font-semibold mb-2">{profile.username}</div>
          )}

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