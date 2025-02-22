import ScoialMedia from './SocialIntegration';

export default class FacebookIntegration extends ScoialMedia {
  redirect_uri;
  client_key;
  client_secret;
  scope;
  constructor() {
    super();

    this.redirect_uri = `https://redirectmeto.com/http://localhost:3000/api/auth/callback/facebook/`;

    this.client_key = process.env.FACEBOOK_CLIENT_ID;
    this.client_secret = process.env.FACEBOOK_CLIENT_SECRET;
    this.scope = [
      'pages_show_list',
      'business_management',
      'pages_manage_posts',
    ];
  }

  async generateAuthUrl() {
    const authUrl = `https://www.facebook.com/v20.0/dialog/oauth/?client_id=${this.client_key}&enable_fb_login=0&force_authentication=0&response_type=code&scope=${this.scope.join(',')}&redirect_uri=${this.redirect_uri}`;
    return authUrl;
  }

  async Authorize(code: string) {
    // Value to use for getting Access Token
    const tokenResponse = await (
      await fetch(
        'https://graph.facebook.com/v20.0/oauth/access_token' +
          `?client_id=${this.client_key}` +
          `&redirect_uri=${this.redirect_uri}` +
          `&client_secret=${this.client_secret}` +
          `&code=${code}`,
      )
    ).json();

    // Getting Long Lived Access Token
    const { access_token, expires_in } = await (
      await fetch(
        'https://graph.facebook.com/v20.0/oauth/access_token' +
          '?grant_type=fb_exchange_token' +
          `&client_id=${this.client_key}` +
          `&client_secret=${this.client_secret}` +
          `&fb_exchange_token=${tokenResponse.access_token}&fields=access_token,expires_in`,
      )
    ).json();

    // Getting Display_Name, Avatar_url
    const {
      id,
      name,
      picture: {
        data: { url },
      },
    } = await (
      await fetch(
        `https://graph.facebook.com/v20.0/me?fields=id,name,picture&access_token=${access_token}`,
      )
    ).json();

    return {
      access_token,
      refresh_token: '',
      avatar_url: url,
      username: name,
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
      platform: 'facebook',
      name: username,
      avatar: avatar_url,
      access_token,
      refresh_token,
    });

    return { data, error };
  }
}
