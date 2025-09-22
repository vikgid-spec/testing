import { supabase } from './supabase';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  updated_at: string;
}

export const profileHelpers = {
  // Get user profile
  getProfile: async (userId: string) => {
    let { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    // If profile doesn't exist, create it
    if (error && error.code === 'PGRST116') {
      const { data: user } = await supabase.auth.getUser()
      if (user.user) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            full_name: user.user.user_metadata?.full_name || '',
            avatar_url: null
          })
          .select()
          .single()
        
        if (createError) {
          return { data: null, error: createError }
        }
        
        data = newProfile
        error = null
      }
    }
    
    return { data, error };
  },

  // Update user profile
  updateProfile: async (userId: string, updates: Partial<Profile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    return { data, error };
  },

  // Upload profile picture
  uploadProfilePicture: async (userId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type
      });

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);

    // Update profile with new avatar URL
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({ avatar_url: urlData.publicUrl })
      .eq('id', userId)
      .select()
      .single();

    return { data: profileData, error: profileError };
  },

  // Delete profile picture
  deleteProfilePicture: async (userId: string) => {
    const fileName = `${userId}/avatar`;

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('profile-pictures')
      .remove([fileName]);

    if (deleteError) {
      return { error: deleteError };
    }

    // Update profile to remove avatar URL
    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', userId)
      .select()
      .single();

    return { data, error };
  }
};