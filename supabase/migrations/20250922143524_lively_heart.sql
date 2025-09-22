/*
  # Add embeddings to subtasks table

  1. Changes
    - Add `embedding` column to subtasks table for vector similarity search
    - Add `content_hash` column to track when embeddings need updates
    - Add vector index for fast similarity searches

  2. Security
    - No changes to existing RLS policies
*/

-- Add embedding column to subtasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subtasks' AND column_name = 'embedding'
  ) THEN
    ALTER TABLE subtasks ADD COLUMN embedding vector(384);
  END IF;
END $$;

-- Add content hash column to subtasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subtasks' AND column_name = 'content_hash'
  ) THEN
    ALTER TABLE subtasks ADD COLUMN content_hash text;
  END IF;
END $$;

-- Create vector similarity index for subtasks
CREATE INDEX IF NOT EXISTS subtasks_embedding_idx ON subtasks USING ivfflat (embedding vector_cosine_ops);