/*
  # Add vector embeddings for tasks

  1. New Columns
    - Add `embedding` column to tasks table for storing vector embeddings
    - Add `content_hash` column to track when embeddings need updates

  2. Extensions
    - Enable vector extension for similarity search

  3. Indexes
    - Add vector similarity index for fast searches

  4. Functions
    - Add function to generate embeddings for existing tasks
*/

-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to tasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'embedding'
  ) THEN
    ALTER TABLE tasks ADD COLUMN embedding vector(384);
  END IF;
END $$;

-- Add content hash column to track when embeddings need updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'content_hash'
  ) THEN
    ALTER TABLE tasks ADD COLUMN content_hash text;
  END IF;
END $$;

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS tasks_embedding_idx ON tasks USING ivfflat (embedding vector_cosine_ops);

-- Function to calculate content hash
CREATE OR REPLACE FUNCTION calculate_task_content_hash(task_title text)
RETURNS text AS $$
BEGIN
  RETURN md5(task_title);
END;
$$ LANGUAGE plpgsql;