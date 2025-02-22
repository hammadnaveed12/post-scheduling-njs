import { getSupabaseServerClient } from '@kit/supabase/server-client';

import TikTokIntegration from '~/lib/socials/TikTokIntegration';

const supabase = getSupabaseServerClient();

export async function GET(req: any) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code)
    return Response.json({ error: 'No auth code found' }, { status: 400 });

  try {
    const tikTokClient = new TikTokIntegration();

    const { access_token, refresh_token, avatar_url, username } =
      await tikTokClient.Authorize(code);

    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { data, error } = await tikTokClient.SaveToSupabase({
      supabase,
      userId,
      username,
      avatar_url,
      access_token,
      refresh_token,
    });

    if (error) throw error;

    return Response.redirect('http://localhost:3000/home/accounts');
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
