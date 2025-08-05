import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Trophy } from 'lucide-react';

// Manually define the Participant type as the view is not in the generated types.
// This combines fields from live_participants and user_profiles.
type Participant = {
  user_id: string;
  username: string | null;
  avatar: string | null;
  score: number | null;
  id: string; // This is the live_participants.id
  session_id: string;
  joined_at: string;
};

interface LiveLeaderboardProps {
  participants: Participant[];
}

const LiveLeaderboard: React.FC<LiveLeaderboardProps> = ({ participants }) => {
  const sortedParticipants = [...participants].sort((a, b) => (b.score || 0) - (a.score || 0));

  const getRankColor = (rank: number) => {
    if (rank === 0) return 'text-yellow-400';
    if (rank === 1) return 'text-gray-400';
    if (rank === 2) return 'text-yellow-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="p-4 rounded-lg bg-card border">
      <h3 className="text-xl font-bold mb-4 text-center">Leaderboard</h3>
      <ul className="space-y-3">
        {sortedParticipants.map((p, index) => (
          <li key={p.user_id} className="flex items-center justify-between p-3 rounded-md bg-secondary/50 transition-all hover:bg-secondary">
            <div className="flex items-center gap-3">
              <div className={`w-6 text-center font-bold ${getRankColor(index)}`}>
                {index < 3 ? <Trophy className="h-5 w-5" /> : `#${index + 1}`}
              </div>
              <Avatar className="h-9 w-9">
                <AvatarImage src={p.avatar || undefined} />
                <AvatarFallback>{p.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{p.username || 'Anonymous'}</span>
            </div>
            <span className="font-bold text-lg">{p.score || 0} pts</span>
          </li>
        ))}
        {sortedParticipants.length === 0 && (
          <p className="text-center text-muted-foreground py-4">No participants yet.</p>
        )}
      </ul>
    </div>
  );
};

export default LiveLeaderboard;
