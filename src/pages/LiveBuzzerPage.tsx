import React from 'react';
import { useParams } from 'react-router-dom';
import LiveBuzzerLobby from '@/components/live-buzzer/LiveBuzzerLobby';
import LiveSession from '@/components/live-buzzer/LiveSession';

const LiveBuzzerPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          {sessionId ? 'Live Session' : 'Live Buzzer Lobby'}
        </h1>
        <p className="text-muted-foreground">
          {sessionId
            ? 'The test is in progress. Answer quickly and accurately!'
            : 'Challenge your friends in a real-time AMC test battle!'}
        </p>
      </header>
      <main>
        {sessionId ? <LiveSession sessionId={sessionId} /> : <LiveBuzzerLobby />}
      </main>
    </div>
  );
};

export default LiveBuzzerPage;
