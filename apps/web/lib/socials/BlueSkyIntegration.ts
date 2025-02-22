import AtpAgent from '@atproto/api';

import ScoialMedia from './SocialIntegration';

class BlueskyIntegration extends ScoialMedia {
  username: string;
  password: string;
  agent: AtpAgent;

  constructor(username: string, password: string) {
    super();

    this.username = username;
    this.password = password;
    this.agent = new AtpAgent({ service: 'https://bsky.social' });
  }

  async Authorize() {
    try {
      await this.agent.login({
        identifier: this.username,
        password: this.password,
      });
      return this.agent.session;
    } catch (error) {
      console.error('Error logging into Bluesky:', error);
      throw new Error('Bluesky login failed.');
    }
  }

  async PostContent({ text }: any) {
    try {
      const response = await this.agent.post({ text });
      return response;
    } catch (error) {
      console.error('Error posting to Bluesky:', error);
      throw new Error('Failed to post to Bluesky.');
    }
  }

  async SaveToSupabase({
    supabase,
    platform,
    res,
    user_id,
  }: any): Promise<any> {
    let result = await supabase.from('social_accounts').insert({
      user_id: user_id,
      platform: platform.id,
      access_token: res?.accessJwt,
      refresh_token: res?.refreshJwt,
      name: res?.handle,
      username: this.username,
      password: this.password,
    });

    return result;
  }
}

export default BlueskyIntegration;
