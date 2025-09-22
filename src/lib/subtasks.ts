import { supabase } from './supabase';

export interface Subtask {
  id: string;
  title: string;
  parent_task_id: string;
  status: 'pending' | 'in-progress' | 'done';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const subtaskHelpers = {
  // Get all subtasks for a specific task
  getSubtasks: async (parentTaskId: string) => {
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('parent_task_id', parentTaskId)
      .order('created_at', { ascending: true });
    
    return { data, error };
  },

  // Create a new subtask
  createSubtask: async (title: string, parentTaskId: string, userId: string) => {
    const { data, error } = await supabase
      .from('subtasks')
      .insert([
        {
          title,
          parent_task_id: parentTaskId,
          status: 'pending',
          user_id: userId
        }
      ])
      .select()
      .single();
    
    return { data, error };
  },

  // Update subtask status
  updateSubtaskStatus: async (subtaskId: string, status: 'pending' | 'in-progress' | 'done') => {
    const { data, error } = await supabase
      .from('subtasks')
      .update({ status })
      .eq('id', subtaskId)
      .select()
      .single();
    
    return { data, error };
  },

  // Delete a subtask
  deleteSubtask: async (subtaskId: string) => {
    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', subtaskId);
    
    return { error };
  },

  // Generate subtasks using AI
  generateSubtasks: async (taskTitle: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-subtasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskTitle }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate subtasks');
    }

    const data = await response.json();
    return data.subtasks;
  }
};