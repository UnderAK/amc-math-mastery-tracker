CREATE OR REPLACE FUNCTION get_session_participants(p_session_id UUID)
RETURNS TABLE (user_id UUID, username TEXT, avatar_url TEXT, score INT, last_correct_answer_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First, check if the current user is a participant of the session
  IF EXISTS (
    SELECT 1
    FROM public.live_session_participants
    WHERE session_id = p_session_id AND user_id = auth.uid()
  ) THEN
    -- If they are, return all participants for that session
    RETURN QUERY
    SELECT
      lsp.user_id,
      p.username,
      p.avatar_url,
      lsp.score,
      lsp.last_correct_answer_at
    FROM
      public.live_session_participants AS lsp
    JOIN
      public.profiles AS p ON lsp.user_id = p.id
    WHERE
      lsp.session_id = p_session_id;
  END IF;
END;
$$;
