import { supabase } from './supabase';

export interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'done';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const taskHelpers = {
  // Get all tasks for the current user
  getTasks: async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // Create a new task
  createTask: async (title: string, userId: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          title,
          priority,
          status: 'pending',
          user_id: userId,
        }
      ])
      .select()
      .single();
    
    // Generate embedding for the new task
    if (data && !error) {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fbatqlzufxrurjdalxga.supabase.co';
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (supabaseAnonKey) {
          await fetch(`${supabaseUrl}/functions/v1/generate-task-embedding`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ taskId: data.id, title }),
          });
        }
      } catch (embeddingError) {
        console.warn('Failed to generate embedding for new task:', embeddingError);
      }
    }
    
    return { data, error };
  },

  // Update task status
  updateTaskStatus: async (taskId: string, status: 'pending' | 'in-progress' | 'done') => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId)
      .select()
      .single();
    
    return { data, error };
  },

  // Update task priority
  updateTaskPriority: async (taskId: string, priority: 'low' | 'medium' | 'high') => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ priority })
      .eq('id', taskId)
      .select()
      .single();
    
    return { data, error };
  },

  // Update task title
  updateTaskTitle: async (taskId: string, title: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ title })
      .eq('id', taskId)
      .select()
      .single();
    
    return { data, error };
  },

  // Delete a task
  deleteTask: async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
    
    return { error };
  }
};