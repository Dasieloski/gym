import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be configured');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadToSupabase(
  file: File,
  bucket: string = 'avatars',
  folder: string = 'profiles'
): Promise<{ url: string; path: string }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
  const extension = file.name.split('.').pop() || 'jpg';
  const filename = `${folder}/profile-${uniqueSuffix}.${extension}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Error al subir archivo a Supabase: ${error.message}`);
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
}

export async function deleteFromSupabase(
  path: string,
  bucket: string = 'avatars'
): Promise<boolean> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.error('Supabase delete error:', error);
    return false;
  }
  return true;
}