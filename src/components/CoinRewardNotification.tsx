import { useState, useEffect } from "react";
import { Coins, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CoinRewardNotificationProps {
  amount: number;
  reason: string;
  show: boolean;
  onComplete: () => void;
}

export const CoinRewardNotification = ({ amount, reason, show, onComplete }: CoinRewardNotificationProps) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000); // Show for 3 seconds

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          className="fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-4 rounded-lg shadow-lg border border-yellow-300"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Coins className="w-8 h-8" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="w-4 h-4 text-yellow-200" />
              </motion.div>
            </div>
            
            <div>
              <div className="font-bold text-lg">+{amount} Coins!</div>
              <div className="text-sm text-yellow-100">{reason}</div>
            </div>
          </div>
          
          {/* Animated coin particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, y: 0, x: 0 }}
                animate={{ 
                  opacity: 0, 
                  y: -20, 
                  x: Math.random() * 40 - 20 
                }}
                transition={{ 
                  delay: 0.5 + i * 0.2, 
                  duration: 1.5 
                }}
                className="absolute top-2 left-2"
              >
                <Coins className="w-4 h-4 text-yellow-200" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
