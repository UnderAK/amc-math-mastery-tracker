-- Creates a trigger that fires on new user sign-up and creates a corresponding profile
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar');
  return new;
end;
$$ language plpgsql security definer;

-- The trigger that fires after a new user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
