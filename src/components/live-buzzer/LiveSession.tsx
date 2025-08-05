import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, CheckIcon } from 'lucide-react';
import { getTestById, AmcTest } from '@/data/amc-tests';
import LiveLeaderboard from './LiveLeaderboard';


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
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'incorrect' | null>(null);
  const [hasBuzzedIn, setHasBuzzedIn] = useState(false);
  const [buzzerState, setBuzzerState] = useState<{
    isLocked: boolean;
    firstBuzzer: string | null;
    canAnswer: boolean;
  }>({ isLocked: false, firstBuzzer: null, canAnswer: false });
  const [submittedAnswers, setSubmittedAnswers] = useState<Database['public']['Tables']['live_answers']['Row'][]>([]);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const isGuestMode = useMemo(() => location.state?.isGuest || sessionId?.startsWith('guest-'), [location.state, sessionId]);

  const isHost = useMemo(() => session?.host_id === userId, [session, userId]);

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

    console.log('[DEBUG] Fetched Session Data:', sessionData);
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
        console.log('[DEBUG] Received live_sessions change:', payload);
        fetchSessionData();
      })

      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_buzzer_state', filter: `session_id=eq.${sessionId}` }, (payload) => {
        console.log('[DEBUG] Buzzer state changed:', payload);
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const newState = payload.new as any;
          if (newState.question_number === session?.current_question_index + 1) {
            // Find the participant name
            const buzzerParticipant = participants.find(p => p.id === newState.first_buzzer_participant_id);
            const buzzerName = buzzerParticipant?.username || 'Someone';
            
            setBuzzerState({
              isLocked: newState.buzzer_locked,
              firstBuzzer: buzzerName,
              canAnswer: buzzerParticipant?.user_id === userId
            });
          }
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_answers' }, (payload) => {
        const newAnswer = payload.new as Database['public']['Tables']['live_answers']['Row'];
        // Check if the answer is for the current session by checking if the participant is in the current session
        if (participants.some(p => p.id === newAnswer.participant_id)) {
          setSubmittedAnswers(currentAnswers => [...currentAnswers, newAnswer]);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_profiles' }, (payload) => {
        const changedUserId = payload.new.id;
        if (participants.some(p => p.user_id === changedUserId)) {
          fetchSessionData();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, isGuestMode, fetchSessionData]);

  useEffect(() => {
    console.log('[DEBUG] Session object updated:', session);
    if (session?.status === 'in_progress') {
      console.log('[DEBUG] Session is active, showing questions.');
      setIsSessionActive(true);
      // Reset buzzer state for new question
      setHasBuzzedIn(false);
      setBuzzerState({ isLocked: false, firstBuzzer: null, canAnswer: false });
      setUserAnswer('');
      setAnswerStatus(null);
    } else {
      setIsSessionActive(false);
    }
  }, [session]);

  useEffect(() => {
    const fetchTestForSession = async () => {
      if (!session) return;

      const { data, error } = await supabase.rpc('get_test_by_session', { p_session_id: session.id });

      if (error) {
        toast({ title: 'Error fetching test data', description: error.message, variant: 'destructive' });
        setTest(null);
      } else {
        console.log('[DEBUG] Fetched Test Data:', data);
        setTest(data);
      }
    };

    fetchTestForSession();
  }, [session, toast]);

  const handleStartSession = async () => {
    const { error } = await supabase.from('live_sessions').update({ status: 'in_progress' }).eq('id', sessionId);
    if (error) toast({ title: 'Error starting session', description: error.message, variant: 'destructive' });
  };

  const handleBuzzIn = async () => {
    if (!userId || !session || hasBuzzedIn) return;
    
    const participant = participants.find(p => p.user_id === userId);
    if (!participant) {
      toast({ title: 'Error', description: 'You are not a participant in this session.', variant: 'destructive' });
      return;
    }

    const { data, error } = await supabase.rpc('buzz_in', {
      p_session_id: session.id,
      p_participant_id: participant.id,
      p_question_number: session.current_question_index + 1
    });

    if (error) {
      console.error('Error buzzing in:', error);
      toast({ title: 'Error', description: 'Failed to buzz in.', variant: 'destructive' });
      return;
    }

    setHasBuzzedIn(true);
    
    if (data.first_buzzer) {
      setBuzzerState({ isLocked: true, firstBuzzer: data.participant_name, canAnswer: true });
      toast({ title: 'Success!', description: data.message });
    } else {
      setBuzzerState({ isLocked: true, firstBuzzer: data.first_buzzer_name, canAnswer: false });
      toast({ title: 'Too late!', description: data.message, variant: 'destructive' });
    }
  };

  const handleAnswerSubmit = async () => {
    if (!userId || !session || !test || !userAnswer.trim()) return;
    
    const participant = participants.find(p => p.user_id === userId);
    if (!participant) {
      toast({ title: 'Error', description: 'You are not a participant in this session.', variant: 'destructive' });
      return;
    }

    const currentQuestion = test.questions[session.current_question_index];
    const isCorrect = currentQuestion.answer.toLowerCase() === userAnswer.toLowerCase().trim();
    setAnswerStatus(isCorrect ? 'correct' : 'incorrect');

    const { error: answerError } = await supabase
      .from('live_answers')
      .insert({
        participant_id: participant.id,
        question_number: session.current_question_index + 1,
        answer: userAnswer.trim(),
        is_correct: isCorrect,
        buzzed_at: new Date().toISOString()
      });

    if (answerError) {
      console.error('Error saving answer:', answerError);
      toast({ title: 'Error', description: 'Failed to save your answer.', variant: 'destructive' });
      return;
    }

    if (isCorrect) {
      const { error: scoreError } = await supabase.rpc('increment_score', {
        participant_id_to_update: participant.id,
        score_to_add: 10
      });
      if (scoreError) {
        console.error('Error updating score:', scoreError);
      }
      toast({ title: 'Correct!', description: 'Great job!' });
    } else {
      toast({ title: 'Incorrect', description: `The correct answer was: ${currentQuestion.answer}`, variant: 'destructive' });     // Reset buzzer so someone else can try
      await supabase.rpc('reset_buzzer_state', {
        p_session_id: session.id,
        p_question_number: session.current_question_index + 1
      });

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

        {isSessionActive && currentQuestion && (
          <div className="mt-6">
            <div className="mb-4">
              <p className="font-bold text-lg">Question {session.current_question_index + 1} of {test.questions.length}</p>
              <div className="text-xl mt-2 prose question-html" dangerouslySetInnerHTML={{ __html: currentQuestion.text }} />
            </div>
            <div className="space-y-4">
              {!buzzerState.isLocked ? (
                <div className="text-center">
                  <Button
                    onClick={handleBuzzIn}
                    disabled={hasBuzzedIn}
                    size="lg"
                    className="w-full h-20 text-2xl font-bold bg-red-500 hover:bg-red-600 text-white"
                  >
                    {hasBuzzedIn ? 'Buzzed In!' : 'BUZZ IN'}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Click the buzzer when you know the answer!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <p className="font-bold text-lg">
                      {buzzerState.firstBuzzer} buzzed in first!
                    </p>
                  </div>
                  
                  {buzzerState.canAnswer ? (
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="answer-input" className="block text-sm font-medium mb-2">
                          Your Answer:
                        </label>
                        <input
                          id="answer-input"
                          type="text"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          className="w-full p-3 border rounded-lg text-lg"
                          placeholder="Type your answer here..."
                          disabled={!!answerStatus}
                          onKeyPress={(e) => e.key === 'Enter' && handleAnswerSubmit()}
                        />
                      </div>
                      <Button
                        onClick={handleAnswerSubmit}
                        disabled={!userAnswer.trim() || !!answerStatus}
                        className="w-full"
                        size="lg"
                      >
                        Submit Answer
                      </Button>
                      {answerStatus && (
                        <div className={`text-center p-3 rounded-lg ${
                          answerStatus === 'correct' 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                            : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                        }`}>
                          <p className="font-bold">
                            {answerStatus === 'correct' ? '✓ Correct!' : '✗ Incorrect'}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <p>Wait for {buzzerState.firstBuzzer} to answer...</p>
                    </div>
                  )}
                </div>
              )}
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
      <div className="w-full lg:w-1/3">
        <LiveLeaderboard participants={participants} />
      </div>
    </div>
  );
};

export default LiveSession;
