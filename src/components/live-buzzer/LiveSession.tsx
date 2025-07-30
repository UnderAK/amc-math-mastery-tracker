import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types'; // Corrected import path
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, CheckIcon } from 'lucide-react';
import { getTestById, AmcTest } from '@/data/amc-tests';

// Use the generated types directly from the view
type Participant = Database['public']['Views']['session_participants_with_profiles']['Row'];

type SessionData = Database['public']['Tables']['live_sessions']['Row'] & {
  session_participants_with_profiles: Participant[];
};

const LiveSession = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const { toast } = useToast();

  const isGuestMode = location.state?.isGuest || sessionId?.startsWith('guest-');

  const [session, setSession] = useState<SessionData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [userId, setUserId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  // --- Guest Session Initialization ---
  useEffect(() => {
    if (!isGuestMode) {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id);
        };
        checkUser();
        return;
    }

    setIsLoading(true);
    let sessionData = location.state;
    if (!sessionData) {
      const storedData = sessionStorage.getItem(`guest-session-${sessionId}`);
      if (storedData) sessionData = JSON.parse(storedData);
    }

    if (!sessionData) {
      toast({ title: 'Guest session expired', variant: 'destructive' });
      setIsLoading(false);
      return;
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
      session_participants_with_profiles: [],
    };
    const guestParticipant: Participant = {
      id: 'guest-participant',
      session_id: sessionId!,
      user_id: 'guest-user',
      joined_at: new Date().toISOString(),
      score: 0,
      username: 'Guest',
      avatar: null,
    };
    setSession(guestSession);
    setParticipants([guestParticipant]);
    setUserId('guest-user');
    setIsLoading(false);
  }, [isGuestMode, sessionId, location.state, toast]);

  // --- Authenticated Session & Real-time Updates ---
  useEffect(() => {
    if (isGuestMode || !userId) return;

    const fetchSessionData = async () => {
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*, session_participants_with_profiles(*)')
        .eq('id', sessionId)
        .single();

      if (error || !data) {
        setIsLoading(false);
        toast({ title: 'Error fetching session', description: error?.message || 'Session not found.', variant: 'destructive' });
        return;
      }

      const typedData = data as SessionData;
      setSession(typedData);
      setParticipants(typedData.session_participants_with_profiles || []);
      setIsLoading(false);
    };

    fetchSessionData();

    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_sessions', filter: `id=eq.${sessionId}` },
        (payload) => {
            console.log('Session change received', payload);
            const updatedSession = payload.new as SessionData;
            setSession(prev => ({...prev, ...updatedSession}));
            if(updatedSession.session_participants_with_profiles) {
                setParticipants(updatedSession.session_participants_with_profiles);
            }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, userId, isGuestMode, toast]);

  // --- UI and Business Logic ---
  const test: AmcTest | undefined = useMemo(() => {
    if (!session && !isGuestMode) return undefined;
    const testType = isGuestMode ? location.state.test_type : session?.test_type;
    const testYear = isGuestMode ? location.state.test_year : session?.test_year;
    if (!testType || !testYear) return undefined;
    const testId = `${testType.toLowerCase().replace(/\s+/g, '')}-${testYear}`;
    return getTestById(testId);
  }, [session, isGuestMode, location.state]);

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
            <p className="text-muted-foreground">Status: <span className="font-semibold capitalize">{session.status.replace('_', ' ')}</span></p>
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
                <span className="font-bold">{p.score || 0} pts</span>
                </li>
            ))}
            </ul>
        </div>
    </div>
  );
};

export default LiveSession;
