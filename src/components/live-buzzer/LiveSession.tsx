import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, CheckIcon } from 'lucide-react';
import { getTestById, AmcTest } from '@/data/amc-tests';

type Participant = Omit<Database['public']['Tables']['live_participants']['Row'], 'id'> & {
  id: string; // Ensure id is always a string, overriding default number type if needed
  profiles: {
    id: string;
    username: string | null;
    avatar_url: string | null;
    updated_at: string | null;
    website: string | null;
    coin_balance: number | null;
    full_name: string | null;
  } | null;
};

type SessionData = Database['public']['Tables']['live_sessions']['Row'] & {
  live_participants: Participant[];
};

const LiveSession = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const { toast } = useToast();

  const isGuestMode = location.state?.isGuest || sessionId?.startsWith('guest-');

  const [session, setSession] = useState<SessionData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [userId, setUserId] = useState<string | undefined>(isGuestMode ? 'guest-user' : undefined);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'incorrect' | null>(null);
  const [answeredUsers, setAnsweredUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Memoize test data to avoid re-calculating on every render
  const test: AmcTest | undefined = React.useMemo(() => {
    if (!session && !isGuestMode) return undefined;
    const testType = isGuestMode ? location.state.test_type : session?.test_type;
    const testYear = isGuestMode ? location.state.test_year : session?.test_year;
    if (!testType || !testYear) return undefined;
    const testId = `${testType.toLowerCase().replace(/\s+/g, '')}-${testYear}`;
    return getTestById(testId);
  }, [session, isGuestMode, location.state]);

  // Effect for initializing session (both guest and authenticated)
  useEffect(() => {
    const initializeSession = async () => {
      setIsLoading(true);
      if (isGuestMode) {
        // Try to get session data from location state first, then fall back to sessionStorage
        let sessionData = location.state;
        if (!sessionData) {
          const storedData = sessionStorage.getItem(`guest-session-${sessionId}`);
          if (storedData) {
            sessionData = JSON.parse(storedData);
          } else {
            toast({ title: 'Guest session expired', description: 'Session data not found.', variant: 'destructive' });
            setIsLoading(false);
            return;
          }
        }

        const guestSession: SessionData = {
          id: sessionId!,
          created_at: new Date().toISOString(),
          host_id: 'guest-user',
          test_type: sessionData.test_type,
          test_year: sessionData.test_year,
          join_code: 'GUEST',
          status: 'lobby',
          current_question_index: 0,
          live_participants: [],
        };
        const guestParticipant: Participant = {
          id: 'guest-participant',
          session_id: sessionId!,
          user_id: 'guest-user',
          joined_at: new Date().toISOString(),
          score: 0,
          profiles: { 
            id: 'guest-user', 
            username: 'Guest', 
            avatar_url: null, 
            updated_at: null, 
            website: null, 
            coin_balance: 0, 
            full_name: 'Guest User'
          },
        };
        setSession(guestSession);
        setParticipants([guestParticipant]);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        setUserId(user?.id);
      }
      setIsLoading(false);
    };
    initializeSession();
  }, [isGuestMode, sessionId, location.state, toast]);

  // Effect for fetching data and real-time updates for authenticated users
  useEffect(() => {
    if (isGuestMode || !userId) return;

    const fetchSessionData = async () => {
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*, live_participants!inner(*, profiles(*))')
        .eq('id', sessionId)
        .single();

      if (error || !data) {
        toast({ title: 'Error fetching session', description: error?.message || 'Session not found.', variant: 'destructive' });
        return;
      }
      setSession(data);
      setParticipants(data.live_participants);
    };

    fetchSessionData();

    const sessionChannel = supabase
      .channel(`session-updates-${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'live_sessions', filter: `id=eq.${sessionId}` },
        (payload) => {
          const newSession = payload.new as SessionData;
          // Check previous state before updating
          setSession((prev) => {
            if (prev && prev.current_question_index !== newSession.current_question_index) {
              setUserAnswer(null);
              setAnswerStatus(null);
              setAnsweredUsers(new Set()); // Reset for new question
            }
            return newSession;
          });
        }
      )
      .subscribe();

    const participantsChannel = supabase
      .channel(`participant-updates-${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_participants', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          // On any change to participants, refetch the whole list for simplicity and robustness
          fetchSessionData();
          if (payload.eventType === 'INSERT') {
            toast({ title: 'A new participant has joined!' });
          }
        }
      )
      .subscribe();

    const answersChannel = supabase
      .channel(`answers-updates-${sessionId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'live_answers', 
          filter: `session_id=eq.${sessionId}` 
        },
        (payload) => {
          const newAnswer = payload.new as { user_id: string, question_index: number };
          if (newAnswer.question_index === session?.current_question_index) {
            setAnsweredUsers(prev => new Set(prev).add(newAnswer.user_id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(answersChannel);
    };
  }, [isGuestMode, sessionId, userId, toast]);

  const handleStartSession = async () => {
    if (isGuestMode) {
      setSession(prev => (prev ? { ...prev, status: 'in_progress' } : null));
      return;
    }
    const { error } = await supabase.from('live_sessions').update({ status: 'in_progress' }).eq('id', sessionId);
    if (error) toast({ title: 'Error starting session', description: error.message, variant: 'destructive' });
  };

  const handleAnswerSubmit = async (answer: string) => {
    if (!test || !session) return;
    const currentQuestion = test.questions[session.current_question_index];
    if (!currentQuestion) return;

    setUserAnswer(answer);
    const isCorrect = answer === currentQuestion.answer;
    setAnswerStatus(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      if (isGuestMode) {
        setParticipants(prev => prev.map(p => (p.user_id === userId ? { ...p, score: p.score + 10 } : p)));
      } else {
        const participant = participants.find(p => p.user_id === userId);
        if (participant) {
          const { error } = await supabase.rpc('increment_score', { participant_id_to_update: participant.id, score_to_add: 10 });
          if (error) toast({ title: 'Error updating score', description: error.message, variant: 'destructive' });
        }
      }
    }
  };

  const updateQuestionIndex = async (newIndex: number) => {
    if (isGuestMode) {
      setSession(prev => (prev ? { ...prev, current_question_index: newIndex } : null));
      setUserAnswer(null);
      setAnswerStatus(null);
      return;
    }
    const { error } = await supabase.from('live_sessions').update({ current_question_index: newIndex }).eq('id', sessionId);
    if (error) toast({ title: 'Error updating question', description: error.message, variant: 'destructive' });
  };

  const handleFinishSession = async () => {
    if (isGuestMode) {
      setSession(prev => (prev ? { ...prev, status: 'ended' } : null));
      return;
    }

    // First, update the session status to 'ended'
    const { error: updateError } = await supabase.from('live_sessions').update({ status: 'ended' }).eq('id', sessionId);
    if (updateError) {
      toast({ title: 'Error finishing session', description: updateError.message, variant: 'destructive' });
      return;
    }

    // Then, call the RPC function to distribute rewards
    const { error: rpcError } = await supabase.rpc('distribute_session_rewards', { p_session_id: sessionId });
    if (rpcError) {
      toast({ title: 'Error distributing rewards', description: rpcError.message, variant: 'destructive' });
    } else {
      toast({ title: 'Session Ended!', description: 'Coins have been awarded to all participants.' });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin" /></div>;
  }

  if (!session || !test) {
    return <div>Session or test data not found.</div>;
  }

  const isHost = userId === session.host_id;
  const currentQuestion = test.questions[session.current_question_index];

  return (
    <div className="p-4 border rounded-lg grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold">{`${test.type} - ${test.year}`}</h2>
        <div className="flex items-center gap-4 mt-1">
          <p className="text-muted-foreground">Status: <span className="font-semibold capitalize">{session.status.replace('_', ' ')}</span></p>
          {isHost && (
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">Join Code:</p>
              <span className="font-mono text-lg p-1 bg-secondary rounded-md">{session.join_code}</span>
            </div>
          )}
        </div>

        {isHost && session.status === 'lobby' && (
          <div className="mt-4 bg-secondary/50 p-4 rounded-lg">
            <h3 className="font-bold text-lg">Host Controls</h3>
            <p className="text-sm text-muted-foreground">Press start when all participants have joined.</p>
            <Button onClick={handleStartSession} className="w-full mt-2">Start Session</Button>
          </div>
        )}

        {session.status === 'in_progress' && currentQuestion && (
          <div className="mt-6">
            <div className="mb-4">
              <p className="font-bold text-lg">Question {session.current_question_index + 1} of {test.questions.length}</p>
              <p className="text-xl mt-2">{currentQuestion.text}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <Button
                  key={key}
                  variant={userAnswer === key ? (answerStatus === 'correct' ? 'success' : 'destructive') : 'outline'}
                  size="lg"
                  className="justify-start h-full whitespace-normal relative"
                  onClick={() => handleAnswerSubmit(key)}
                  disabled={!!userAnswer}
                >
                  <span className="font-bold mr-4">{key}</span>
                  <span>{value}</span>
                </Button>
              ))}
            </div>
            {isHost && (
              <div className="flex justify-between items-center mt-6">
                <Button onClick={() => updateQuestionIndex(session.current_question_index - 1)} disabled={session.current_question_index <= 0}>Previous</Button>
                {session.current_question_index >= test.questions.length - 1 ? (
                  <Button onClick={handleFinishSession} variant="destructive">Finish Session</Button>
                ) : (
                  <Button onClick={() => updateQuestionIndex(session.current_question_index + 1)}>Next Question</Button>
                )}
              </div>
            )}
          </div>
        )}

        {session.status === 'ended' && (
          <div className="mt-6 text-center">
            <h3 className="text-2xl font-bold">Session Ended</h3>
            <p className="text-muted-foreground">Here are the final results.</p>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-lg font-bold">Participants ({participants.length})</h3>
        <ul className="space-y-2 mt-2">
          {[...participants].sort((a, b) => b.score - a.score).map(p => (
            <li key={p.user_id} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={p.profiles?.avatar_url || undefined} />
                  <AvatarFallback>{p.profiles?.username?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <span>{p.profiles?.username || 'Anonymous'}</span>
                {isHost && answeredUsers.has(p.user_id) && (
                  <CheckIcon className="h-5 w-5 text-green-500" />
                )}
              </div>
              <span className="font-bold">{p.score} pts</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LiveSession;
