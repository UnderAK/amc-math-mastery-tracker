import React from 'react';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { getTestById, AmcTest } from '@/data/amc-tests';

type LiveSessionProps = {
  sessionId: string;
};

type SessionData = Database['public']['Tables']['live_sessions']['Row'] & {
  live_participants: (Database['public']['Tables']['live_participants']['Row'] & {
    profiles: Database['public']['Tables']['profiles']['Row'] | null;
  })[];
};

const LiveSession = ({ sessionId }: LiveSessionProps) => {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const [test, setTest] = useState<AmcTest | undefined>(undefined);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submittedAnswers, setSubmittedAnswers] = useState<Map<number, string>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null); // Track which answer is being submitted

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);
    };
    fetchUser();

    const fetchSession = async () => {
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*, live_participants (*, profiles (*))')
        .eq('id', sessionId)
        .single();

      if (data) {
        setSession(data as SessionData);
        const testId = `${data.test_type.toLowerCase().replace(' ', '')}-${data.test_year}`;
        const loadedTest = getTestById(testId);
        if (loadedTest) {
          setTest(loadedTest);
        } else {
          toast({ title: 'Test data not found', description: `Could not find questions for ${data.test_type} ${data.test_year}`, variant: 'destructive' });
        }

        // Load submitted answers for the current user
        const participant = data.live_participants.find(p => p.user_id === currentUserId);
        if (participant) {
          const { data: answersData } = await supabase.from('live_answers').select('question_number, answer').eq('participant_id', participant.id);
          if (answersData) {
            // Explicitly cast the returned data to ensure type safety.
            const answers = answersData as { question_number: number; answer: string }[];
            const answerMap = new Map<number, string>(answers.map(a => [a.question_number, a.answer]));
            setSubmittedAnswers(answerMap);
          }
        }
      }
      setLoading(false);
    };

    fetchSession();

    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_participants', filter: `session_id=eq.${sessionId}` },
        () => fetchSession() // Refetch all data on change
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'live_sessions', filter: `id=eq.${sessionId}` },
        (payload) => {
          setSession(prev => prev ? { ...prev, ...(payload.new as Partial<SessionData>) } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  if (loading) {
    return <div>Loading session...</div>;
  }

  if (!session) {
    return <div>Session not found.</div>;
  }

  const isHost = currentUserId === session.host_id;

  const handleAnswerSubmit = async (answer: string) => {
    if (!test) return;
    const currentQuestion = test.questions[currentQuestionIndex];
    const participant = session?.live_participants.find(p => p.user_id === currentUserId);

    if (!participant) {
      toast({ title: 'Error', description: 'You are not a participant in this session.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(answer);

    const { error } = await supabase.from('live_answers').insert({
      participant_id: participant.id,
      question_number: currentQuestion.number,
      answer: answer,
      is_correct: currentQuestion.answer === answer
    });

    if (error) {
      toast({ title: 'Failed to submit answer', description: error.message, variant: 'destructive' });
    } else {
      setSubmittedAnswers(prev => {
        const newMap = new Map<number, string>(prev);
        newMap.set(currentQuestion.number, answer);
        return newMap;
      });
      if (currentQuestion.answer === answer) {
        const { error: rpcError } = await supabase.rpc('increment_score', { participant_id_to_update: participant.id, score_to_add: 10 });
        if (rpcError) {
          toast({ title: 'Error updating score', description: rpcError.message, variant: 'destructive' });
        }
      }
    }
    setIsSubmitting(null);
  };

  const handleStartSession = async () => {
    setIsUpdating(true);
    const { error } = await supabase
      .from('live_sessions')
      .update({ status: 'in_progress' })
      .eq('id', sessionId);

    if (error) {
      toast({ title: 'Error starting session', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Session Started!', description: 'The test is now live.' });
    }
    setIsUpdating(false);
  };

  return (
    <div className="p-4 border rounded-lg grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold">{session.test_type} {session.test_year}</h2>
        <p className="text-muted-foreground">Status: <span className="font-semibold capitalize">{session.status}</span></p>
        
        {isHost && session.status === 'lobby' && (
          <div className="mt-4 bg-secondary/50 p-4 rounded-lg">
            <h3 className="font-bold text-lg">Host Controls</h3>
            <p className="text-sm text-muted-foreground">Share this code with participants to let them join.</p>
            <div className="my-2 p-2 bg-background rounded-md text-center font-mono text-2xl tracking-widest">{session.join_code}</div>
            <Button onClick={handleStartSession} disabled={isUpdating} className="w-full mt-2">
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Start Session
            </Button>
          </div>
        )}

        {session.status === 'in_progress' && test && (
          <div className="mt-6">
            <div className="mb-4">
              <p className="font-bold text-lg">Question {currentQuestionIndex + 1} of {test.questions.length}</p>
              <p className="text-xl mt-2">{test.questions[currentQuestionIndex].text}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(test.questions[currentQuestionIndex].options).map(([key, value]) => {
                const currentQuestionNumber = test.questions[currentQuestionIndex].number;
                const submittedAnswer = submittedAnswers.get(currentQuestionNumber);
                const isSubmitted = submittedAnswer === key;
                const isCorrect = test.questions[currentQuestionIndex].answer === key;

                return (
                  <Button
                    key={key}
                    variant={submittedAnswer ? (isSubmitted ? (isCorrect ? 'success' : 'destructive') : 'outline') : 'outline'}
                    size="lg"
                    className="justify-start h-full whitespace-normal relative"
                    onClick={() => handleAnswerSubmit(key)}
                    disabled={!!submittedAnswer || !!isSubmitting}
                  >
                    {isSubmitting === key && <Loader2 className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
                    <span className="font-bold mr-4">{key}</span>
                    <span>{value}</span>
                  </Button>
                );
              })}
            </div>
            {isHost && (
              <div className="flex justify-between mt-6">
                <Button onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0}>Previous</Button>
                <Button onClick={() => setCurrentQuestionIndex(prev => Math.min(test.questions.length - 1, prev + 1))} disabled={currentQuestionIndex === test.questions.length - 1}>Next</Button>
              </div>
            )}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-lg font-bold">Participants ({session.live_participants.length})</h3>
        <ul className="space-y-2 mt-2">
          {session.live_participants.map(p => (
            <li key={p.id} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
              <span>{p.profiles?.username || 'Anonymous'}</span>
              <span className="font-bold">{p.score} pts</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LiveSession;
