-- This script is designed to be idempotent and robustly fix the state of the live buzzer feature.

-- 1. Create the live_answers table if it doesn't exist.
CREATE TABLE IF NOT EXISTS public.live_answers (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Add all required columns to live_answers if they don't exist.
DO $$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='live_answers' AND column_name='session_id') THEN
        ALTER TABLE public.live_answers ADD COLUMN session_id uuid NOT NULL;
    END IF;
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='live_answers' AND column_name='user_id') THEN
        ALTER TABLE public.live_answers ADD COLUMN user_id uuid NOT NULL;
    END IF;
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='live_answers' AND column_name='question_index') THEN
        ALTER TABLE public.live_answers ADD COLUMN question_index integer NOT NULL;
    END IF;
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='live_answers' AND column_name='answer') THEN
        ALTER TABLE public.live_answers ADD COLUMN answer text NOT NULL;
    END IF;
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='live_answers' AND column_name='is_correct') THEN
        ALTER TABLE public.live_answers ADD COLUMN is_correct boolean NOT NULL;
    END IF;
END $$;

-- 3. Add foreign key constraints if they don't exist.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.live_answers'::regclass AND conname = 'live_answers_session_id_fkey') THEN
        ALTER TABLE public.live_answers ADD CONSTRAINT live_answers_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.live_sessions(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.live_answers'::regclass AND conname = 'live_answers_user_id_fkey') THEN
        ALTER TABLE public.live_answers ADD CONSTRAINT live_answers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Add UNIQUE constraint.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.live_answers'::regclass AND conname = 'live_answers_session_id_user_id_question_index_key') THEN
        ALTER TABLE public.live_answers ADD CONSTRAINT live_answers_session_id_user_id_question_index_key UNIQUE (session_id, user_id, question_index);
    END IF;
END $$;

-- 5. RLS POLICIES (with DROP IF EXISTS for idempotency)
DROP POLICY IF EXISTS "Allow host to update their own session" ON public.live_sessions; 
CREATE POLICY "Allow host to update their own session" ON public.live_sessions FOR UPDATE USING (auth.uid() = host_id) WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "Allow participants to view their session" ON public.live_sessions;
CREATE POLICY "Allow participants to view their session" ON public.live_sessions FOR SELECT USING (auth.uid() = host_id OR id IN (SELECT session_id FROM public.live_participants WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Allow authenticated users to join sessions" ON public.live_participants;
CREATE POLICY "Allow authenticated users to join sessions" ON public.live_participants FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow participants to view others in their session" ON public.live_participants;
CREATE POLICY "Allow participants to view others in their session" ON public.live_participants FOR SELECT USING (session_id IN (SELECT session_id FROM public.live_participants WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Allow participants to submit answers" ON public.live_answers;
CREATE POLICY "Allow participants to submit answers" ON public.live_answers FOR INSERT WITH CHECK (user_id = auth.uid() AND session_id IN (SELECT session_id FROM public.live_participants WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Allow participants to view their own answers" ON public.live_answers;
CREATE POLICY "Allow participants to view their own answers" ON public.live_answers FOR SELECT USING (user_id = auth.uid());
