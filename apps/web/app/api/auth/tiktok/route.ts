import TikTokIntegration from '~/lib/socials/TikTokIntegration';

export async function GET(req: any) {
  const client = new TikTokIntegration();

  const authUrl = await client.generateAuthUrl();

  return Response.redirect(authUrl);
}
