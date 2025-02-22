import ScoialMedia from './SocialIntegration';

export default class InstagramIntegration extends ScoialMedia {
  apiBase;
  redirect_uri;
  client_key;
  client_secret;
  constructor() {
    super();
    this.apiBase = 'https://open.tiktokapis.com/v2';
    this.redirect_uri = `https://redirectmeto.com/http://localhost:3000/api/auth/callback/instagram/`;
    this.client_key = process.env.INSTAGRAM_CLIENT_ID;
    this.client_secret = process.env.INSTAGRAM_CLIENT_SECRET;
  }

  async generateAuthUrl() {
    const authUrl = `https://www.instagram.com/oauth/authorize/?client_id=${this.client_key}&enable_fb_login=0&force_authentication=0&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights&redirect_uri=${this.redirect_uri}`;

    return authUrl;
  }

  async Authorize(code: string) {
    // Value to use for getting Access Token
    const formData = new FormData();
    formData.append('client_id', this.client_key!);
    formData.append('client_secret', this.client_secret!);
    formData.append('grant_type', 'authorization_code');
    formData.append('redirect_uri', this.redirect_uri);
    formData.append('code', code);

    // Getting Short Lived Access Token using the code returned
    const tokenResponse = await (
      await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        body: formData,
      })
    ).json();

    // Getting Long Lived Access Token
    const { access_token, expires_in, ...all } = await (
      await fetch(
        'https://graph.instagram.com/access_token' +
          '?grant_type=ig_exchange_token' +
          `&client_id=${this.client_key!}` +
          `&client_secret=${this.client_secret!}` +
          `&access_token=${tokenResponse.access_token}`,
      )
    ).json();

    // Getting Display_Name, Avatar_url
    const { user_id, name, username, profile_picture_url } = await (
      await fetch(
        `https://graph.instagram.com/v22.0/me?fields=user_id,name,username,profile_picture_url&access_token=${access_token}`,
      )
    ).json();

    return {
      access_token,
      refresh_token: '',
      avatar_url: profile_picture_url,
      username,
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
      platform: 'instagram',
      name: username,
      avatar: avatar_url,
      access_token,
      refresh_token,
    });

    return { data, error };
  }
}
