import { cookies } from 'next/headers';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import TwitterIntegration from '~/lib/socials/TwitterIntegration';

const supabase = getSupabaseServerClient();

export async function GET(req: any) {
  const { searchParams } = new URL(req.url);
  console.log(searchParams);

  const cookieStore = await cookies();
  const oauth_token = cookieStore.get('twitter_oauth_token');
  const oauth_token_secret = cookieStore.get('twitter_oauth_secret');

  const code = searchParams.get('oauth_verifier');

  console.log('Hello world', oauth_token?.value);
  //   console.log(oauth_token_secret);

  if (!code)
    return Response.json({ error: 'No auth code found' }, { status: 400 });

  try {
    const client = new TwitterIntegration();

    const { access_token, refresh_token, avatar_url, username } =
      await client.Authorize({
        code,
        oauth_token: oauth_token!.value,
        oauth_token_secret: oauth_token_secret!.value,
      });

    cookieStore.delete('twitter_oauth_token');
    cookieStore.delete('twitter_oauth_secret');
    // Save to Supabase
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { data, error } = await client.SaveToSupabase({
      supabase,
      userId,
      username,
      avatar_url,
      access_token,
      refresh_token,
    });

    if (error) throw error;

    return Response.redirect(`${process.env.SITE_URL}/home/accounts`);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
