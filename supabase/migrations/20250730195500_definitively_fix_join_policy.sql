-- This migration provides a definitive fix for the join code functionality.
-- It ensures that any authenticated user can look up a session by its join code.

-- 1. Drop ALL potentially conflicting SELECT policies on the live_sessions table to ensure a clean slate.
DROP POLICY IF EXISTS "Allow participants to view sessions they are in" ON public.live_sessions;
DROP POLICY IF EXISTS "Allow authenticated users to view sessions" ON public.live_sessions;
DROP POLICY IF EXISTS "Allow anyone to view sessions" ON public.live_sessions; -- Drop legacy policy if it exists

-- 2. Create the single, correct policy that allows any authenticated user to view session details.
-- This is required to look up a session by its join code before becoming a participant.
CREATE POLICY "Allow authenticated users to look up sessions" 
ON public.live_sessions FOR SELECT
TO authenticated
USING (true);
