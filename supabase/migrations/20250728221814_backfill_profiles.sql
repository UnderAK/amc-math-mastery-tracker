-- This script backfills the profiles table for existing users.
-- It's safe to run multiple times.
insert into public.profiles (id, username, avatar)
select 
    id, 
    raw_user_meta_data->>'username' as username,
    raw_user_meta_data->>'avatar' as avatar
from auth.users
on conflict (id) do nothing;
