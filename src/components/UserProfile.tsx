import { useState, useEffect } from "react";
import { User, Edit3, Save, X, Download, Upload, ExternalLink } from "lucide-react";
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
  shwProfile?: string;
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
  const [tempShwProfile, setTempShwProfile] = useState("");
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
        joinDate: new Date().toISOString().split("T")[0],
        shwProfile: ""
      };
      localStorage.setItem("userProfile", JSON.stringify(defaultProfile));
      setProfile(defaultProfile);
    }
  }, []);

  const handleEdit = () => {
    setTempUsername(profile.username);
    setTempAvatar(profile.avatar);
    setTempShwProfile(profile.shwProfile || "");
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
      avatar: tempAvatar,
      shwProfile: tempShwProfile.trim()
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
    setTempShwProfile("");
  };

  const handleExportData = () => {
    const scores = localStorage.getItem("scores") || "[]";
    const xp = localStorage.getItem("xp") || "0";
    const streak = localStorage.getItem("streak") || "0";
    const dailyBonus = localStorage.getItem("dailyBonus") || "{}";
    
    const exportData = {
      profile,
      scores: JSON.parse(scores),
      xp: parseInt(xp),
      streak: parseInt(streak),
      dailyBonus: JSON.parse(dailyBonus),
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `amc-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported! 📊",
      description: "Your AMC tracker data has been downloaded"
    });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        if (importedData.profile) {
          localStorage.setItem("userProfile", JSON.stringify(importedData.profile));
          setProfile(importedData.profile);
        }
        
        if (importedData.scores) {
          localStorage.setItem("scores", JSON.stringify(importedData.scores));
        }
        
        if (importedData.xp !== undefined) {
          localStorage.setItem("xp", importedData.xp.toString());
        }
        
        if (importedData.streak !== undefined) {
          localStorage.setItem("streak", importedData.streak.toString());
        }
        
        if (importedData.dailyBonus) {
          localStorage.setItem("dailyBonus", JSON.stringify(importedData.dailyBonus));
        }

        // Trigger data update for other components
        window.dispatchEvent(new CustomEvent('dataUpdate'));
        window.dispatchEvent(new CustomEvent('profileUpdate'));
        
        toast({
          title: "Data Imported! 🎉",
          description: "Your AMC tracker data has been restored"
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Invalid file format. Please select a valid export file.",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="gap-2 hover-scale px-5 py-3 rounded-full shadow-md border-2 border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/60 transition-all duration-150"
          style={{ minWidth: 120, minHeight: 48, fontWeight: 600, fontSize: 18 }}
          aria-label="Open user profile"
        >
          <span className="text-2xl mr-2">{profile.avatar}</span>
          <User className="w-5 h-5 mr-1" />
          <span className="truncate max-w-[80px]">{profile.username}</span>
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
          {/* Settings Page (in popup) */}
          <div className="border rounded-2xl p-4 mb-4 bg-muted/10">
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">⚙️ Settings</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-medium">Theme:</span>
                <Button size="sm" variant="outline" onClick={() => {
                  const isDark = document.documentElement.classList.toggle('dark');
                  localStorage.setItem('theme', isDark ? 'dark' : 'light');
                }}>
                  Toggle Dark/Light
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium">Reset All Data:</span>
                <Button size="sm" variant="destructive" onClick={() => {
                  if (window.confirm('Are you sure you want to reset all your data? This cannot be undone.')) {
                    localStorage.clear();
                    window.dispatchEvent(new CustomEvent('dataUpdate'));
                  }
                }}>
                  Reset
                </Button>
              </div>
            </div>
          </div>
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

          {/* SHW Profile */}
          <div>
            <label className="text-sm font-medium mb-2 block">SHW Profile</label>
            {isEditing ? (
              <Input
                value={tempShwProfile}
                onChange={(e) => setTempShwProfile(e.target.value)}
                placeholder="Enter your SHW username"
                maxLength={50}
              />
            ) : (
              <div className="p-3 bg-secondary/30 rounded-lg text-center">
                {profile.shwProfile ? (
                  <a 
                    href={`https://discord.gg/schoolhouse-world`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center justify-center gap-2"
                  >
                    {profile.shwProfile} <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">No SHW profile linked</span>
                )}
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

          {/* Data Management */}
          {!isEditing && (
            <div className="space-y-3">
              <label className="text-sm font-medium mb-2 block">Data Management</label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleExportData}
                  className="flex-1 gap-2"
                  size="sm"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => document.getElementById('import-file')?.click()}
                  className="flex-1 gap-2"
                  size="sm"
                >
                  <Upload className="w-4 h-4" />
                  Import Data
                </Button>
              </div>
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </div>
          )}

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