-- This migration fixes the join code functionality by allowing any authenticated user to look up a session.

-- 1. Drop the restrictive policy that only allows participants to view sessions.
DROP POLICY IF EXISTS "Allow participants to view sessions they are in" ON public.live_sessions;

-- 2. Create a new, more permissive policy that allows any authenticated user to view any session.
-- This is safe because sensitive data is not stored in the live_sessions table.
-- The ability to join is still protected by the insert policy on live_participants.
CREATE POLICY "Allow authenticated users to view sessions" 
ON public.live_sessions FOR SELECT
TO authenticated
USING (true);
