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
    IF NOT EXISTS (SELECT 1 FROM live_participants WHERE id = p_participant_id AND user_id = current_user_id) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Authorization error.');
    END IF;

    BEGIN
        INSERT INTO live_buzzer_state (session_id, question_number)
        VALUES (p_session_id, p_question_number)
        ON CONFLICT (session_id, question_number) DO NOTHING;

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

    IF buzzer_record IS NOT NULL THEN
        SELECT username INTO participant_name FROM profiles WHERE id = current_user_id;
        RETURN jsonb_build_object(
            'success', true,
            'first_buzzer', true,
            'participant_name', participant_name,
            'message', 'You buzzed in first!'
        );
    ELSE
        SELECT lbs.first_buzzer_participant_id INTO buzzer_record
        FROM live_buzzer_state lbs
        WHERE lbs.session_id = p_session_id AND lbs.question_number = p_question_number;

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
