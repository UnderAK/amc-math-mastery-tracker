-- This migration updates the get_session_by_code function to be case-insensitive.
-- This ensures that join codes work regardless of the case they are entered in.

CREATE OR REPLACE FUNCTION get_session_by_code(p_join_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_session_id UUID;
BEGIN
  SELECT id
  INTO v_session_id
  FROM public.live_sessions
  WHERE UPPER(join_code) = UPPER(p_join_code); -- Ensures case-insensitive comparison

  RETURN v_session_id;
END;
$$;

-- Grant execute permission to all authenticated users
GRANT EXECUTE ON FUNCTION public.get_session_by_code(TEXT) TO authenticated;
