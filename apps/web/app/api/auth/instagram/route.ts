<<<<<<< Updated upstream
import InstagramIntegration from '~/lib/socials/InstagramIntegration';

export async function GET(req: any) {
  const client = new InstagramIntegration();

  const authUrl = await client.generateAuthUrl();

  return Response.redirect(authUrl);
}
=======
import InstagramIntegration from '~/lib/socials/InstagramIntegration';

export async function GET(req: any) {
  const client = new InstagramIntegration();

  const authUrl = await client.generateAuthUrl();

  return Response.redirect(authUrl);
}
>>>>>>> Stashed changes
