-- Drop the old, flawed buzz_in function
DROP FUNCTION IF EXISTS public.buzz_in(uuid, uuid, integer);

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Allow participants to insert buzzer state" ON public.live_buzzer_state;
DROP POLICY IF EXISTS "Allow participants to update buzzer state" ON public.live_buzzer_state;

-- Create a helper function to check if a user is a participant in a session
CREATE OR REPLACE FUNCTION is_session_participant(p_session_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM live_participants
    WHERE session_id = p_session_id AND user_id = p_user_id
  );
$$;

-- Create new, stricter RLS policies for live_buzzer_state
CREATE POLICY "Allow participants to insert buzzer state" ON public.live_buzzer_state
FOR INSERT TO authenticated
WITH CHECK (is_session_participant(session_id, auth.uid()));

CREATE POLICY "Allow participants to update buzzer state" ON public.live_buzzer_state
FOR UPDATE TO authenticated
USING (is_session_participant(session_id, auth.uid()));


-- Create the new, corrected buzz_in function with proper locking to prevent race conditions
CREATE OR REPLACE FUNCTION public.buzz_in(
    p_session_id uuid,
    p_participant_id uuid,
    p_question_number integer
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    buzzer_record record;
    participant_name text;
    current_user_id uuid := auth.uid();
BEGIN
    -- First, ensure the caller is actually the participant they claim to be
    IF NOT EXISTS (SELECT 1 FROM live_participants WHERE id = p_participant_id AND user_id = current_user_id) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Authorization error.');
    END IF;

    -- Begin a transaction and lock the potential row to prevent race conditions
    BEGIN
        -- Attempt to insert a new buzzer state. If it already exists, we'll lock it in the next step.
        INSERT INTO live_buzzer_state (session_id, question_number)
        VALUES (p_session_id, p_question_number)
        ON CONFLICT (session_id, question_number) DO NOTHING;

        -- Lock the row for this session/question and try to set the first buzzer.
        -- The FOR UPDATE ensures that no other transaction can modify this row until the current one is complete.
        UPDATE live_buzzer_state
        SET 
            first_buzzer_participant_id = p_participant_id,
            buzzer_locked = true
        WHERE 
            session_id = p_session_id AND 
            question_number = p_question_number AND 
            first_buzzer_participant_id IS NULL
        RETURNING * INTO buzzer_record;
    END;

    -- If the update was successful (buzzer_record is not null), this user is the first buzzer.
    IF buzzer_record IS NOT NULL THEN
        SELECT username INTO participant_name FROM profiles WHERE id = current_user_id;
        RETURN jsonb_build_object(
            'success', true,
            'first_buzzer', true,
            'participant_name', participant_name,
            'message', 'You buzzed in first!'
        );
    ELSE
        -- If the update failed, it means another user buzzed first. Fetch the state to see who it was.
        SELECT * INTO buzzer_record
        FROM live_buzzer_state
        WHERE session_id = p_session_id AND question_number = p_question_number;

        -- Get the name of the participant who buzzed first.
        SELECT p.username INTO participant_name
        FROM live_participants lp
        JOIN profiles p ON lp.user_id = p.id
        WHERE lp.id = buzzer_record.first_buzzer_participant_id;
        
        RETURN jsonb_build_object(
            'success', true,
            'first_buzzer', false,
            'first_buzzer_name', participant_name,
            'message', participant_name || ' buzzed in first!'
        );
    END IF;
END;
$$;
