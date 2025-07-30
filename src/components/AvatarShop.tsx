import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { avatars, Avatar as AvatarType } from '@/data/avatars';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AvatarShopProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  coinBalance: number;
  onPurchase: (avatar: AvatarType) => void;
  unlockedAvatarIds: string[];
}

export const AvatarShop = ({ isOpen, onOpenChange, coinBalance, onPurchase, unlockedAvatarIds }: AvatarShopProps) => {

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Avatar Shop</DialogTitle>
          <DialogDescription>Spend your coins to unlock new avatars.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 max-h-[60vh] overflow-y-auto">
          {avatars.map((avatar) => (
            <Card key={avatar.id}>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <img src={avatar.imageUrl} alt={avatar.name} className="w-24 h-24 rounded-full object-cover border-4 border-primary/20" />
                <h4 className="font-semibold mt-2">{avatar.name}</h4>
              </CardContent>
              <CardFooter className="flex flex-col">
                {unlockedAvatarIds.includes(avatar.id) ? (
                  <Button className="w-full" disabled>
                    <Badge variant="default">Owned</Badge>
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => onPurchase(avatar)}
                    disabled={coinBalance < avatar.price}
                  >
                    <Badge variant="secondary" className="mr-2">{avatar.price} Coins</Badge>
                    Buy
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
        <DialogFooter>
          <p>Your balance: <span className="font-bold">{coinBalance} Coins</span></p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
