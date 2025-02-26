import AtpAgent, { RichText } from '@atproto/api';

import { reduceImageBySize } from '../utils/Sharp';
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
  private async updateSelectedAccountStatus(id: any) {
    await fetch(`${process.env.SITE_URL}/api/auth/selectedacc?id=${id}`);
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
  async PostContent({
    access_token,
    post_type,
    post_format,
    post_content,
    post_media_url,
    selected_acc_id,
  }: any) {
    let id = '';
    try {
      try {
        const {
          data: { did },
        } = await this.agent.login({
          identifier: this.username,
          password: this.password,
        });
        id = did;
      } catch (err: any) {
        throw new err();
      }

      let uploadedMedia = null;

      // If post is media, upload the image first
      if (post_type === 'media' && post_format == 'image' && post_media_url) {
        uploadedMedia = await this.agent.uploadBlob(
          await reduceImageBySize(post_media_url),
        );
      }
      const rt = new RichText({ text: post_content });
      await rt.detectFacets(this.agent);

      const { cid, uri } = await this.agent.post({
        text: rt.text,
        facets: rt.facets,
        createdAt: new Date().toISOString(),
        ...(uploadedMedia
          ? {
              embed: {
                $type: 'app.bsky.embed.images',
                images: [
                  {
                    alt: 'image',
                    image: uploadedMedia.data.blob,
                  },
                ],
              },
            }
          : {}), // Attach media only if present
      });
      if (uri) {
        await this.updateSelectedAccountStatus(selected_acc_id);
      }
      return {
        id,
        postId: uri,
        status: 'completed',
        releaseURL: `https://bsky.app/profile/${id}/post/${uri.split('/').pop()}`,
      };
    } catch (error) {
      console.error('Error posting to Bluesky:', error);
      throw new Error('Failed to post to Bluesky.');
    }
  }
}

export default BlueskyIntegration;
