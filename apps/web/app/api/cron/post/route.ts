import { NextRequest } from 'next/server';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import BlueskyIntegration from '~/lib/socials/BlueSkyIntegration';
import InstagramIntegration from '~/lib/socials/InstagramIntegration';
import LinkedInIntegration from '~/lib/socials/LinkedInIntegration';
import ThreadsIntegration from '~/lib/socials/ThreadsIntegration';
import TikTokIntegration from '~/lib/socials/TikTokIntegration';
import YoutubeIntegration from '~/lib/socials/YoutubeIntegration';

function addMinutes(date: Date, minutes: number) {
  date.setMinutes(date.getMinutes() + minutes);
  return date;
}

export async function POST(req: NextRequest) {
  console.log('Hello world');
  const supabase = getSupabaseServerAdminClient();

  const date = new Date();
  const startOfDay = new Date(date.setUTCHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setUTCHours(23, 59, 59, 999));
  console.log(startOfDay.toISOString());
  console.log(endOfDay.toISOString());

  const getPosts = await supabase
    .from('posts')
    .select('*, selected_accounts(id, status, social_accounts(*))')
    .eq('status', 'scheduled')
    .eq('selected_accounts.status', 'pending')
    .gte('scheduled_time', startOfDay.toISOString())
    .lte('scheduled_time', endOfDay.toISOString());

  // console.log(getPosts.data);

  await getPosts.data?.map(async (item, index) => {
    item.selected_accounts.map(async ({ id, social_accounts }) => {
      if (social_accounts?.platform == 'threads') {
        const threads_client = new ThreadsIntegration();

        const permalink = await threads_client.PostContent({
          access_token: social_accounts.access_token,
          post_type: item.type,
          post_format: item.format,
          post_content: item.content,
          post_media_url: item.media_url,
          id,
        });

        console.log(permalink);
      } else if (social_accounts?.platform == 'linkedin') {
        const linkedin_client = new LinkedInIntegration();

        const permalink = await linkedin_client.PostContent({
          access_token: social_accounts.access_token,
          post_type: item.type,
          post_format: item.format,
          post_content: item.content,
          post_media_url: item.media_url,
          id,
        });

        console.log(permalink);
      } else if (social_accounts?.platform == 'bluesky') {
        const bluesky_client = new BlueskyIntegration(
          social_accounts.username!,
          social_accounts.password!,
        );

        const permalink = await bluesky_client.PostContent({
          access_token: social_accounts.access_token,
          post_type: item.type,
          post_format: item.format,
          post_content: item.content,
          post_media_url: item.media_url,
          id,
        });

        console.log(permalink);
      } else if (social_accounts?.platform == 'tiktok') {
        const tiktok_client = new TikTokIntegration();

        const permalink = await tiktok_client.PostContent({
          access_token: social_accounts.access_token,
          post_type: item.type,
          post_format: item.format,
          post_content: item.content,
          post_media_url: item.media_url,
        });

        console.log(permalink);
      } else if (social_accounts?.platform == 'instagram') {
        const it_client = new InstagramIntegration();

        const permalink = await it_client.PostContent({
          access_token: social_accounts.access_token,
          post_type: item.type,
          post_format: item.format,
          post_content: item.content,
          post_media_url: item.media_url,
          id,
        });

        console.log(permalink);
      } else if (social_accounts?.platform == 'youtube') {
        const yt_client = new YoutubeIntegration();

        const permalink = await yt_client.PostContent({
          access_token: social_accounts.access_token,
          post_type: item.type,
          post_format: item.format,
          post_content: item.content,
          post_media_url: item.media_url,
        });

        console.log(permalink);
      }
    });
  });

  return Response.json({ status: 200, message: 'Response Successful' });
}
