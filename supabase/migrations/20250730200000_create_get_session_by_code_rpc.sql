-- This migration creates a dedicated RPC function to securely fetch a session ID using a join code.
-- This avoids the complexities and failures of using RLS policies for this specific lookup.

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
  WHERE join_code = p_join_code;

  RETURN v_session_id;
END;
$$;

-- Grant execute permission to all authenticated users
GRANT EXECUTE ON FUNCTION public.get_session_by_code(TEXT) TO authenticated;
