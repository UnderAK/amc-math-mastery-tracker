create or replace function get_competitions_by_type(competition_patterns text[])
returns table(id bigint, name text, competition text) as $$
begin
  return query
  select
    t.id,
    t.name,
    t.competition
  from
    tests t
  where
    t.competition ilike any(competition_patterns);
end;
$$ language plpgsql;
