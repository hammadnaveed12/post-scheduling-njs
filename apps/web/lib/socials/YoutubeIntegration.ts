import axios from 'axios';
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';
import { google } from 'googleapis';

import ScoialMedia from './SocialIntegration';

const clientAndYoutube = () => {
  const client = new google.auth.OAuth2({
    clientId: process.env.YOUTUBE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
    redirectUri: `http://localhost:3000/api/auth/callback/youtube/`,
  });

  const youtube = (newClient: OAuth2Client) =>
    google.youtube({
      version: 'v3',
      auth: newClient,
    });

  const oauth2 = (newClient: OAuth2Client) =>
    google.oauth2({
      version: 'v2',
      auth: newClient,
    });

  return { client, youtube, oauth2 };
};

export default class YoutubeIntegration extends ScoialMedia {
  redirect_uri;
  client_key;
  client_secret;
  scope;
  constructor() {
    super();

    this.redirect_uri = `http://localhost:3000/api/auth/callback/youtube/`;

    this.client_key = process.env.YOUTUBE_CLIENT_ID;
    this.client_secret = process.env.YOUTUBE_CLIENT_SECRET;
    this.scope = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.force-ssl',
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtubepartner',
      'https://www.googleapis.com/auth/youtubepartner',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
    ];
  }

  async generateAuthUrl() {
    const { client } = clientAndYoutube();

    let url = client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      redirect_uri: this.redirect_uri,
      scope: this.scope,
    });

    return url;
  }

  async Authorize(code: string) {
    // Value to use for getting Access Token

    const { client, oauth2 } = clientAndYoutube();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const user = oauth2(client);
    const { data } = await user.userinfo.get();
    const expiryDate = new Date(tokens.expiry_date!);

    return {
      access_token: tokens.access_token!,
      refresh_token: '',
      avatar_url: data.picture,
      username: data.name,
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
      platform: 'youtube',
      name: username,
      avatar: avatar_url,
      access_token,
      refresh_token,
    });

    return { data, error };
  }

  private async updateSelectedAccountStatus(id: any) {
    await fetch(`${process.env.SITE_URL}/api/auth/selectedacc?id=${id}`);
  }

  async PostContent({
    access_token,
    post_type,
    post_format,
    post_content,
    post_media_url,
    selected_acc_id,
  }: any) {
    const { client, youtube } = clientAndYoutube();
    client.setCredentials({ access_token: access_token });
    const youtubeClient = youtube(client);

    console.log(youtubeClient.channels);
    console.log(youtubeClient.videos.list);

    console.log('Youtuuuube');
    const response = await axios({
      url: post_media_url,
      method: 'GET',
      responseType: 'stream',
    });

    try {
      const all = await youtubeClient.videos.insert({
        part: ['id', 'snippet', 'status'],
        notifySubscribers: false,
        requestBody: {
          snippet: {
            title: post_content,
            description: post_content,
          },
          status: {
            privacyStatus: 'public',
          },
        },
        media: {
          body: response.data,
        },
      });

      console.log(all.statusText);

      if (all?.data?.id!) {
        await this.updateSelectedAccountStatus(selected_acc_id);
      }

      return [
        {
          id: '',
          releaseURL: `https://www.youtube.com/watch?v=${all?.data?.id}`,
          postId: all?.data?.id!,
          status: 'success',
        },
      ];
    } catch (err: any) {
      console.log('errrror', err);
      console.log('errrror', err.errors);

      if (
        err.response?.data?.error?.errors?.[0]?.reason === 'failedPrecondition'
      ) {
        throw 'We have uploaded your video but we could not set the thumbnail. Thumbnail size is too large';
      }
      if (
        err.response?.data?.error?.errors?.[0]?.reason === 'uploadLimitExceeded'
      ) {
        throw 'You have reached your daily upload limit, please try again tomorrow.';
      }
      if (
        err.response?.data?.error?.errors?.[0]?.reason ===
        'youtubeSignupRequired'
      ) {
        throw 'You have to link your youtube account to your google account first.';
      }
    }
    return [];
  }
}
