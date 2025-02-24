import { TwitterApi } from 'twitter-api-v2';

import ScoialMedia from './SocialIntegration';

export default class TwitterIntegration extends ScoialMedia {
  redirect_uri;
  client_key;
  client_secret;
  scope: any;
  constructor() {
    super();

    this.redirect_uri = `http://localhost:3000/api/auth/callback/twitter/`;

    this.client_key = process.env.TWITTER_CLIENT_ID;
    this.client_secret = process.env.TWITTER_CLIENT_SECRET;
    this.scope = [];
  }

  async generateAuthUrl() {
    const client = new TwitterApi({
      appKey: this.client_key!,
      appSecret: this.client_secret!,
    });

    const { url, oauth_token, oauth_token_secret } =
      await client.generateAuthLink(this.redirect_uri, {
        authAccessType: 'write',
        linkMode: 'authenticate',
        forceLogin: false,
      });

    return url;
  }

  async Authorize(code: string) {
    const startingClient = new TwitterApi({
      appKey: this.client_key!,
      appSecret: this.client_secret!,
      // accessToken: oauth_token,
      // accessSecret: oauth_token_secret,
    });
    const { accessToken, client, accessSecret } =
      await startingClient.login(code);

    const {
      data: { username, verified, profile_image_url, name, id },
    } = await client.v2.me({
      'user.fields': [
        'username',
        'verified',
        'verified_type',
        'profile_image_url',
        'name',
      ],
    });

    return {
      access_token: accessToken + ':' + accessSecret,
      refresh_token: '',
      avatar_url: profile_image_url,
      username: username,
    };
  }

  async SaveToSupabase({
    supabase,
    userId,
    username,
    avatar_url,
    access_token,
    refresh_token,
  }: any): Promise<any> {
    const { data, error } = await supabase.from('social_accounts').insert({
      user_id: userId,
      platform: 'twitter',
      name: username,
      avatar: avatar_url,
      access_token,
      refresh_token,
    });

    return { data, error };
  }
}
