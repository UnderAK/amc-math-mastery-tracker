import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, CheckIcon } from 'lucide-react';
import { getTestById, AmcTest } from '@/data/amc-tests';


type Participant = Database['public']['Views']['session_participants_with_profiles']['Row'];
type SessionData = Database['public']['Tables']['live_sessions']['Row'] & {
  session_participants_with_profiles: Participant[];
};

const LiveSession = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const { toast } = useToast();

  const [session, setSession] = useState<SessionData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [userId, setUserId] = useState<string | undefined>();
  const [test, setTest] = useState<AmcTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'incorrect' | null>(null);
  const [submittedAnswers, setSubmittedAnswers] = useState<Database['public']['Tables']['live_answers']['Row'][]>([]);

  const isGuestMode = useMemo(() => location.state?.isGuest || sessionId?.startsWith('guest-'), [location.state, sessionId]);

  const fetchSessionData = useCallback(async () => {
    if (isGuestMode || !sessionId) return;

    // Use a single secure RPC call to get both session and participants data
    const { data: sessionWithParticipants, error } = await supabase.rpc('get_session_with_participants_secure', {
      p_session_id: sessionId,
    });

    if (error) {
      toast({ title: 'Error fetching session', description: 'The session may have ended or the code is invalid.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    if (!sessionWithParticipants) {
      toast({ title: 'Session not found', description: 'The session may have expired.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    // Parse the returned JSON data
    const sessionData = sessionWithParticipants.session;
    const participantsData = sessionWithParticipants.participants || [];

    setSession(sessionData);
    setParticipants(participantsData);
    setIsLoading(false);
  }, [sessionId, isGuestMode, toast]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
      if (!isGuestMode && user?.id) {
        await fetchSessionData();
      } else {
        setIsLoading(false);
      }
    };
    init();
  }, [fetchSessionData, isGuestMode]);

  useEffect(() => {
    if (isGuestMode || !sessionId) return;

    const channel = supabase
      .channel(`session-updates-${sessionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_sessions', filter: `id=eq.${sessionId}` }, (payload) => {
        fetchSessionData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_participants', filter: `session_id=eq.${sessionId}` }, (payload) => {
        fetchSessionData();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_answers' }, (payload) => {
        const newAnswer = payload.new as Database['public']['Tables']['live_answers']['Row'];
        // Check if the answer is for the current session by checking if the participant is in the current session
        if (participants.some(p => p.id === newAnswer.participant_id)) {
          setSubmittedAnswers(currentAnswers => [...currentAnswers, newAnswer]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, isGuestMode, fetchSessionData]);

  useEffect(() => {
    const fetchTestForSession = async () => {
      if (!session) return;

      const { data, error } = await supabase.rpc('get_test_by_session', { p_session_id: session.id });

      if (error) {
        toast({ title: 'Error fetching test data', description: error.message, variant: 'destructive' });
        setTest(null);
      } else {
        setTest(data);
      }
    };

    fetchTestForSession();
  }, [session, toast]);

  const handleStartSession = async () => {
    const { error } = await supabase.from('live_sessions').update({ status: 'in_progress' }).eq('id', sessionId);
    if (error) toast({ title: 'Error starting session', description: error.message, variant: 'destructive' });
  };

  const handleAnswerSubmit = async (answer: string) => {
    if (!userId || !session || !test) return;
    
    const participant = participants.find(p => p.user_id === userId);
    if (!participant) {
      toast({ title: 'Error', description: 'You are not a participant in this session.', variant: 'destructive' });
      return;
    }

    const isCorrect = test.questions[session.current_question_index].answer === answer;
    setAnswerStatus(isCorrect ? 'correct' : 'incorrect');
    setUserAnswer(answer);

    // Save the answer to the database
    const { error: answerError } = await supabase
      .from('live_answers')
      .insert({
        participant_id: participant.id,
        question_number: session.current_question_index + 1, // 1-indexed
        answer: answer,
        is_correct: isCorrect
      });

    if (answerError) {
      console.error('Error saving answer:', answerError);
      toast({ title: 'Error', description: 'Failed to save your answer.', variant: 'destructive' });
      return;
    }

    // Update score if correct
    if (isCorrect) {
      const { error: scoreError } = await supabase.rpc('increment_score', { 
        participant_id_to_update: participant.id, 
        score_to_add: 10 
      });
      
      if (scoreError) {
        console.error('Error updating score:', scoreError);
      }
    }
  };

  const updateQuestionIndex = async (newIndex: number) => {
    if (!test || newIndex < 0 || newIndex >= test.questions.length) return;
    setUserAnswer(null);
    setAnswerStatus(null);
    const { error } = await supabase.from('live_sessions').update({ current_question_index: newIndex }).eq('id', sessionId);
    if (error) toast({ title: 'Error changing question', description: error.message, variant: 'destructive' });
  };

  const handleFinishSession = async () => {
    await supabase.from('live_sessions').update({ status: 'ended' }).eq('id', sessionId);
    await supabase.rpc('distribute_session_rewards', { p_session_id: sessionId });
    toast({ title: 'Session Ended!', description: 'Coins have been awarded to all participants.' });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin" /></div>;
  }

  if (!session || !test) {
    return <div className="text-center"><p>Session not found or has expired.</p></div>;
  }

  const isHost = session.host_id === userId;
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
              <div className="text-xl mt-2 prose" dangerouslySetInnerHTML={{ __html: currentQuestion.text }} />
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
                  <span dangerouslySetInnerHTML={{ __html: value }} />
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
          {[...participants].sort((a, b) => (b.score || 0) - (a.score || 0)).map(p => (
            <li key={p.user_id} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={p.avatar || undefined} />
                  <AvatarFallback>{p.username?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <span>{p.username || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-2">
                {submittedAnswers.some(a => a.participant_id === p.id && a.question_number === (session?.current_question_index ?? 0) + 1) && (
                  <CheckIcon className="h-5 w-5 text-green-500" />
                )}
                <span className="font-bold">{p.score || 0} pts</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LiveSession;
