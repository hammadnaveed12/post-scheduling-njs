<<<<<<< Updated upstream
import { getSupabaseServerClient } from '@kit/supabase/server-client';

const supabase = getSupabaseServerClient();

export async function GET(req: any) {
  console.log('Hello world !!');
  const redirectUri = encodeURIComponent(
    `https://redirectmeto.com/http://localhost:3000/api/auth/callback/threads/`,
  );
  const authUrl = `https://threads.net/oauth/authorize/?client_id=${process.env.THREADS_CLIENT_ID}&force_authentication=1&response_type=code&scope=threads_basic,threads_content_publish&redirect_uri=${redirectUri}`;

  return Response.redirect(authUrl);
}
=======
import { getSupabaseServerClient } from '@kit/supabase/server-client';

const supabase = getSupabaseServerClient();

export async function GET(req: any) {
  console.log('Hello world !!');
  const redirectUri = encodeURIComponent(
    `https://redirectmeto.com/http://localhost:3000/api/auth/callback/threads/`,
  );
  const authUrl = `https://threads.net/oauth/authorize/?client_id=${process.env.THREADS_CLIENT_ID}&force_authentication=1&response_type=code&scope=threads_basic,threads_content_publish&redirect_uri=${redirectUri}`;

  return Response.redirect(authUrl);
}
>>>>>>> Stashed changes
