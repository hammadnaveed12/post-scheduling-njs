import axios from 'axios';
import sharp from 'sharp';

import ScoialMedia from './SocialIntegration';

export const readOrFetch = async (path: string) => {
  if (path.indexOf('http') === 0) {
    return (
      await axios({
        url: path,
        method: 'GET',
        responseType: 'arraybuffer',
      })
    ).data;
  }
};

export default class LinkedInIntegration extends ScoialMedia {
  redirect_uri;
  client_key;
  client_secret;
  scope;
  constructor() {
    super();

    this.redirect_uri = `https://redirectmeto.com/http://localhost:3000/api/auth/callback/linkedin/`;

    this.client_key = process.env.LINKEDIN_CLIENT_ID;
    this.client_secret = process.env.LINKEDIN_CLIENT_SECRET;
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
      error,
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

  async getId(access_token: any) {
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

    return id;
  }

  protected fixText(text: string) {
    const pattern = /@\[.+?]\(urn:li:organization.+?\)/g;
    const matches = text.match(pattern) || [];
    const splitAll = text.split(pattern);
    const splitTextReformat = splitAll.map((p) => {
      return p
        .replace(/\\/g, '\\\\')
        .replace(/</g, '\\<')
        .replace(/>/g, '\\>')
        .replace(/#/g, '\\#')
        .replace(/~/g, '\\~')
        .replace(/_/g, '\\_')
        .replace(/\|/g, '\\|')
        .replace(/\[/g, '\\[')
        .replace(/]/g, '\\]')
        .replace(/\*/g, '\\*')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/\{/g, '\\{')
        .replace(/}/g, '\\}')
        .replace(/@/g, '\\@');
    });

    const connectAll = splitTextReformat.reduce((all, current) => {
      const match = matches.shift();
      all.push(current);
      if (match) {
        all.push(match);
      }
      return all;
    }, [] as string[]);

    return connectAll.join('');
  }

  protected async uploadPicture(
    fileName: string,
    accessToken: string,
    personId: string,
    picture: any,
    type = 'personal' as 'company' | 'personal',
  ) {
    console.log('Image URL');
    const {
      value: { uploadUrl, image, video, uploadInstructions },
    } = await (
      await fetch(
        `https://api.linkedin.com/v2/${
          fileName.indexOf('mp4') > -1 ? 'videos' : 'images'
        }?action=initializeUpload`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
            'LinkedIn-Version': '202501',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            initializeUploadRequest: {
              owner:
                type === 'personal'
                  ? `urn:li:person:${personId}`
                  : `urn:li:organization:${personId}`,
              ...(fileName.indexOf('mp4') > -1
                ? {
                    fileSizeBytes: picture.length,
                    uploadCaptions: false,
                    uploadThumbnail: false,
                  }
                : {}),
            },
          }),
        },
      )
    ).json();

    const sendUrlRequest = uploadInstructions?.[0]?.uploadUrl || uploadUrl;
    const finalOutput = video || image;

    await fetch(sendUrlRequest, {
      method: 'PUT',
      headers: {
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202501',
        Authorization: `Bearer ${accessToken}`,
        ...(fileName.indexOf('mp4') > -1
          ? { 'Content-Type': 'application/octet-stream' }
          : {}),
      },
      body: picture,
    });

    return finalOutput;
  }

  async PostContent({
    access_token,
    post_type,
    post_format,
    post_content,
    post_media_url,
  }: any) {
    const id = await this.getId(access_token);
    console.log('id', id);

    if (post_type == 'text') {
      const data = await fetch('https://api.linkedin.com/v2/posts', {
        method: 'POST',
        headers: {
          'X-Restli-Protocol-Version': '2.0.0',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          author: `urn:li:person:${id}`,
          commentary: this.fixText(post_content),
          visibility: 'PUBLIC',
          lifecycleState: 'PUBLISHED',
          distribution: {
            feedDistribution: 'MAIN_FEED',
            targetEntities: [],
            thirdPartyDistributionChannels: [],
          },
        }),
      });

      return 'I think success';
    } else if (post_type == 'media') {
      const uploadedMediaId = await this.uploadPicture(
        post_media_url,
        access_token,
        id,
        post_media_url.indexOf('mp4') > -1
          ? Buffer.from(await readOrFetch(post_media_url))
          : await sharp(await readOrFetch(post_media_url))
              .toFormat('jpeg')
              .resize({ width: 1000 })
              .toBuffer(),
        'personal',
      );

      console.log('UPLOADED PICTURE', uploadedMediaId);

      const data = await fetch('https://api.linkedin.com/v2/posts', {
        method: 'POST',
        headers: {
          'X-Restli-Protocol-Version': '2.0.0',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          author: `urn:li:person:${id}`,
          commentary: this.fixText(post_content),
          visibility: 'PUBLIC',
          distribution: {
            feedDistribution: 'MAIN_FEED',
            targetEntities: [],
            thirdPartyDistributionChannels: [],
          },
          content: {
            media: { id: uploadedMediaId },
          },
          lifecycleState: 'PUBLISHED',
          isReshareDisabledByAuthor: false,
        }),
      });
      if (data.status !== 201 && data.status !== 200) {
        throw new Error('Error posting to LinkedIn');
      }

      const postId = data.headers.get('x-restli-id')!;
      console.log(postId);

      return {
        status: 'posted',
        postId,
        releaseURL: `https://www.linkedin.com/feed/update/${postId}`,
      };
    }
  }
}
