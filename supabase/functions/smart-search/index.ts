import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface RequestPayload {
  query: string;
  userId: string;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { query, userId }: RequestPayload = await req.json();

    if (!query || !userId) {
      return new Response(
        JSON.stringify({ error: "Query and userId are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate embedding for the search query using Supabase AI
    const model = new Supabase.ai.Session('gte-small');
    const queryEmbedding = await model.run(query.trim(), { mean_pool: true, normalize: true });

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First check if we have any tasks with embeddings for this user
    const { data: tasksWithEmbeddings, error: checkError } = await supabase
      .from('tasks')
      .select('id, title, priority, status, created_at, updated_at')
      .eq('user_id', userId)
      .not('embedding', 'is', null);


    if (checkError) {
      console.error('Error checking for tasks with embeddings:', checkError);
      return new Response(
        JSON.stringify({ error: "Failed to check tasks" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // If no tasks or subtasks have embeddings, return empty results
    const totalWithEmbeddings = tasksWithEmbeddings?.length || 0;
    if (totalWithEmbeddings === 0) {
      console.log('No tasks have embeddings yet');
      return new Response(
        JSON.stringify({ tasks: [] }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Found ${tasksWithEmbeddings?.length || 0} tasks with embeddings`);

    // Perform vector similarity search using SQL query instead of RPC
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, title, priority, status, created_at, updated_at, embedding')
      .eq('user_id', userId)
      .not('embedding', 'is', null);


    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: "Failed to search tasks" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }


    // Calculate similarity scores for tasks
    const tasksWithSimilarity = tasks
      .map(task => {
        if (!task.embedding || !Array.isArray(task.embedding)) {
          console.log(`Task ${task.id} has invalid embedding:`, task.embedding);
          return null;
        }
        // Calculate cosine similarity between query embedding and task embedding
        const similarity = calculateCosineSimilarity(queryEmbedding, task.embedding);
        console.log(`Task "${task.title}" similarity: ${similarity}`);
        return {
          id: task.id,
          title: task.title,
          priority: task.priority,
          status: task.status,
          created_at: task.created_at,
          updated_at: task.updated_at,
          similarity: similarity
        };
      })
      .filter(task => task !== null)
      .filter(task => task.similarity >= 0.2); // Even lower threshold for testing

    // Combine and sort all results
    const allResults = tasksWithSimilarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10); // Return more results

    console.log(`Returning ${allResults.length} results`);

    return new Response(
      JSON.stringify({ tasks: allResults }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Helper function to calculate cosine similarity
function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}