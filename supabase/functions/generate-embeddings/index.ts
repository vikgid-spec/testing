import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all tasks without embeddings
    const { data: tasks, error: fetchError } = await supabase
      .from('tasks')
      .select('id, title')
      .or('embedding.is.null,content_hash.is.null');

    if (fetchError) {
      console.error('Error fetching tasks:', fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch tasks" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const totalItems = tasks?.length || 0;
    if (totalItems === 0) {
      return new Response(
        JSON.stringify({ message: "No tasks need embeddings", processed: 0 }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate embeddings using Supabase AI
    const model = new Supabase.ai.Session('gte-small');
    let processed = 0;

    // Process tasks
    if (tasks && tasks.length > 0) {
      for (const task of tasks) {
        try {
          // Generate embedding for task title
          const embedding = await model.run(task.title, { mean_pool: true, normalize: true });
          
          // Create content hash
          const contentHash = await crypto.subtle.digest(
            'SHA-256',
            new TextEncoder().encode(task.title)
          );
          const hashArray = Array.from(new Uint8Array(contentHash));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

          // Update task with embedding and content hash
          const { error: updateError } = await supabase
            .from('tasks')
            .update({
              embedding: embedding,
              content_hash: hashHex
            })
            .eq('id', task.id);

          if (updateError) {
            console.error(`Error updating task ${task.id}:`, updateError);
          } else {
            processed++;
          }
        } catch (error) {
          console.error(`Error processing task ${task.id}:`, error);
        }
      }
    }


    return new Response(
      JSON.stringify({ 
        message: `Successfully processed ${processed} items`,
        processed,
        total: totalItems
      }),
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