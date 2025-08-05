import React from 'react';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEffect } from 'react';

const LiveBuzzerLobby = () => {
  const [joinCode, setJoinCode] = useState('');
  const [testType, setTestType] = useState('AMC 10');
  const [testYear, setTestYear] = useState(2023);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsGuestMode(!session);
    };
    checkAuth();
  }, []);

  const handleCreateSession = async () => {
    setIsCreating(true);

    if (isGuestMode) {
      const guestSessionId = `guest-${Math.random().toString(36).substring(2, 9)}`;
      const guestSessionData = {
        isGuest: true,
        test_type: testType,
        test_year: testYear
      };
      // Store guest session details in sessionStorage to survive refresh
      sessionStorage.setItem(`guest-session-${guestSessionId}`, JSON.stringify(guestSessionData));

      toast({ title: 'Entering Guest Session', description: 'Your session is local and will not be saved.' });
      setIsLoading(true);
      navigate(`/live-buzzer/${guestSessionId}`, { state: guestSessionData });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { // Should not happen if not guest mode, but as a fallback
      toast({ title: 'Error', description: 'You must be logged in to create a session.', variant: 'destructive' });
      setIsCreating(false);
      return;
    }

    const { data, error } = await supabase.rpc('create_session_and_add_host', {
      p_test_type: testType,
      p_test_year: testYear,
    });

    console.log('Session creation result:', { data, error });

    if (error) {
      console.error('Session creation error:', error);
      toast({ title: 'Failed to create session', description: error.message, variant: 'destructive' });
      setIsCreating(false);
    } else if (data) {
      console.log('Session created successfully with ID:', data);
      toast({ title: 'Session Created!', description: `Session ID: ${data}` });
      setIsLoading(true);
      
      // Add a small delay to ensure the database transaction is committed
      setTimeout(() => {
        navigate(`/live-buzzer/${data}`);
      }, 500);
    } else {
      console.error('No data returned from session creation');
      toast({ title: 'Failed to create session', description: 'No session ID returned', variant: 'destructive' });
      setIsCreating(false);
    }
  };

  const handleJoinSession = async () => {
    if (!joinCode) {
      toast({ title: 'Error', description: 'Please enter a join code.', variant: 'destructive' });
      return;
    }
    setIsJoining(true);
    console.log(`[DEBUG] Attempting to join session with code: ${joinCode.toUpperCase()}`);

    const { data: sessionId, error: rpcError } = await supabase.rpc('get_session_by_code', {
      p_join_code: joinCode.toUpperCase(),
    });

    console.log('[DEBUG] RPC Response:', { sessionId, rpcError });

    if (rpcError || !sessionId) {
      toast({ title: 'Session not found', description: 'Invalid join code.', variant: 'destructive' });
      setIsJoining(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    console.log('[DEBUG] Current user:', user);

    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to join a session.', variant: 'destructive' });
      setIsJoining(false);
      return;
    }

    console.log(`[DEBUG] Inserting into live_participants:`, { session_id: sessionId, user_id: user.id });
    const { error: joinError } = await supabase
      .from('live_participants')
      .insert({ session_id: sessionId, user_id: user.id });

    console.log('[DEBUG] Join attempt result:', { joinError });

    if (joinError) {
      // Handle unique constraint violation (already joined)
      if (joinError.code === '23505') {
        toast({ title: 'Already in session', description: 'You have already joined this session.' });
      } else {
        toast({ title: 'Failed to join session', description: joinError.message, variant: 'destructive' });
        setIsJoining(false);
        return;
      }
    }

    setIsLoading(true); // Show loading state before navigating
    console.log(`[DEBUG] Navigating to /live-buzzer/${sessionId}`);
    navigate(`/live-buzzer/${sessionId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 grid md:grid-cols-2 gap-8">
      {/* Create Session Card */}
      <div className="glass p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Create a New Session</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="testType" className="block text-sm font-medium text-muted-foreground">Test Type</label>
            <select 
              id="testType" 
              value={testType} 
              onChange={(e) => setTestType(e.target.value)} 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
            >
              <option>AMC 10</option>
              <option>AMC 12</option>
            </select>
          </div>
          <div>
            <label htmlFor="testYear" className="block text-sm font-medium text-muted-foreground">Year</label>
            <Input
              id="testYear"
              type="number"
              value={testYear}
              onChange={(e) => {
                const year = parseInt(e.target.value);
                if (!isNaN(year)) {
                  setTestYear(year);
                }
              }}
            />
          </div>
          <Button onClick={handleCreateSession} disabled={isCreating} className="w-full">
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
            Create Session
          </Button>
        </div>
      </div>

      {/* Join Session Card */}
      <div className={`glass p-6 rounded-lg ${isGuestMode ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="w-full">
              <h2 className="text-2xl font-bold mb-4 text-left">Join a Session</h2>
            </TooltipTrigger>
            {isGuestMode && (
              <TooltipContent>
                <p>Joining sessions requires an account. Please log in to use this feature.</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        <div className="space-y-4">
          <Input
            placeholder="Enter Join Code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="text-center text-lg tracking-widest"
            disabled={isGuestMode}
          />
          <Button onClick={handleJoinSession} disabled={isJoining || isGuestMode} className="w-full">
            {isJoining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
            Join Session
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LiveBuzzerLobby;
