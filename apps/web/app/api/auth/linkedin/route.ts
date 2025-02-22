import LinkedInIntegration from '~/lib/socials/LinkedInIntegration';

export async function GET(req: any) {
  const client = new LinkedInIntegration();
  const authUrl = await client.generateAuthUrl();
  return Response.redirect(authUrl);
}
