import FacebookIntegration from '~/lib/socials/FacebookIntegration';

export async function GET(req: any) {
  const client = new FacebookIntegration();
  const authUrl = await client.generateAuthUrl();

  return Response.redirect(authUrl);
}
