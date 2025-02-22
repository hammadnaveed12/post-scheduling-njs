import ScoialMedia from './SocialIntegration';

export default class LinkedInIntegration extends ScoialMedia {
  redirect_uri;
  client_key;
  client_secret;
  scope;
  constructor() {
    super();

    this.redirect_uri = `https://redirectmeto.com/http://localhost:3000/api/auth/callback/linkedin/`;

    this.client_key = process.env.LINKEDIN_CLIENT_ID;
    this.client_secret = process.env.FACEBOOK_CLIENT_SECRET;
    this.scope = ['openid', 'profile', 'w_member_social'];
  }

  async generateAuthUrl() {
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization/?response_type=code&client_id=${this.client_key}&scope=${this.scope.join(' ')}&redirect_uri=${this.redirect_uri}`;
    return authUrl;
  }

  async Authorize(code: string) {
    // Value to use for getting Access Token

    const body = new URLSearchParams();
    body.append('grant_type', 'authorization_code');
    body.append('code', code);
    body.append('redirect_uri', this.redirect_uri);
    body.append('client_id', this.client_key!);
    body.append('client_secret', this.client_secret!);

    const {
      access_token,
      expires_in: expiresIn,
      refresh_token: refreshToken,
      scope,
    } = await (
      await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      })
    ).json();

    // Getting Display_Name, Avatar_url
    const {
      name,
      sub: id,
      picture,
    } = await (
      await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();

    return {
      access_token,
      refresh_token: refreshToken,
      avatar_url: picture,
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
      platform: 'linkedin',
      name: username,
      avatar: avatar_url,
      access_token,
      refresh_token,
    });

    return { data, error };
  }
}
