'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import { getSupabaseBrowserClient } from '../../../../supabase/src/clients/browser-client';
import { getUserPosts } from '../../../../supabase/src/posts';
import { requireUser } from '../../../../supabase/src/require-user';

import { Card, CardContent } from '../../shadcn/card';
import { ScrollArea } from '../../shadcn/scroll-area';
import { Separator } from '../../shadcn/separator';
import facebookIcon from "../../../../../apps/web/public/icons/facebook-icon.svg";
import youtubeIcon from "../../../../../apps/web/public/icons/youtube-icon.svg";
import instaIcon from "../../../../../apps/web/public/icons/instagram-icon.svg";
import twitterIcon from "../../../../../apps/web/public/icons/twitter-icon.svg";
import getIcon from '../../../../../apps/web/lib/utils/icon';
import { Button } from '../../shadcn/button';
import { LoadingOverlay } from '../../makerkit/loading-overlay';

export default function Posted() {
    const [published, setPublished] = useState<any[]>([]);
    const supabase = getSupabaseBrowserClient();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchPublished() {
            const { data: user } = await requireUser(supabase);
            if (!user) return;

            try {
                const posts = await getUserPosts(user.id, 'published');
                console.log('Fetched published posts:', posts);
                setPublished(posts || []);
            } catch (error) {
                console.error('Error fetching published posts:', error);
            }
        }
        fetchPublished();
    }, [supabase]);

    const handleDraft = async (published: any) => {
       
        if (!published) return;
        
        setLoading(true);
        try {

            let value: any = {
                user_id: published.user_id,
                content:published.content,
                type:published.type,
                media_url: published.media_url,
                cover_image_url: published.cover_image_url,
                format:published.format,
                status:"draft",
              };
          const {data,error } = await supabase
          .from('posts')
          .insert(value)
          setLoading(false)
        } catch (error) {
          console.error('Error drafting post:', error);
        }
      };
    return (
        <Card>
            {loading ? <LoadingOverlay />:null}
            <CardContent className="p-6">
                <h1 className="text-2xl font-bold">Published</h1>
                <Separator className="my-4" />

                <ScrollArea className="h-[500px]">
                    {published.length === 0 ? (
                        <p className="text-gray-500">No published posts available.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {published.map((publish) => (
                                <Card key={publish.id} className="py-4 shadow-lg">
                                    <CardContent>
                                    {publish.media_url && publish.format ? (
                      publish.format! == 'image' ? (
                        <>
                          {' '}
                          <img
                            src={publish.media_url}
                            alt="Post Media"
                            className="h-40 w-full rounded border object-cover"
                          />{' '}
                        </>
                      ) : (
                        <>
                          <video
                            src={publish.media_url!}
                            controls
                            width="500"
                            height="500"
                          />
                        </>
                      )
                    ) : (
                      <div className="flex h-40 w-full items-center justify-center bg-gray-200">
                        <span>No Media</span>
                      </div>
                    )}
                                        <p className="mt-2 text-sm">{publish.content}</p>

                                        <div className="flex justify-center items-center gap-5 mt-3">



                                             {publish.selected_accounts.length >= 1  ? 
                                                                 publish.selected_accounts.map(({social_accounts}:any) => (
                                            
                                                                  <>
                                                                   <Image
                                                                    src={getIcon(social_accounts.platform!)}
                                                                    alt={social_accounts.platform + "-icon"}
                                                                    width={32}
                                                                    height={32}
                                                                    className="border-2 border-black p-1"
                                                                  />
                                                                  </>
                                            
                                                                 ))
                                                                  :null}
                                            {/* <Image src={facebookIcon} alt='facebook-icon' width={32} height={32} className='border-2 border-black p-1' />
                                            <Image src={youtubeIcon} alt='youtube-icon' width={32} height={32} className='border-2 border-black p-1' />
                                            <Image src={instaIcon} alt='instagram-icon' width={32} height={32} className='border-2 border-black p-1' />
                                            <Image src={twitterIcon} alt='twitter-icon' width={32} height={32} className='border-2 border-black p-1' /> */}
                                        </div>


                                        <div>
                                            <Button onClick={() => handleDraft(publish)} >Create Draft</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </ScrollArea>

            </CardContent>
        </Card>
    );
}