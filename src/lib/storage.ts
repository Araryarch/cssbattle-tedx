import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Try to get the service role key from multiple common env var names
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                           process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
  console.warn("Service Role Key is missing. Uploads may fail due to RLS.");
}

// ADMIN client with Service Role Key - Bypasses RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function uploadChallengeImage(file: File) {
  if (!file) {
    throw new Error('No file provided');
  }

  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size must be less than 5MB');
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Generate unique filename in questions folder
  const fileExt = file.name.split('.').pop();
  const fileName = `questions/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { data, error } = await supabaseAdmin.storage
    .from('studycase')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('studycase')
    .getPublicUrl(fileName);

  return publicUrl;
}

export async function deleteChallengeImage(imageUrl: string) {
  try {
    // Extract filename from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1];
    
    // Add questions prefix to match folder structure
    const fullPath = fileName.includes('questions/') ? fileName : `questions/${fileName}`;

    const { error } = await supabaseAdmin.storage
      .from('studycase')
      .remove([fullPath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

export async function uploadProfileImage(file: File) {
  if (!file) {
    throw new Error('No file provided');
  }

  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size must be less than 5MB');
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Generate unique filename in avatars folder
  const fileExt = file.name.split('.').pop();
  const fileName = `avatars/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { data, error } = await supabaseAdmin.storage
    .from('studycase')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('studycase')
    .getPublicUrl(fileName);

  return publicUrl;
}