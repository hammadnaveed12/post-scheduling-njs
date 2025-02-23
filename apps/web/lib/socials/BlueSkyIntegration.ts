<<<<<<< Updated upstream
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
=======
import AtpAgent, { RichText } from '@atproto/api';
import axios from 'axios';
import sharp from 'sharp';

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

  async PostContent({
    access_token,
    post_type,
    post_format,
    post_content,
    post_media_url,
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
      if (post_type === 'media' && post_media_url) {
        uploadedMedia = await this.agent.uploadBlob(new Blob([post_media_url]));
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
>>>>>>> Stashed changes
