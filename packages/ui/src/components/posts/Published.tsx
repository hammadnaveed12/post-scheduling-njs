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

export default function Posted() {
    const [published, setPublished] = useState<any[]>([]);
    const supabase = getSupabaseBrowserClient();

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


    return (
        <Card>
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
                                        {publish.media_url ? (
                                            <img
                                                src={publish.media_url}
                                                alt="Post Media"
                                                className="w-full h-40 object-cover rounded border"
                                            />
                                        ) : (
                                            <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                                                <span>No Media</span>
                                            </div>
                                        )}
                                        <p className="mt-2 text-sm">{publish.content}</p>

                                        <div className="flex justify-center items-center gap-5 mt-3">
                                            <Image src={facebookIcon} alt='facebook-icon' width={32} height={32} className='border-2 border-black p-1' />
                                            <Image src={youtubeIcon} alt='youtube-icon' width={32} height={32} className='border-2 border-black p-1' />
                                            <Image src={instaIcon} alt='instagram-icon' width={32} height={32} className='border-2 border-black p-1' />
                                            <Image src={twitterIcon} alt='twitter-icon' width={32} height={32} className='border-2 border-black p-1' />
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