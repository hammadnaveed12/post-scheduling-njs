import { cookies } from 'next/headers';

import TwitterIntegration from '~/lib/socials/TwitterIntegration';

export async function GET(req: any) {
  console.log('hello world');

  const client = new TwitterIntegration();

  const authUrl = await client.generateAuthUrl();

  const cookieStore = await cookies();
  cookieStore.set('twitter_oauth_token', authUrl.oauth_token);
  cookieStore.set('twitter_oauth_secret', authUrl.oauth_token_secret);

  return Response.redirect(authUrl.url);
}
