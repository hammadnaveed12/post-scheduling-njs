import axios from 'axios';
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
    console.log(this.client_key);

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

    return { url: url, oauth_token, oauth_token_secret };
  }

  override async Authorize({ code, oauth_token_secret, oauth_token }: any) {
    const startingClient = new TwitterApi({
      appKey: this.client_key!,
      appSecret: this.client_secret!,
      accessToken: oauth_token,
      accessSecret: oauth_token_secret,
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

    console.log(username);
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
  private async updateSelectedAccountStatus(id: any) {
    console.log('Sending message');
    await fetch(`${process.env.SITE_URL}/api/auth/selectedacc?id=${id}`);
  }
  async PostContent({
    access_token: accessToken,
    post_type,
    post_format,
    post_content,
    post_media_url,
    id: selected_acc_id,
  }: any): Promise<any> {
    const [accessTokenSplit, accessSecretSplit] = accessToken.split(':');
    const client = new TwitterApi({
      appKey: this.client_key!,
      appSecret: this.client_secret!,
      accessToken: accessTokenSplit,
      accessSecret: accessSecretSplit,
    });
    const {
      data: { username },
    } = await client.v2.me({
      'user.fields': 'username',
    });

    if (post_type == 'media') {
      try {
        const mediaResponse = await axios.get(post_media_url, {
          responseType: 'arraybuffer',
        });
        const mediaBuffer = Buffer.from(mediaResponse.data);

        let mediaId = await client.v1.uploadMedia(mediaBuffer, {
          mimeType: post_format == 'image' ? 'image/jpeg' : 'video/mp4',
        });
        console.log(mediaId);
        const tweetData = await client.v2.tweet({
          text: post_content,
          media: { media_ids: [mediaId] },
        });

        if (tweetData.data.id) {
          await this.updateSelectedAccountStatus(selected_acc_id);
        }
        return {
          tweetId: tweetData.data.id,
          tweetUrl: `https://twitter.com/user/status/${tweetData.data.id}`,
        };
      } catch (error) {
        console.error('Media upload failed:', error);
        console.error('Media upload failed:', error?.data);

        throw new Error('Failed to upload media to Twitter.');
      }
    } else if (post_type == 'text') {
      try {
        const tweetData = await client.v2.tweet({
          text: post_content,
        });
        if (tweetData.data.id) {
          await this.updateSelectedAccountStatus(selected_acc_id);
        }
        return {
          tweetId: tweetData.data.id,
          tweetUrl: `https://twitter.com/user/status/${tweetData.data.id}`,
        };
      } catch (error) {
        console.error('Media upload failed:', error);

        throw new Error('Failed to upload media to Twitter.');
      }
    }
  }
}
