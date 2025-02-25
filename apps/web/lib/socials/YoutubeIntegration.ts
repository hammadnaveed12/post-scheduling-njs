import axios from 'axios';
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';
import { google } from 'googleapis';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import ScoialMedia from './SocialIntegration';

const clientAndYoutube = () => {
  const client = new google.auth.OAuth2({
    clientId: process.env.YOUTUBE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
    redirectUri: `${process.env.SITE_URL}/api/auth/callback/youtube/`,
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

    this.redirect_uri = `${process.env.SITE_URL}/api/auth/callback/youtube/`;

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

  async refresh(refresh_token: string, supabase: any, id?: string) {
    const { client, oauth2 } = clientAndYoutube();
    client.setCredentials({ refresh_token });
    const { credentials } = await client.refreshAccessToken();
    const user = oauth2(client);
    const expiryDate = new Date(credentials.expiry_date!);
    const unixTimestamp =
      Math.floor(expiryDate.getTime() / 1000) -
      Math.floor(new Date().getTime() / 1000);

    const { data } = await user.userinfo.get();

    if (id && credentials.access_token) {
      const { update, error } = await supabase.from('social_accounts').update({
        access_token: credentials.access_token!,
        refresh_token_token: credentials.refresh_token!,
      });

      console.log(update);
      console.log(error);
    }

    return {
      accessToken: credentials.access_token!,
      expiresIn: unixTimestamp!,
      refreshToken: credentials.refresh_token!,
      id: data.id!,
      name: data.name!,
      picture: data.picture!,
      username: '',
    };
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
      refresh_token: tokens.refresh_token!,
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
    refresh_token,
    social_acc_id,
    post_type,
    post_format,
    post_content,
    post_media_url,
    cover_media_url,
    selected_acc_id,
  }: any) {
    const { client, youtube } = clientAndYoutube();
    console.log(access_token);
    client.setCredentials({ access_token: access_token });
    const youtubeClient = youtube(client);

    console.log('Youtuuuube');
    const response = await axios({
      url: post_media_url,
      method: 'GET',
      responseType: 'stream',
    });

    try {
      const all = await youtubeClient.videos.insert({
        part: ['id', 'snippet', 'status'],
        notifySubscribers: true,
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

      if (cover_media_url) {
        console.log(cover_media_url);
        const response = await axios({
          url: cover_media_url,
          method: 'GET',
          responseType: 'stream',
        });

        const allb = await youtubeClient.thumbnails.set({
          videoId: all?.data?.id!,
          media: {
            body: response.data,
          },
        });
      }

      console.log(all.statusText);
      if (all.statusText == 'Invalid Credentials') {
        const supabase = getSupabaseServerClient();
        await this.refresh(refresh_token, supabase, social_acc_id);
      }

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

      if (err == 'Invalid Credentials') {
        const supabase = getSupabaseServerClient();
        await this.refresh(refresh_token, supabase, social_acc_id);
      }

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
