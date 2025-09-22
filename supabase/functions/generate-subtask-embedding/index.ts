import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface RequestPayload {
  subtaskId: string;
  title: string;
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

    const { subtaskId, title }: RequestPayload = await req.json();

    if (!subtaskId || !title) {
      return new Response(
        JSON.stringify({ error: "Subtask ID and title are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate embedding using Supabase AI
    const model = new Supabase.ai.Session('gte-small');
    const embedding = await model.run(title, { mean_pool: true, normalize: true });
    
    // Create content hash
    const contentHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(title)
    );
    const hashArray = Array.from(new Uint8Array(contentHash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update subtask with embedding and content hash
    const { error: updateError } = await supabase
      .from('subtasks')
      .update({
        embedding: embedding,
        content_hash: hashHex
      })
      .eq('id', subtaskId);

    if (updateError) {
      console.error('Error updating subtask with embedding:', updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update subtask with embedding" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "Embedding generated successfully" }),
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