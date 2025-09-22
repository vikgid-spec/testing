import { supabase } from './supabase';

export interface SearchResult {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'done';
  created_at: string;
  updated_at: string;
  similarity: number;
}

export const searchHelpers = {
  // Smart search using vector similarity
  smartSearch: async (query: string, userId: string): Promise<SearchResult[]> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const response = await fetch(`${supabaseUrl}/functions/v1/smart-search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to perform smart search');
    }

    const data = await response.json();
    return data.tasks || [];
  }
};