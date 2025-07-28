import { useState } from 'react';
import { Button } from '@/components/ui/button';

export const OfflineBanner = () => {
  const [show, setShow] = useState(true);
  if (!show) return null;
  return (
    <div className="fixed top-0 left-0 w-full z-[1000]">
      <div className="bg-warning text-warning-foreground py-2 px-4 text-center font-semibold shadow-md flex items-center justify-center gap-2">
        <span role="img" aria-label="offline">📶❌</span>
        You are offline. Most features work, but some (like leaderboard) require internet.
        <Button variant="outline" size="sm" className="ml-4 text-xs font-bold bg-warning-foreground text-warning hover:bg-warning-foreground/90" onClick={() => setShow(false)}>Dismiss</Button>
      </div>
    </div>
  );
};
