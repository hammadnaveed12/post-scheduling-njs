import { getSupabaseBrowserClient } from './clients/browser-client';

const supabase = getSupabaseBrowserClient();

// Create a new post
export async function createPost(
  userId: string,
  type: 'text' | 'media',
  content: string | null,
  mediaUrl?: string,
  coverImageUrl?: string,
  scheduledTime?: string | null,
  status: 'draft' | 'scheduled' | 'published' = 'draft',
) {
  const { data, error } = await supabase
    .from('posts')
    .insert([
      {
        user_id: userId,
        type,
        content,
        media_url: mediaUrl,
        cover_image_url: coverImageUrl,
        scheduled_time: scheduledTime,
        status,
      },
    ])
    .select();

  if (error) throw error;
  return data;
}

// Fetch posts for a user
export async function getUserPosts(
  userId: string,
  status?: 'draft' | 'scheduled' | 'published',
) {
  let query = supabase.from('posts').select('*').eq('user_id', userId);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Update post status (e.g., schedule, publish, unpublish)
export async function updatePostStatus(
  postId: string,
  status: 'draft' | 'scheduled' | 'published',
) {
  const { data, error } = await supabase
    .from('posts')
    .update({ status })
    .eq('id', postId)
    .select();
  if (error) throw error;
  return data;
}

export async function updateCoverImage(postId: string, coverImageUrl: string) {
  const { data, error } = await supabase
    .from('posts')
    .update({ cover_image_url: coverImageUrl })
    .eq('id', postId)
    .select();

  if (error) throw error;
  return data;
}
