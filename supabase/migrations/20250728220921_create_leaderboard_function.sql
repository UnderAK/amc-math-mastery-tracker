create or replace function get_leaderboard()
returns table (
  user_id uuid,
  username text,
  avatar text,
  total_xp bigint
)
language sql
security definer
as $$
  select
    p.id as user_id,
    p.username,
    p.avatar,
    (select coalesce(sum(score), 0) from test_results where user_id = p.id) as total_xp
  from
    profiles p
  order by
    total_xp desc
  limit 10;
$$;
