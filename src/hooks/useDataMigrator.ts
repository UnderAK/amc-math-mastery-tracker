import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { TestScore } from '@/types/TestScore';

export const useDataMigrator = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationCompleted, setMigrationCompleted] = useState(false);
  const { toast } = useToast();

  const runMigration = async () => {

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const saved = localStorage.getItem("scores");
      const localScores: TestScore[] = saved ? JSON.parse(saved) : [];

      if (localScores.length === 0) {
        setMigrationCompleted(true);
        return;
      }

      const unsyncedScores = localScores.filter(score => !score.synced);

      if (unsyncedScores.length === 0) {
        setMigrationCompleted(true);
        return;
      }

      setIsMigrating(true);
      toast({
        title: 'Syncing Your Data... ☁️',
        description: `Found ${unsyncedScores.length} unsynced tests. Saving them to your account.`,
      });

      const recordsToInsert = unsyncedScores.map(score => ({
        user_id: user.id,
        score: score.score,
        test_date: score.date,
        test_type: score.testType,
        year: score.year,
        topics: score.questionTopics,
        time_taken: null, // Not tracked in local data
      }));

      const { error } = await supabase.from('test_results').insert(recordsToInsert);

      if (error) {
        toast({
          title: 'Migration Failed 😟',
          description: 'Could not move your old data. Please try again later.',
          variant: 'destructive',
        });
        console.error('Migration error:', error);
      } else {
        const updatedLocalScores = localScores.map(score => ({ ...score, synced: true }));
        localStorage.setItem('scores', JSON.stringify(updatedLocalScores));
        toast({
          title: 'Sync Complete! ✨',
          description: 'All your test results are now saved to your account.',
        });
      }

      setIsMigrating(false);
      setMigrationCompleted(true);
    };

  return { isMigrating, migrationCompleted, runMigration };
};
