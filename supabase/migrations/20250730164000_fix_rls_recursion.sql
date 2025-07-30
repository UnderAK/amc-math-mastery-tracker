-- This migration fixes an infinite recursion bug in the RLS policies for the live buzzer feature.

-- 1. Drop all potentially conflicting policies to ensure a clean slate.
DROP POLICY IF EXISTS "Allow participants to view others in the same session" ON public.live_participants;
DROP POLICY IF EXISTS "Allow participants to view their own participant record" ON public.live_participants;
DROP POLICY IF EXISTS "Allow participants to view sessions they are in" ON public.live_sessions;
DROP POLICY IF EXISTS "Allow participants to view their session" ON public.live_sessions; -- Old name

-- 2. Create a new, non-recursive policy for participants to see their OWN record.
-- This is the key to breaking the recursion.
CREATE POLICY "Allow participants to view their own participant record" 
ON public.live_participants FOR SELECT
USING (auth.uid() = user_id);

-- 3. Re-create the policy for viewing a session, which depends on the above policy.
-- This is no longer recursive because the subquery now relies on a non-recursive policy.
CREATE POLICY "Allow participants to view sessions they are in" 
ON public.live_sessions FOR SELECT
USING (
  auth.uid() = host_id OR
  id IN (SELECT session_id FROM public.live_participants WHERE user_id = auth.uid())
);

-- 4. Re-create the policy for viewing other participants in the same session.
-- This now depends on the base policy and is no longer recursive.
CREATE POLICY "Allow participants to view others in the same session" 
ON public.live_participants FOR SELECT
USING (
    session_id IN (SELECT session_id FROM public.live_participants WHERE user_id = auth.uid())
);
