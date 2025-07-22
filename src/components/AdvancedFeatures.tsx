import { useState, useEffect } from "react";
import { Crown, Zap, Users, Trophy, Star, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdvancedFeaturesProps {
  userLevel: number;
  userXP: number;
}

export const AdvancedFeatures = ({ userLevel, userXP }: AdvancedFeaturesProps) => {
  const [activeTab, setActiveTab] = useState("leaderboard");

  // Only show for users level 10+
  if (userLevel < 10) return null;

  const getLeaderboardTier = (level: number) => {
    if (level >= 50) return { name: "Legendary Sage", icon: "👑", color: "text-yellow-500" };
    if (level >= 25) return { name: "Master Scholar", icon: "🏆", color: "text-purple-500" };
    if (level >= 15) return { name: "Expert Mathematician", icon: "⚡", color: "text-blue-500" };
    return { name: "Advanced Student", icon: "🌟", color: "text-green-500" };
  };

  const tier = getLeaderboardTier(userLevel);

  return (
    <section className="glass p-6 rounded-2xl shadow-xl animate-slide-in-left">
      <div className="flex items-center gap-3 mb-6">
        <Crown className="w-6 h-6 text-yellow-500 animate-pulse-glow" />
        <h2 className="text-xl font-semibold gradient-primary bg-clip-text text-transparent">
          VIP Features
        </h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full border border-yellow-400/30">
          <span className="text-lg">{tier.icon}</span>
          <span className={`text-sm font-medium ${tier.color}`}>{tier.name}</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leaderboard" className="gap-2">
            <Users className="w-4 h-4" />
            Elite Board
          </TabsTrigger>
          <TabsTrigger value="challenges" className="gap-2">
            <Trophy className="w-4 h-4" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="perks" className="gap-2">
            <Star className="w-4 h-4" />
            VIP Perks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="mt-6">
          <div className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="text-4xl mb-3">{tier.icon}</div>
              <h3 className="text-lg font-semibold mb-2">Your Elite Ranking</h3>
              <div className={`text-2xl font-bold ${tier.color} mb-2`}>Level {userLevel}</div>
              <div className="text-sm text-muted-foreground">
                {userXP.toLocaleString()} XP • {tier.name}
              </div>
            </div>

            <div className="bg-secondary/30 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                Elite Leaderboard Features
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Priority placement in global rankings
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Special tier-based badge display
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Access to monthly elite competitions
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Exclusive mentorship opportunities
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="mt-6">
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-500" />
                Elite Challenges
              </h3>
              
              <div className="grid gap-3">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-purple-200/50 dark:border-purple-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Perfect Month Challenge</h4>
                    <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/50 rounded-full">Active</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Score 23+ on every test this month
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Reward: 1000 XP + 💎 Diamond Badge</span>
                    <Button size="sm" variant="outline">Track Progress</Button>
                  </div>
                </div>

                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Speed Master</h4>
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/50 rounded-full">Weekly</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Complete 5 tests in optimal time
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Reward: 500 XP + ⚡ Speed Badge</span>
                    <Button size="sm" variant="outline">View Details</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="perks" className="mt-6">
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-500" />
                Your VIP Benefits
              </h3>
              
              <div className="grid gap-4">
                <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                    <Zap className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Enhanced XP Multiplier</h4>
                    <p className="text-sm text-muted-foreground">
                      Earn {userLevel >= 25 ? "3x" : userLevel >= 15 ? "2.5x" : "2x"} XP on all activities
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                    <Crown className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Priority Support</h4>
                    <p className="text-sm text-muted-foreground">
                      Get first-class assistance and feature requests
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Exclusive Content</h4>
                    <p className="text-sm text-muted-foreground">
                      Access to advanced problem sets and solution strategies
                    </p>
                  </div>
                </div>

                {userLevel >= 25 && (
                  <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/50 dark:to-orange-900/50 rounded-lg border border-yellow-300 dark:border-yellow-700">
                    <div className="w-8 h-8 bg-yellow-200 dark:bg-yellow-800 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-yellow-700 dark:text-yellow-300" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1 text-yellow-800 dark:text-yellow-200">
                        Master's Privilege
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Beta access to new features and direct developer communication
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
};