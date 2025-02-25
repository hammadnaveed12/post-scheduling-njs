import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import ScoialMedia from './SocialIntegration';

const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

export default class InstagramIntegration extends ScoialMedia {
  redirect_uri;
  client_key;
  client_secret;
  constructor() {
    super();
    this.redirect_uri = `https://redirectmeto.com/${process.env.SITE_URL}/api/auth/callback/instagram/`;
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
  async get_id(access_token: string) {
    const { user_id, name, username, profile_picture_url, error } = await (
      await fetch(
        `https://graph.instagram.com/v22.0/me?fields=user_id,name,username,profile_picture_url&access_token=${access_token}`,
      )
    ).json();

    return user_id;
  }

  private async checkLoaded(
    mediaContainerId: string,
    accessToken: string,
  ): Promise<boolean> {
    let status = 'IN_PROGRESS';
    while (status === 'IN_PROGRESS') {
      const { status_code, error_message } = await (
        await fetch(
          `https://graph.instagram.com/v20.0/${mediaContainerId}?fields=status_code,error_message&access_token=${accessToken}`,
        )
      ).json();
      await timer(3000);
      status = status_code;

      if (error_message) {
        console.log(error_message);
        throw new Error(error_message);
        break;
      }
    }

    if (status === 'FINISHED') {
      await timer(2000);
      return true;
    }

    await timer(2200);
    return this.checkLoaded(mediaContainerId, accessToken);
  }
  private async updateSelectedAccountStatus(id: any) {
    console.log('Sending message');
    await fetch(`${process.env.SITE_URL}/api/auth/selectedacc?id=${id}`);
  }

  async PostContent({
    access_token,
    post_type,
    post_format,
    post_content,
    post_media_url,
    id: selected_acc_id,
  }: any): Promise<any> {
    const id = await this.get_id(access_token);

    console.log('STARTING INSTAGRAM BOT', id);
    console.log('STARTING INSTAGRAM BOT', access_token);

    if (post_type == 'media') {
      if (post_format == 'video') {
        try {
          const media_type = 'REELS';
          const searchParams = new URLSearchParams({
            media_type,
            text: post_content,
            video_url: post_media_url,
            access_token: access_token,
          });

          console.log('REEEL TYPE');

          const { id: media_container_id, error: err } = await (
            await fetch(
              `https://graph.instagram.com/v20.0/${id}/media?${searchParams.toString()}`,
              {
                method: 'POST',
              },
            )
          ).json();
          console.log('REEEL TYPE ,errrr', err);
          console.log('container_id', media_container_id);

          await this.checkLoaded(media_container_id, access_token);

          console.log('container_id', media_container_id);

          const { id: media_id, error } = await (
            await fetch(
              `https://graph.instagram.com/v20.0/${id}/media_publish?creation_id=${media_container_id}&access_token=${access_token}`,
              { method: 'POST' },
            )
          ).json();

          console.log('media_id', media_id);
          console.log('media_id', error);

          const { permalink, ...all } = await (
            await fetch(
              `https://graph.instagram.com/v20.0/${media_id}?fields=id,permalink&access_token=${access_token}`,
            )
          ).json();

          console.log(permalink);
          if (permalink) {
            this.updateSelectedAccountStatus(selected_acc_id);
          }
          return permalink;
        } catch (err) {
          console.error(err);
        }
      } else if (post_format == 'image') {
        try {
          const { id: mediaContainerId, error } = await (
            await fetch(
              `https://graph.instagram.com/v20.0/${id}/media?image_url=${encodeURIComponent(post_media_url)}&caption=${encodeURIComponent(post_content)}&access_token=${access_token}`,
              {
                method: 'POST',
              },
            )
          ).json();

          console.log('Media container created:', mediaContainerId);
          console.log('Media container created:', error);
          let status = 'IN_PROGRESS';
          while (status === 'IN_PROGRESS') {
            const { status_code } = await (
              await fetch(
                `https://graph.instagram.com/v20.0/${mediaContainerId}?fields=status_code&access_token=${access_token}`,
              )
            ).json();
            await timer(3000);
            status = status_code;
          }
          console.log('Media processing complete.');

          const { id: mediaId } = await (
            await fetch(
              `https://graph.instagram.com/v20.0/${id}/media_publish?creation_id=${mediaContainerId}&access_token=${access_token}&field=id`,
              {
                method: 'POST',
              },
            )
          ).json();

          console.log('Post published:', mediaId);

          // Get post URL
          const { permalink } = await (
            await fetch(
              `https://graph.instagram.com/v20.0/graph.facebook.com?fields=permalink&access_token=${access_token}`,
            )
          ).json();

          console.log('Post URL:', permalink);
          if (permalink) {
            await this.updateSelectedAccountStatus(selected_acc_id);
          }
          return {
            postId: mediaId,
            releaseURL: permalink,
            status: 'success',
          };
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
}
