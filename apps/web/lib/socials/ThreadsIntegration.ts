import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import ScoialMedia from './SocialIntegration';

const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

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

  async fetchPageInformation(accessToken: string) {
    const { id, username, threads_profile_picture_url, access_token, error } =
      await (
        await fetch(
          `https://graph.threads.net/v1.0/me?fields=id,username,threads_profile_picture_url&access_token=${accessToken}`,
        )
      ).json();

    console.log(error);

    return {
      id,
      name: username,
      access_token,
      picture: { data: { url: threads_profile_picture_url } },
      username,
    };
  }

  private async checkLoaded(
    mediaContainerId: string,
    accessToken: string,
  ): Promise<boolean> {
    const { status, id, error_message } = await (
      await fetch(
        `https://graph.threads.net/v1.0/${mediaContainerId}?fields=status,error_message&access_token=${accessToken}`,
      )
    ).json();

    if (status === 'ERROR') {
      console.log(error_message);
      throw new Error(error_message);
    }

    if (status === 'FINISHED') {
      await timer(2000);
      return true;
    }

    await timer(2200);
    return this.checkLoaded(mediaContainerId, accessToken);
  }

  private async updateSelectedAccountStatus(id: any) {
    const supabase = getSupabaseServerAdminClient();
    await supabase
      .from('selected_accounts')
      .update({ status: 'posted' })
      .eq('id', id);
  }

  async PostContent({
    access_token,
    post_type,
    post_format,
    post_content,
    post_media_url,
    id: selected_acc_id,
  }: any): Promise<any> {
    const { id, ...data } = await this.fetchPageInformation(access_token);

    if (post_type == 'text') {
      try {
        const media_type = 'TEXT';
        const searchParams = new URLSearchParams({
          media_type,
          text: post_content,
          access_token: access_token,
        });

        const { id: media_container_id } = await (
          await fetch(
            `https://graph.threads.net/v1.0/${id}/threads?${searchParams.toString()}`,
            {
              method: 'POST',
            },
          )
        ).json();

        await this.checkLoaded(media_container_id, access_token);

        console.log(media_container_id);

        const { id: media_id, error } = await (
          await fetch(
            `https://graph.threads.net/v1.0/${id}/threads_publish?creation_id=${media_container_id}&access_token=${access_token}`,
            { method: 'POST' },
          )
        ).json();

        const { permalink, ...all } = await (
          await fetch(
            `https://graph.threads.net/v1.0/${media_id}?fields=id,permalink&access_token=${access_token}`,
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
    } else if (post_type == 'media') {
      if (post_format == 'video') {
        try {
          const media_type = 'VIDEO';
          const searchParams = new URLSearchParams({
            media_type,
            text: post_content,
            video_url: post_media_url,
            access_token: access_token,
          });

          const { id: media_container_id } = await (
            await fetch(
              `https://graph.threads.net/v1.0/${id}/threads?${searchParams.toString()}`,
              {
                method: 'POST',
              },
            )
          ).json();

          await this.checkLoaded(media_container_id, access_token);

          console.log(media_container_id);

          const { id: media_id, error } = await (
            await fetch(
              `https://graph.threads.net/v1.0/${id}/threads_publish?creation_id=${media_container_id}&access_token=${access_token}`,
              { method: 'POST' },
            )
          ).json();

          const { permalink, ...all } = await (
            await fetch(
              `https://graph.threads.net/v1.0/${media_id}?fields=id,permalink&access_token=${access_token}`,
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
          const media_type = 'IMAGE';

          const searchParams = new URLSearchParams({
            media_type,
            text: post_content,
            image_url: post_media_url,
            access_token: access_token,
          });

          const { id: media_container_id } = await (
            await fetch(
              `https://graph.threads.net/v1.0/${id}/threads?${searchParams.toString()}`,
              {
                method: 'POST',
              },
            )
          ).json();

          await this.checkLoaded(media_container_id, access_token);

          console.log(media_container_id);

          const { id: media_id, error } = await (
            await fetch(
              `https://graph.threads.net/v1.0/${id}/threads_publish?creation_id=${media_container_id}&access_token=${access_token}`,
              { method: 'POST' },
            )
          ).json();

          const { permalink, ...all } = await (
            await fetch(
              `https://graph.threads.net/v1.0/${media_id}?fields=id,permalink&access_token=${access_token}`,
            )
          ).json();
          if (permalink) {
            this.updateSelectedAccountStatus(selected_acc_id);
          }
          return permalink;
        } catch (err) {
          console.log(err);
        }
      }
    }
  }
}
