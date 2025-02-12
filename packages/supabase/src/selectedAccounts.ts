import { getSupabaseBrowserClient } from './clients/browser-client';

const supabase = getSupabaseBrowserClient();

// Select accounts for a post
export async function selectAccountsForPost(
  postId: string,
  accountIds: string[],
) {
  const entries = accountIds.map((accountId) => ({
    post_id: postId,
    account_id: accountId,
  }));

  const { data, error } = await supabase
    .from('selected_accounts')
    .insert(entries)
    .select();
  if (error) throw error;
  return data;
}

// Fetch selected accounts for a post
export async function getSelectedAccounts(postId: string) {
  const { data, error } = await supabase
    .from('selected_accounts')
    .select('*')
    .eq('post_id', postId);

  if (error) throw error;
  return data;
}

export async function getUserAccounts(userId: string) {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}
