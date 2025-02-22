import ScoialMedia from './SocialIntegration';

export default class ThreadsIntegration extends ScoialMedia {
  redirect_uri;
  client_key;
  client_secret;

  constructor() {
    super();

    this.redirect_uri = `https://redirectmeto.com/http://localhost:3000/api/auth/callback/threads/`;

    this.client_key = process.env.THREADS_CLIENT_ID;
    this.client_secret = process.env.THREADS_CLIENT_SECRET;
  }

  async generateAuthUrl() {
    const authUrl = `https://threads.net/oauth/authorize/?client_id=${this.client_key}&force_authentication=1&response_type=code&scope=threads_basic,threads_content_publish&redirect_uri=${this.redirect_uri}`;

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
      await fetch('https://graph.threads.net/oauth/access_token', {
        method: 'POST',
        body: formData,
      })
    ).json();

    // Getting Long Lived Access Token
    const { access_token, expires_in, ...all } = await (
      await fetch(
        'https://graph.threads.net/access_token' +
          '?grant_type=th_exchange_token' +
          `&client_id=${this.client_key!}` +
          `&client_secret=${this.client_secret!}` +
          `&access_token=${tokenResponse.access_token}`,
      )
    ).json();

    // Getting Display_Name, Avatar_url
    const { id, username, threads_profile_picture_url } = await (
      await fetch(
        `https://graph.threads.net/v1.0/me?fields=id,username,threads_profile_picture_url&access_token=${access_token}`,
      )
    ).json();

    return {
      access_token,
      refresh_token: '',
      avatar_url: threads_profile_picture_url,
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
      platform: 'threads',
      name: username,
      avatar: avatar_url,
      access_token,
      refresh_token,
    });

    return { data, error };
  }
}
