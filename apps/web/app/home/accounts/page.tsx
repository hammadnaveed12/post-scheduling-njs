import { use } from 'react';
import { SelectedAccount } from '../../../../../packages/ui/src/components/posts';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Database } from '@kit/supabase/database';


async function getSocialAccounts( supabase:any, user_id:string){
 let data = await supabase.from("social_accounts").select("id, user_id, platform,active, access_token, refresh_token,name, avatar").eq("user_id", user_id) 
//  data = await data.json();
return data.data
}

export default async function NewPostPage() {
    const supabase =  getSupabaseServerClient();
    const user = await supabase.auth.getUser()
    const data = await getSocialAccounts(supabase, user.data.user?.id as string)

  return <SelectedAccount user_id={user.data.user?.id} accounts={data}/>;
}
