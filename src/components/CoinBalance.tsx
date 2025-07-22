import { useState, useEffect } from "react";
import { Coins } from "lucide-react";
import { CoinSystem } from "@/utils/coinSystem";

interface CoinBalanceProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export const CoinBalance = ({ size = "md", showLabel = true, className = "" }: CoinBalanceProps) => {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    // Initial load
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

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6"
  };

  return (
    <div className={`flex items-center gap-2 ${sizeClasses[size]} ${className}`}>
      <Coins className={`${iconSizes[size]} text-yellow-500`} />
      <span className="font-semibold text-yellow-600 dark:text-yellow-400">
        {balance.toLocaleString()}
      </span>
      {showLabel && (
        <span className="text-muted-foreground text-sm">coins</span>
      )}
    </div>
  );
};
