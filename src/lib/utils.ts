import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// XP and Leveling System
const XP_FOR_FIRST_LEVEL = 100;
const XP_GROWTH_FACTOR = 1.5;

export function calculateLevel(xp: number) {
  if (xp < 0) return { level: 1, progress: 0, xpForNextLevel: XP_FOR_FIRST_LEVEL, currentLevelXp: 0 };

  let level = 1;
  let xpForNextLevel = XP_FOR_FIRST_LEVEL;
  let xpForCurrentLevel = 0;

  while (xp >= xpForNextLevel) {
    xpForCurrentLevel = xpForNextLevel;
    level++;
    xpForNextLevel += Math.floor(XP_FOR_FIRST_LEVEL * Math.pow(XP_GROWTH_FACTOR, level - 1));
  }

  const currentLevelXp = xp - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const progress = xpNeededForLevel > 0 ? (currentLevelXp / xpNeededForLevel) * 100 : 0;

  return {
    level,
    progress: Math.min(100, Math.floor(progress)),
    xpForNextLevel,
    currentLevelXp: currentLevelXp,
    xpNeededForLevel: xpNeededForLevel,
  };
}
