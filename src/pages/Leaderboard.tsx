import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trophy, Loader2, ServerCrash } from 'lucide-react';

interface Profile {
  username: string;
  avatar: string;
}

interface LeaderboardEntry {
  rank: number;
  score: number;
  test_date: string;
  profiles: Profile[] | null;
}

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        // Supabase returns the joined 'profiles' as an array.
        const { data, error } = await supabase
          .from('test_results')
          .select(`
            score,
            test_date,
            profiles ( username, avatar )
          `)
          .order('score', { ascending: false })
          .limit(10);

        if (error) {
          throw error;
        }

        const rankedData = data.map((item, index) => ({
          ...item,
          rank: index + 1,
        })) as LeaderboardEntry[];

        setLeaderboardData(rankedData);
      } catch (err: any) {
        setError('Failed to fetch leaderboard data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Trophy className="mx-auto h-12 w-12 text-yellow-400 animate-float" />
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl mt-4">Leaderboard</h1>
          <p className="text-muted-foreground mt-2">Top 10 High Scores</p>
        </div>

        {loading && (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading Scores...</p>
          </div>
        )}

        {error && (
          <div className="text-center p-8 bg-destructive/10 rounded-lg">
            <ServerCrash className="mx-auto h-10 w-10 text-destructive" />
            <p className="mt-4 text-destructive-foreground font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="glass rounded-2xl shadow-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-muted/30">
                <tr>
                  <th className="p-4 font-semibold text-center">Rank</th>
                  <th className="p-4 font-semibold">Player</th>
                  <th className="p-4 font-semibold text-center">Score</th>
                  <th className="p-4 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((entry) => (
                  <tr key={entry.rank} className="border-t border-border/20 hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-bold text-lg text-center">{entry.rank}</td>
                    <td className="p-4 flex items-center gap-3">
                      {/* Safely access the first profile in the array */}
                      <span className="text-2xl">{entry.profiles?.[0]?.avatar || '👤'}</span>
                      <span className="font-medium">{entry.profiles?.[0]?.username || 'Anonymous'}</span>
                    </td>
                    <td className="p-4 text-center font-semibold text-primary">{entry.score}</td>
                    <td className="p-4 text-right text-sm text-muted-foreground">
                      {new Date(entry.test_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
};

export default Leaderboard;
