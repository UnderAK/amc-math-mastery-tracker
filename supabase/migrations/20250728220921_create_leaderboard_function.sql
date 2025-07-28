create or replace function get_leaderboard()
returns table (
  user_id uuid,
  username text,
  avatar text,
  xp int
)
language sql
security definer
as $$
  select
    p.user_id,
    p.username,
    p.avatar,
    p.xp
  from profiles p
  order by p.xp desc
  limit 10;
$$;
