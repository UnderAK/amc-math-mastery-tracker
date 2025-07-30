-- Add current_question_index to live_sessions table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='live_sessions' AND column_name='current_question_index') THEN
    ALTER TABLE public.live_sessions ADD COLUMN current_question_index integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Update the RLS policy to allow the host to update the question index and status
DROP POLICY IF EXISTS "Allow host to update their own session" ON public.live_sessions;
CREATE POLICY "Allow host to update their own session" ON public.live_sessions 
FOR UPDATE USING (auth.uid() = host_id) 
WITH CHECK (auth.uid() = host_id);
