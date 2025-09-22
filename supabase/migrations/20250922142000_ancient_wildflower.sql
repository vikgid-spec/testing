/*
  # Add search function for vector similarity

  1. Functions
    - Create RPC function for vector similarity search
    - Add function to generate and update embeddings for tasks
*/

-- Function to search tasks by vector similarity
CREATE OR REPLACE FUNCTION search_tasks_by_similarity(
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  user_id uuid
)
RETURNS TABLE (
  id uuid,
  title text,
  priority text,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.title,
    t.priority,
    t.status,
    t.created_at,
    t.updated_at,
    1 - (t.embedding <=> query_embedding) as similarity
  FROM tasks t
  WHERE t.user_id = search_tasks_by_similarity.user_id
    AND t.embedding IS NOT NULL
    AND 1 - (t.embedding <=> query_embedding) > match_threshold
  ORDER BY t.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;