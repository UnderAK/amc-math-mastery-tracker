CREATE OR REPLACE FUNCTION get_random_questions(p_competition TEXT, p_limit INT)
RETURNS SETOF questions AS $$
BEGIN
  RETURN QUERY
  SELECT q.*
  FROM questions q
  JOIN tests t ON q.test_id = t.id
  WHERE t.competition = p_competition
  ORDER BY random()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
