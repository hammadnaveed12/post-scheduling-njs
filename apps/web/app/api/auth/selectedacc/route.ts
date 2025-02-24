import { ComAtprotoTempNS } from '@atproto/api';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

const supabase = getSupabaseServerAdminClient();

export async function GET(req: any) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return Response.json({ error: 'No id found' }, { status: 400 });

  console.log('Iddd', id);
  console.log('Hello world');

  try {
    const { data, error } = await supabase
      .from('selected_accounts')
      .update({ status: 'success' })
      .eq('id', id);

    return Response.json({ statusText: 'success' });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
