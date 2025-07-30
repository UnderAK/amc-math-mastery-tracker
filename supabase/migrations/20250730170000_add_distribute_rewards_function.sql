create or replace function distribute_session_rewards(p_session_id uuid)
returns void
language plpgsql
-- SECURITY DEFINER is used to grant this function the necessary permissions to update user profiles.
-- The logic is safe as it only uses the session ID to distribute a fixed amount of coins.
security definer
as $$
declare
  participant_record record;
  rank int := 0;
  bonus_coins int;
begin
  -- Loop through participants, sorted by score descending, to assign ranks and award coins.
  for participant_record in
    select
      user_id,
      score
    from public.live_participants
    where session_id = p_session_id
    order by score desc
  loop
    rank := rank + 1;

    -- Determine bonus coins based on rank.
    if rank = 1 then
      bonus_coins := 15;
    elsif rank = 2 then
      bonus_coins := 10;
    elsif rank = 3 then
      bonus_coins := 5;
    else
      bonus_coins := 0;
    end if;

    -- Update the user's profile with a base of 5 coins plus any rank-based bonus.
    update public.profiles
    set coin_balance = coin_balance + 5 + bonus_coins
    where id = participant_record.user_id;

  end loop;
end;
$$;
