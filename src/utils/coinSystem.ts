export interface CoinTransaction {
  id: string;
  type: 'earned' | 'spent';
  amount: number;
  reason: string;
  timestamp: string;
}

export interface CoinData {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  transactions: CoinTransaction[];
}

export class CoinSystem {
  private static readonly STORAGE_KEY = 'coinData';

  static getCoinData(): CoinData {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    
    // Default coin data for new users
    const defaultData: CoinData = {
      balance: 50, // Starting bonus
      totalEarned: 50,
      totalSpent: 0,
      transactions: [{
        id: Date.now().toString(),
        type: 'earned',
        amount: 50,
        reason: 'Welcome bonus',
        timestamp: new Date().toISOString()
      }]
    };
    
    this.saveCoinData(defaultData);
    return defaultData;
  }

  static saveCoinData(data: CoinData): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    // Dispatch event to notify components of coin updates
    window.dispatchEvent(new CustomEvent('coinUpdate', { detail: data }));
  }

  static awardCoins(amount: number, reason: string): CoinData {
    const data = this.getCoinData();
    
    const transaction: CoinTransaction = {
      id: Date.now().toString(),
      type: 'earned',
      amount,
      reason,
      timestamp: new Date().toISOString()
    };

    data.balance += amount;
    data.totalEarned += amount;
    data.transactions.unshift(transaction); // Add to beginning
    
    // Keep only last 50 transactions
    if (data.transactions.length > 50) {
      data.transactions = data.transactions.slice(0, 50);
    }

    this.saveCoinData(data);
    return data;
  }

  static spendCoins(amount: number, reason: string): boolean {
    const data = this.getCoinData();
    
    if (data.balance < amount) {
      return false; // Insufficient funds
    }

    const transaction: CoinTransaction = {
      id: Date.now().toString(),
      type: 'spent',
      amount,
      reason,
      timestamp: new Date().toISOString()
    };

    data.balance -= amount;
    data.totalSpent += amount;
    data.transactions.unshift(transaction);
    
    // Keep only last 50 transactions
    if (data.transactions.length > 50) {
      data.transactions = data.transactions.slice(0, 50);
    }

    this.saveCoinData(data);
    return true;
  }

  static getRandomTestReward(): number {
    // Award 5-15 coins randomly, with bonus for high scores
    const baseReward = Math.floor(Math.random() * 11) + 5; // 5-15 coins
    return baseReward;
  }

  static getBonusTestReward(score: number, maxScore: number = 25): number {
    const percentage = (score / maxScore) * 100;
    let bonus = 0;
    
    if (percentage >= 90) bonus = 10; // Perfect/near perfect
    else if (percentage >= 80) bonus = 5; // Great score
    else if (percentage >= 70) bonus = 2; // Good score
    
    return bonus;
  }

  static canAfford(amount: number): boolean {
    const data = this.getCoinData();
    return data.balance >= amount;
  }

  static getBalance(): number {
    const data = this.getCoinData();
    return data.balance;
  }
}

// Avatar shop configuration
export const AVATAR_SHOP = {
  free: {
    price: 0,
    avatars: ["🧑‍🎓", "👨‍🎓", "👩‍🎓", "🤓", "🧠"]
  },
  basic: {
    price: 25,
    avatars: ["🦸‍♂️", "🦸‍♀️", "🥸", "😎", "🤗", "🐱", "🐶", "🦊"]
  },
  premium: {
    price: 50,
    avatars: ["🐨", "🐼", "🦁", "🐸", "🐧", "🦉", "🦄", "⭐"]
  },
  legendary: {
    price: 100,
    avatars: ["💎", "🏆", "👑", "🎯", "🚀", "💪", "🔥", "⚡", "🌟"]
  }
};

// Username change pricing
export const USERNAME_CHANGE_COST = 30;
