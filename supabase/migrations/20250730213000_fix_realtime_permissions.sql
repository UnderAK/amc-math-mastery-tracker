-- This policy grants usage access on the realtime schema to authenticated users.
-- This is necessary to allow them to connect to the realtime websocket.
GRANT USAGE ON SCHEMA realtime TO authenticated;

-- This policy allows authenticated users to read all messages on the realtime publication.
-- You may want to restrict this further based on your application's needs.
ALTER DEFAULT PRIVILEGES IN SCHEMA realtime GRANT SELECT ON TABLES TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA realtime TO authenticated;
