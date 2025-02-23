<<<<<<< Updated upstream
import { getSupabaseBrowserClient } from './clients/browser-client';

const supabase = getSupabaseBrowserClient();

// Create a new post
export async function createPost(
  userId: string,
  type: 'text' | 'media',
  content: string | null,
  mediaUrl?: File | null,
  coverImageUrl?: string,
  scheduledTime?: string | null,
  status: 'draft' | 'scheduled' | 'published' = 'draft',
) {
  let value: any = {
    user_id: userId,
    content,
    type,
    media_url: '',
    cover_image_url: '',
    scheduled_time: scheduledTime,
    status,
  };

  if (type == 'media') {
    const { data: res, error: err } = await supabase.storage
      .from('post_media')
      .upload(`${mediaUrl!.name}`, mediaUrl!, {
        cacheControl: '3600',
        upsert: false,
      });

    const {
      data: { publicUrl },
    } = await supabase.storage
      .from('post_media')
      .getPublicUrl(`${mediaUrl!.name}`);

    value.format = mediaUrl?.type.startsWith('image/') ? 'image' : 'video';
    value.cover_image_url = publicUrl;
    value.media_url = publicUrl;
  }

  const { data, error } = await supabase.from('posts').insert([value]).select();

  if (error) throw error;
  return data;
}

export async function updatePost(
  userId: string,
  type: 'text' | 'media',
  content: string | null,
  post: any,
  mediaUrl?: File | null,
  coverImageUrl?: string,
  scheduledTime?: string | null,
  status: 'draft' | 'scheduled' | 'published' = 'draft',
) {
  let value: any = {
    user_id: userId,
    content,
    media_url: coverImageUrl,
    cover_image_url: coverImageUrl,
    scheduled_time: scheduledTime,
    status,
  };

  if (mediaUrl?.name) {
    const { data: res, error: err } = await supabase.storage
      .from('post_media')
      .upload(`${mediaUrl!.name}`, mediaUrl!, {
        cacheControl: '3600',
        upsert: false,
      });

    const {
      data: { publicUrl: image },
    } = await supabase.storage
      .from('post_media')
      .getPublicUrl(`${mediaUrl!.name}`);

    value.cover_image_url = image;
    value.media_url = image;
    value.format = mediaUrl?.type.startsWith('image/') ? 'image' : 'video';
  }

  const { data, error } = await supabase
    .from('posts')
    .update(value)
    .eq('id', post.id)
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
=======
import { getSupabaseBrowserClient } from './clients/browser-client';

const supabase = getSupabaseBrowserClient();

// Create a new post
export async function createPost(
  userId: string,
  type: 'text' | 'media',
  content: string | null,
  mediaUrl?: File | null,
  coverImageUrl?: string,
  scheduledTime?: string | null,
  status: 'draft' | 'scheduled' | 'published' = 'draft',
) {
  let value: any = {
    user_id: userId,
    content,
    type,
    media_url: '',
    cover_image_url: '',
    scheduled_time: scheduledTime,
    status,
  };

  if (type == 'media') {
    const { data: res, error: err } = await supabase.storage
      .from('post_media')
      .upload(`${mediaUrl!.name}`, mediaUrl!, {
        cacheControl: '3600',
        upsert: false,
      });

    console.log(err);

    const {
      data: { publicUrl },
    } = await supabase.storage
      .from('post_media')
      .getPublicUrl(`${mediaUrl!.name}`);

    value.format = mediaUrl?.type.startsWith('image/') ? 'image' : 'video';
    value.cover_image_url = publicUrl;
    value.media_url = publicUrl;
  }

  const { data, error } = await supabase.from('posts').insert(value).select();

  if (error) throw error;
  return data;
}

export async function updatePost(
  userId: string,
  type: 'text' | 'media',
  content: string | null,
  post: any,
  mediaUrl?: File | null,
  coverImageUrl?: string,
  scheduledTime?: string | null,
  status: 'draft' | 'scheduled' | 'published' = 'draft',
) {
  let value: any = {
    user_id: userId,
    content,
    media_url: coverImageUrl,
    cover_image_url: coverImageUrl,
    scheduled_time: scheduledTime,
    status,
  };

  if (mediaUrl?.name) {
    const { data: res, error: err } = await supabase.storage
      .from('post_media')
      .upload(`${mediaUrl!.name}`, mediaUrl!, {
        cacheControl: '3600',
        upsert: false,
      });

    const {
      data: { publicUrl: image },
    } = await supabase.storage
      .from('post_media')
      .getPublicUrl(`${mediaUrl!.name}`);

    value.cover_image_url = image;
    value.media_url = image;
    value.format = mediaUrl?.type.startsWith('image/') ? 'image' : 'video';
  }

  const { data, error } = await supabase
    .from('posts')
    .update(value)
    .eq('id', post.id)
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
>>>>>>> Stashed changes
