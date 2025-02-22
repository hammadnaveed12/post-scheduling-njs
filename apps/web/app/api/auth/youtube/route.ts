import YoutubeIntegration from '~/lib/socials/YoutubeIntegration';

export async function GET(req: any) {
  const client = new YoutubeIntegration();
  const url = await client.generateAuthUrl();

  return Response.redirect(url);
}
