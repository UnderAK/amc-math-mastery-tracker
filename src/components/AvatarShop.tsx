import { useState, useEffect } from "react";
import { ShoppingBag, Coins, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CoinSystem, AVATAR_SHOP } from "@/utils/coinSystem";
import { CoinBalance } from "./CoinBalance";

interface UserProfile {
  username: string;
  avatar: string;
  joinDate: string;
  ownedAvatars?: string[];
}

export const AvatarShop = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load user profile and coin balance
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      // Initialize ownedAvatars if not present
      if (!profileData.ownedAvatars) {
        profileData.ownedAvatars = AVATAR_SHOP.free.avatars.slice(); // Start with free avatars
        localStorage.setItem("userProfile", JSON.stringify(profileData));
      }
      setProfile(profileData);
    }

    setBalance(CoinSystem.getBalance());

    // Listen for coin updates
    const handleCoinUpdate = (event: CustomEvent) => {
      setBalance(event.detail.balance);
    };

    window.addEventListener('coinUpdate', handleCoinUpdate as EventListener);

    return () => {
      window.removeEventListener('coinUpdate', handleCoinUpdate as EventListener);
    };
  }, []);

  const handlePurchaseAvatar = async (avatar: string, price: number, tier: string) => {
    if (!profile) return;

    setPurchaseLoading(avatar);

    // Check if user can afford it
    if (!CoinSystem.canAfford(price)) {
      toast({
        title: "Insufficient Coins",
        description: `You need ${price} coins to purchase this avatar. You have ${balance} coins.`,
        variant: "destructive"
      });
      setPurchaseLoading(null);
      return;
    }

    // Check if already owned
    if (profile.ownedAvatars?.includes(avatar)) {
      toast({
        title: "Already Owned",
        description: "You already own this avatar!",
        variant: "destructive"
      });
      setPurchaseLoading(null);
      return;
    }

    // Simulate purchase delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Spend coins
    const success = CoinSystem.spendCoins(price, `Purchased ${tier} avatar ${avatar}`);
    
    if (success) {
      // Add avatar to owned avatars
      const updatedProfile = {
        ...profile,
        ownedAvatars: [...(profile.ownedAvatars || []), avatar]
      };
      
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      setProfile(updatedProfile);

      toast({
        title: "Avatar Purchased!",
        description: `You've successfully purchased the ${avatar} avatar for ${price} coins!`,
      });
    } else {
      toast({
        title: "Purchase Failed",
        description: "Something went wrong with your purchase.",
        variant: "destructive"
      });
    }

    setPurchaseLoading(null);
  };

  const isOwned = (avatar: string) => {
    return profile?.ownedAvatars?.includes(avatar) || false;
  };

  const canAfford = (price: number) => {
    return balance >= price;
  };

  const renderAvatarTier = (tierName: string, tierData: { price: number; avatars: string[] }) => {
    const tierColors = {
      free: "border-gray-300 bg-gray-50",
      basic: "border-blue-300 bg-blue-50",
      premium: "border-purple-300 bg-purple-50",
      legendary: "border-yellow-300 bg-yellow-50"
    };

    const tierLabels = {
      free: "Free",
      basic: "Basic",
      premium: "Premium", 
      legendary: "Legendary"
    };

    return (
      <div key={tierName} className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-lg font-semibold capitalize">{tierLabels[tierName as keyof typeof tierLabels]}</h3>
          {tierData.price > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Coins className="w-4 h-4 text-yellow-500" />
              {tierData.price}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          {tierData.avatars.map((avatar) => (
            <div
              key={avatar}
              className={`relative p-3 rounded-lg border-2 ${tierColors[tierName as keyof typeof tierColors]} hover:shadow-md transition-all`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{avatar}</div>
                
                {isOwned(avatar) ? (
                  <div className="flex items-center justify-center gap-1 text-green-600 text-sm">
                    <Check className="w-4 h-4" />
                    Owned
                  </div>
                ) : tierData.price === 0 ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => handlePurchaseAvatar(avatar, 0, tierName)}
                    disabled={purchaseLoading === avatar}
                  >
                    {purchaseLoading === avatar ? "..." : "Free"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant={canAfford(tierData.price) ? "default" : "secondary"}
                    className="w-full text-xs"
                    onClick={() => handlePurchaseAvatar(avatar, tierData.price, tierName)}
                    disabled={!canAfford(tierData.price) || purchaseLoading === avatar}
                  >
                    {purchaseLoading === avatar ? (
                      "..."
                    ) : canAfford(tierData.price) ? (
                      `${tierData.price}`
                    ) : (
                      <Lock className="w-3 h-3" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4" />
          Avatar Shop
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Avatar Shop
            </div>
            <CoinBalance size="sm" />
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Purchase new avatars with coins earned from completing tests!
          </p>
          
          {Object.entries(AVATAR_SHOP).map(([tierName, tierData]) =>
            renderAvatarTier(tierName, tierData)
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
