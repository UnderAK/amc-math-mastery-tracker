create or replace function increment_score (participant_id_to_update uuid, score_to_add int)
returns void as $$
  update public.live_participants
  set score = score + score_to_add
  where id = participant_id_to_update;
$$ language sql volatile;

-- Note: For a production app, you would want to add more specific RLS policies
-- to restrict who can call this function, likely using a service_role key from a trusted server.
-- For this project, we'll allow authenticated users to call it.

grant execute on function increment_score(uuid, int) to authenticated;
