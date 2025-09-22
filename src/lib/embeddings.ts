import { supabase } from './supabase';

export const embeddingHelpers = {
  // Generate embeddings for all tasks that don't have them
  generateAllEmbeddings: async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fbatqlzufxrurjdalxga.supabase.co';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseAnonKey) {
      throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
    }
    
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate embeddings');
    }

    const data = await response.json();
    return data;
  }
};