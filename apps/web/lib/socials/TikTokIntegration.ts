import ScoialMedia from './SocialIntegration';

const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

export default class TikTokIntegration extends ScoialMedia {
  apiBase;
  redirect_uri;
  client_key;
  client_secret;
  constructor() {
    super();
    this.apiBase = 'https://open.tiktokapis.com/v2';
    this.redirect_uri = `https://redirectmeto.com/${process.env.SITE_URL}/api/auth/callback/tiktok/`;
    this.client_key = process.env.TIKTOK_CLIENT_ID;
    this.client_secret = process.env.TIKTOK_CLIENT_SECRET;
  }

  async generateAuthUrl() {
    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${this.client_key}&response_type=code&scope=user.info.basic,user.info.profile&disable_auto_auth=1&redirect_uri=${this.redirect_uri}`;

    return authUrl;
  }

  async Authorize(code: string) {
    // Value to use for getting Access Token
    let value: any = {
      client_key: this.client_key,
      client_secret: this.client_secret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirect_uri,
    };

    // Getting Access Token using the code returned
    const { access_token, refresh_token } = await (
      await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        method: 'POST',
        body: new URLSearchParams(value).toString(),
      })
    ).json();

    // Getting Display_Name, Avatar_url
    const {
      data: {
        user: { avatar_url, display_name, open_id, username },
      },
    } = await (
      await fetch(
        'https://open.tiktokapis.com/v2/user/info/?fields=open_id,avatar_url,display_name,union_id,username',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      )
    ).json();

    return { access_token, refresh_token, avatar_url, username };
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
      platform: 'tiktok',
      name: username,
      avatar: avatar_url,
      access_token,
      refresh_token,
    });

    return { data, error };
  }
  private async uploadedVideoSuccess(
    id: string,
    publishId: string,
    accessToken: string,
  ): Promise<{ url: string; id: number }> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const post = await (
        await fetch(
          'https://open.tiktokapis.com/v2/post/publish/status/fetch/',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json; charset=UTF-8',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              publish_id: publishId,
            }),
          },
        )
      ).json();

      const { status, publicaly_available_post_id } = post.data;

      if (status === 'PUBLISH_COMPLETE') {
        return {
          url: !publicaly_available_post_id
            ? `https://www.tiktok.com/@${id}`
            : `https://www.tiktok.com/@${id}/video/` +
              publicaly_available_post_id,
          id: !publicaly_available_post_id
            ? publishId
            : publicaly_available_post_id?.[0],
        };
      }

      if (status === 'FAILED') {
        console.error(status);
      }

      await timer(3000);
    }
  }

  async PostContent({
    access_token,
    post_type,
    post_format,
    post_content,
    post_media_url,
  }: any) {
    const {
      data: {
        user: { avatar_url, display_name, open_id, username },
      },
    } = await (
      await fetch(
        'https://open.tiktokapis.com/v2/user/info/?fields=open_id,avatar_url,display_name,union_id,username',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      )
    ).json();

    console.log(display_name);
    console.log(open_id);

    const {
      data: { publish_id },
      error,
    } = await (
      await fetch(`https://open.tiktokapis.com/v2/post/publish/video/init/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          post_info: {
            title: post_content,
            privacy_level: 'PUBLIC_TO_EVERYONE',
          },
          source_info: {
            source: 'PULL_FROM_URL',
            video_url: post_media_url,
          },
        }),
      })
    ).json();

    console.log(publish_id);
    console.log(error);
    const { url, id: videoId } = await this.uploadedVideoSuccess(
      open_id!,
      publish_id,
      access_token,
    );

    return [
      {
        id: open_id,
        releaseURL: url,
        postId: String(videoId),
        status: 'success',
      },
    ];
  }
}
