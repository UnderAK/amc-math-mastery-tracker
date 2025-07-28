import { describe, it, expect } from 'vitest';
import { calculateLevel } from './gamification';

describe('calculateLevel', () => {
  it('should return level 1 for 0 XP', () => {
    const result = calculateLevel(0);
    expect(result.level).toBe(1);
    expect(result.progress).toBe(0);
  });

  it('should handle negative XP gracefully', () => {
    const result = calculateLevel(-50);
    expect(result.level).toBe(1);
    expect(result.progress).toBe(0);
  });

  it('should correctly calculate progress within level 1', () => {
    const result = calculateLevel(50);
    expect(result.level).toBe(1);
    expect(result.progress).toBe(50);
  });

  it('should level up to level 2', () => {
    const result = calculateLevel(100);
    expect(result.level).toBe(2);
    expect(result.progress).toBe(0);
  });

  it('should correctly calculate progress in level 2', () => {
    const result = calculateLevel(175);
    expect(result.level).toBe(2);
    // XP for level 2 is 150 (100 * 1.5). 75/150 = 50%
    expect(result.progress).toBe(50);
  });
});
