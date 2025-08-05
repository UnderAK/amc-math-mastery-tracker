import { useState, useEffect } from "react";
import { UserProfileData } from '@/types/amc';
import { Avatar as AvatarType, avatars } from '@/data/avatars';
import { useScoringMode } from '@/context/SettingsContext';
import { User as AuthUser } from '@supabase/supabase-js';
import { User, Edit3, Save, X, ShoppingCart, Coins, Calendar, Star, Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AvatarShop } from './AvatarShop';
import { useToast } from "@/hooks/use-toast";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { supabase } from '@/lib/supabaseClient';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface UserProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfile = ({ isOpen, onClose }: UserProfilePopupProps) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [profile, setProfile] = useState<UserProfileData>({
    username: "Guest",
    avatar: "avatar-01",
    joinDate: new Date().toISOString().split("T")[0],
    xp: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const [tempAvatar, setTempAvatar] = useState("");
  const [coinBalance, setCoinBalance] = useState(0);
  const [unlockedAvatars, setUnlockedAvatars] = useState<string[]>(['avatar-01']);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const { toast } = useToast();
  const { scoringMode, setScoringMode } = useScoringMode();

  const handleClearCache = () => {
    toast({ title: 'Cache Cleared', description: 'The application will now reload.' });
    setTimeout(() => {
      window.location.reload();
    }, 1000); // Delay to allow toast to be seen
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthUser(user);
      setIsGuest(!user);

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, avatar_url, created_at, coin_balance, unlocked_avatars')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          setProfile({
            username: profileData.username || 'Math Enthusiast',
            avatar: avatars.find(a => a.id === profileData.avatar_url)?.emoji || '🧑‍🚀',
            joinDate: new Date(profileData.created_at).toISOString().split('T')[0],
            xp: parseInt(localStorage.getItem('xp') || '0', 10)
          });
          setCoinBalance(profileData.coin_balance || 0);
          setUnlockedAvatars(profileData.unlocked_avatars || ['avatar-01']);
        }
      } else {
        setProfile({
            username: "Guest",
            avatar: "🧑‍🚀",
            joinDate: new Date().toISOString().split("T")[0],
            xp: 0
        });
        setCoinBalance(0);
        setUnlockedAvatars(['avatar-01']);
      }
    };

    if (isOpen) {
        fetchUserData();
    }
    window.addEventListener('coinUpdate', fetchUserData);

    return () => {
      window.removeEventListener('coinUpdate', fetchUserData);
    };
  }, [isOpen]);

  const handlePurchaseAvatar = async (avatar: AvatarType) => {
    if (!authUser) return;
    const newBalance = coinBalance - avatar.price;
    if (newBalance < 0) {
      toast({ title: 'Not enough coins!', variant: 'destructive' });
      return;
    }

    const newUnlockedAvatars = [...unlockedAvatars, avatar.id];
    const { error } = await supabase
      .from('profiles')
      .update({ coin_balance: newBalance, unlocked_avatars: newUnlockedAvatars })
      .eq('id', authUser.id);

    if (error) {
      toast({ title: 'Purchase failed', description: error.message, variant: 'destructive' });
    } else {
      setCoinBalance(newBalance);
      setUnlockedAvatars(newUnlockedAvatars);
      toast({ title: 'Purchase Successful!', description: `You've unlocked ${avatar.name}.` });
      window.dispatchEvent(new CustomEvent('coinUpdate'));
    }
  };

  const handleEdit = () => {
    setTempUsername(profile.username);
    setTempAvatar(profile.avatar);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!authUser) return;

    const { error } = await supabase
      .from('profiles')
      .update({ username: tempUsername, avatar_url: avatars.find(a => a.emoji === tempAvatar)?.id || 'avatar-01' })
      .eq('id', authUser.id);

    if (error) {
      toast({ title: 'Error saving profile', description: error.message, variant: 'destructive' });
    } else {
      setProfile(prev => ({ ...prev, username: tempUsername, avatar: tempAvatar }));
      setIsEditing(false);
      toast({ title: 'Profile Saved!', description: 'Your changes have been saved.' });
      window.dispatchEvent(new CustomEvent('profileUpdate'));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
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
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-4xl border-4 border-primary/20">{isEditing ? tempAvatar : profile.avatar}</div>
            <div className="flex-grow">
              {isEditing ? (
                <Input
                  type="text"
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  className="text-lg font-bold"
                  placeholder="Enter username"
                  disabled={isGuest}
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
                <h3 className="text-lg font-semibold text-primary mb-2 text-center">Select Avatar</h3>
                <div className="grid grid-cols-5 gap-2 pt-2 max-h-48 overflow-y-auto bg-primary/5 dark:bg-primary/10 p-2 rounded-lg border border-primary/20">
                  {avatars
                    .filter(avatar => unlockedAvatars.includes(avatar.id))
                    .map((avatar) => (
                    <button
                      key={avatar.id}
                      className={`p-1 rounded-lg transition-all duration-200 ${tempAvatar === avatar.emoji ? 'bg-accent ring-2 ring-accent-foreground' : 'hover:bg-accent/50'}`}
                      onClick={() => setTempAvatar(avatar.emoji)}
                    >
                      <span className="text-3xl">{avatar.emoji}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatItem icon={<Star className="w-6 h-6 text-primary" />} value={profile.xp.toLocaleString()} label="Experience Points" />
                <StatItem icon={<Coins className="w-6 h-6 text-primary" />} value={coinBalance.toLocaleString()} label="Coins" />
              </div>
            )}

            <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20">
              <h3 className="text-lg font-semibold text-primary mb-3 text-center flex items-center justify-center gap-2">
                <Settings className="w-5 h-5"/> Display Settings
              </h3>
              <div className="flex items-center justify-between rounded-lg border p-3 bg-background/50">
                <Label htmlFor="profile-score-mode" className="font-medium">
                  Score Display
                  <p className="text-xs text-muted-foreground">Show scores as points or questions correct.</p>
                </Label>
                <Switch
                  id="profile-score-mode"
                  checked={scoringMode === 'points'}
                  onCheckedChange={(checked) => setScoringMode(checked ? 'points' : 'questions')}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3 mt-2 bg-background/50">
                <Label htmlFor="clear-cache-button" className="font-medium">
                  Clear Cache
                  <p className="text-xs text-muted-foreground">Force a reload of the latest application version.</p>
                </Label>
                <Button id="clear-cache-button" onClick={handleClearCache} variant="outline" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reload
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-border/20">
              {isGuest ? (
                <Button
                  onClick={() => window.location.href = '/login'}
                  className="w-full gap-2 transition-transform hover:scale-105"
                >
                  <User className="w-4 h-4" />
                  Login / Sign Up to Save Progress
                </Button>
              ) : isEditing ? (
                <div className="flex gap-3">
                  <Button onClick={handleSave} className="flex-1 gap-2 transition-transform hover:scale-105">
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel} className="flex-1 gap-2 transition-transform hover:scale-105">
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button onClick={handleEdit} className="flex-1 gap-2 transition-transform hover:scale-105" variant="outline">
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </Button>
                  <Button onClick={() => setIsShopOpen(true)} className="flex-1 gap-2 transition-transform hover:scale-105">
                    <ShoppingCart className="w-4 h-4" />
                    Avatar Shop
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
      <AvatarShop 
        isOpen={isShopOpen} 
        onOpenChange={setIsShopOpen} 
        coinBalance={coinBalance}
        onPurchase={handlePurchaseAvatar}
        unlockedAvatarIds={unlockedAvatars}
      />
    </Dialog>
  );
};
