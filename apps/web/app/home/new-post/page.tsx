<<<<<<< Updated upstream
import { NewPostForm } from 'node_modules/@kit/ui/src/components/posts';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import EditPostForm from '../../../../../packages/ui/src/components/posts/EditPostForm';

async function getPost(id: string) {
  const supabase = getSupabaseServerClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;

  let query = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId!)
    .eq('id', id)
    .single();

  return query;
}

export default async function NewPostPage({ searchParams }: any) {
  const { edit } = searchParams;
  if (edit) {
    const post = await getPost(edit);
    console.log(post.data);

    return <EditPostForm post={post.data} />;
  } else {
    return <NewPostForm />;
  }
}
=======
import { NewPostForm } from 'node_modules/@kit/ui/src/components/posts';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import EditPostForm from '../../../../../packages/ui/src/components/posts/EditPostForm';

async function getPost(id: string) {
  const supabase = getSupabaseServerClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;

  let query = await supabase
    .from('posts')
    .select('*, selected_accounts(id,social_accounts(platform,id))')
    .eq('user_id', userId!)
    .eq('id', id)
    .single();
  return query;
}

export default async function NewPostPage({ searchParams }: any) {
  const { edit } = await searchParams;
  if (edit) {
    const post = await getPost(edit);

    return <EditPostForm post={post.data} />;
  } else {
    return <NewPostForm />;
  }
}
>>>>>>> Stashed changes
