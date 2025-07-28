import { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';

export const CoinDisplay = () => {
  const [xp, setXp] = useState(0);

  useEffect(() => {
    const fetchXp = () => {
      const currentXp = parseInt(localStorage.getItem('xp') || '0', 10);
      setXp(currentXp);
    };

    fetchXp();

    // Listen for custom event to update XP when it changes elsewhere
    window.addEventListener('dataUpdate', fetchXp);

    return () => {
      window.removeEventListener('dataUpdate', fetchXp);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 font-semibold text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full text-sm">
      <Coins className="w-4 h-4" />
      <span>{xp.toLocaleString()} XP</span>
    </div>
  );
};
