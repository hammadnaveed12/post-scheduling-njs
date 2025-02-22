import ScoialMedia from './SocialIntegration';

export default class TikTokIntegration extends ScoialMedia {
  apiBase;
  redirect_uri;
  client_key;
  client_secret;
  constructor() {
    super();
    this.apiBase = 'https://open.tiktokapis.com/v2';
    this.redirect_uri = `https://redirectmeto.com/http://localhost:3000/api/auth/callback/tiktok/`;
    this.client_key = process.env.TIKTOK_CLIENT_ID;
    this.client_secret = process.env.TIKTOK_CLIENT_SECRET;
  }

  async generateAuthUrl() {
    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${this.client_key}&response_type=code&scope=user.info.basic,user.info.profile&disable_auto_auth=1&redirect_uri=${this.redirect_uri}`;

    return authUrl;
  }

  async Authorize(code: string) {
    // Value to use for getting Access Token
    let value: any = {
      client_key: this.client_key,
      client_secret: this.client_secret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirect_uri,
    };

    // Getting Access Token using the code returned
    const { access_token, refresh_token } = await (
      await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        method: 'POST',
        body: new URLSearchParams(value).toString(),
      })
    ).json();

    // Getting Display_Name, Avatar_url
    const {
      data: {
        user: { avatar_url, display_name, open_id, username },
      },
    } = await (
      await fetch(
        'https://open.tiktokapis.com/v2/user/info/?fields=open_id,avatar_url,display_name,union_id,username',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      )
    ).json();

    return { access_token, refresh_token, avatar_url, username };
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
      platform: 'tiktok',
      name: username,
      avatar: avatar_url,
      access_token,
      refresh_token,
    });

    return { data, error };
  }
}
