-- Create the 'tests' table to store metadata about each AMC test.
CREATE TABLE tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- e.g., "2021 AMC 10A"
    year INT NOT NULL,
    competition TEXT NOT NULL, -- e.g., "AMC 10A", "AMC 10B"
    scraped_at TIMESTAMPTZ DEFAULT now()
);

-- Create the 'topics' table to store a master list of math topics.
CREATE TABLE topics (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE -- e.g., "Algebra", "Geometry", "Number Theory", "Combinatorics"
);

-- Create the 'questions' table to store individual questions.
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    question_number INT NOT NULL,
    problem_html TEXT NOT NULL,
    answer TEXT NOT NULL,
    solutions_html JSONB, -- Store multiple solutions in a JSON array
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(test_id, question_number) -- Ensure no duplicate question numbers within the same test
);

-- Create a many-to-many join table to link questions to topics.
CREATE TABLE question_topics (
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    topic_id BIGINT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, topic_id)
);

-- Seed the 'topics' table with the four main AMC categories.
INSERT INTO topics (name) VALUES
    ('Algebra'),
    ('Geometry'),
    ('Number Theory'),
    ('Combinatorics');

-- Add comments to tables and columns for clarity in the Supabase dashboard.
COMMENT ON TABLE tests IS 'Stores metadata for each AMC test, like its name and year.';
COMMENT ON TABLE topics IS 'A master list of all math topics covered in the questions.';
COMMENT ON TABLE questions IS 'Contains the details for each individual question, including its HTML content and answer.';
COMMENT ON TABLE question_topics IS 'A join table linking questions to their relevant mathematical topics.';

COMMENT ON COLUMN questions.problem_html IS 'The full HTML content of the problem statement.';
COMMENT ON COLUMN questions.solutions_html IS 'A JSONB array of objects, where each object represents a single solution with its title and HTML content.';
