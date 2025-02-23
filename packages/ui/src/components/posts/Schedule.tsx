<<<<<<< Updated upstream
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { getSupabaseBrowserClient } from '../../../../supabase/src/clients/browser-client';
import { getUserPosts, updatePostStatus } from '../../../../supabase/src/posts';
import { requireUser } from '../../../../supabase/src/require-user';

import { Button } from '../../shadcn/button';
import { Card, CardContent } from '../../shadcn/card';
import { ScrollArea } from '../../shadcn/scroll-area';
import { Separator } from '../../shadcn/separator';
import facebookIcon from "../../../../../apps/web/public/icons/facebook-icon.svg";
import youtubeIcon from "../../../../../apps/web/public/icons/youtube-icon.svg";
import instaIcon from "../../../../../apps/web/public/icons/instagram-icon.svg";
import twitterIcon from "../../../../../apps/web/public/icons/twitter-icon.svg";

export default function Schedules() {
    const [schedules, setSchedules] = useState<any[]>([]);
    const [selectedPost, setSelectedPost] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = getSupabaseBrowserClient();

    useEffect(() => {
        async function fetchSchedules() {
            const { data: user } = await requireUser(supabase);
            if (!user) return;

            try {
                const posts = await getUserPosts(user.id, 'scheduled');
                console.log('Fetched Schedules:', posts);
                setSchedules(posts || []);
            } catch (error) {
                console.error('Error fetching schedules:', error);
            }
        }
        fetchSchedules();
    }, [supabase]);

    const handleEdit = (postId: string) => {
        router.push(`/home/new-post?edit=${postId}`);
    };

    const handleDraft = async (id: any) => {
        setSelectedPost(id);
        if (!selectedPost) return;
        setLoading(true);
        try {
            await updatePostStatus(selectedPost, 'draft');
            setSchedules(schedules.filter((post) => post.id !== selectedPost));
        } catch (error) {
            console.error('Error drafting post:', error);
        } 
    };

    return (
        <Card>
            <CardContent className="p-6">
                <h1 className="text-2xl font-bold">Scheduled</h1>
                <Separator className="my-4" />

                <ScrollArea className="h-[500px]">
                    {schedules.length === 0 ? (
                        <p className="text-gray-500">No schedules available.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {schedules.map((post) => (
                                <Card key={post.id} className="py-4 shadow-lg">
                                    <CardContent>
                                        {post.media_url ? (
                                            <img
                                                src={post.media_url}
                                                alt="Post Media"
                                                className="w-full h-40 object-cover rounded border"
                                            />
                                        ) : (
                                            <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                                                <span>No Media</span>
                                            </div>
                                        )}
                                        <p className="mt-2 text-sm">{post.content}</p>
                                        
                                        <div className="flex justify-center items-center gap-5 mt-3">
                                            <Image src={facebookIcon} alt='facebook-icon' width={32} height={32} className='border-2 border-black p-1' />
                                            <Image src={youtubeIcon} alt='youtube-icon' width={32} height={32} className='border-2 border-black p-1' />
                                            <Image src={instaIcon} alt='instagram-icon' width={32} height={32} className='border-2 border-black p-1' />
                                            <Image src={twitterIcon} alt='twitter-icon' width={32} height={32} className='border-2 border-black p-1' />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex justify-between items-center gap-4 mt-10">
                                            <Button onClick={() => handleEdit(post.id)} variant="outline" className='w-32 shadow-lg'>
                                                Edit
                                            </Button>
                                            <Button onClick={() => handleDraft(post.id)} className='w-32 shadow-lg'>
                                                Unschedule
                                            </Button>
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
=======
'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import facebookIcon from '../../../../../apps/web/public/icons/facebook-icon.svg';
import instaIcon from '../../../../../apps/web/public/icons/instagram-icon.svg';
import twitterIcon from '../../../../../apps/web/public/icons/twitter-icon.svg';
import youtubeIcon from '../../../../../apps/web/public/icons/youtube-icon.svg';
import { getSupabaseBrowserClient } from '../../../../supabase/src/clients/browser-client';
import { getUserPosts, updatePostStatus } from '../../../../supabase/src/posts';
import { requireUser } from '../../../../supabase/src/require-user';
import { Button } from '../../shadcn/button';
import { Card, CardContent } from '../../shadcn/card';
import { ScrollArea } from '../../shadcn/scroll-area';
import { Separator } from '../../shadcn/separator';
import { LoadingOverlay } from '../../makerkit/loading-overlay';


function formatTimestamp(timestamp) {
  // Create a new Date object from the timestamp
  const date = new Date(timestamp);
  
  // Define options for formatting the date
  const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
  };

  // Format the date using the options
  return date.toLocaleString('en-US', options);
}

export default function Schedules() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    async function fetchSchedules() {
      const { data: user } = await requireUser(supabase);
      if (!user) return;

      try {
        const posts = await getUserPosts(user.id, 'scheduled');
        console.log('Fetched Schedules:', posts);
        setSchedules(posts || []);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    }
    fetchSchedules();
  }, [supabase]);

  const handleEdit = (postId: string) => {
    router.push(`/home/new-post?edit=${postId}`);
  };

  const handleDraft = async (id: any) => {
    setSelectedPost(id);
    if (!selectedPost) return;
    
    setLoading(true);
    try {
      const {data,error } = await supabase
      .from('posts')
      .update({ scheduled_time: null, status: 'draft' })
      .eq('id', id);


      setSchedules(schedules.filter((post) => post.id !== selectedPost));

      setLoading(false)
    } catch (error) {
      console.error('Error drafting post:', error);
    }
  };

  return (
    <Card>
            {loading ? <LoadingOverlay />: null}
      
      <CardContent className="p-6">
        <h1 className="text-2xl font-bold">Scheduled</h1>
        <Separator className="my-4" />

        <ScrollArea className="h-[500px]">
          {schedules.length === 0 ? (
            <p className="text-gray-500">No schedules available.</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {schedules.map((post) => (
                <Card key={post.id} className="py-4 shadow-lg">
                  <CardContent>
                    {post.media_url && post.format ? (
                      post.format! == 'image' ? (
                        <>
                          {' '}
                          <img
                            src={post.media_url}
                            alt="Post Media"
                            className="h-40 w-full rounded border object-cover"
                          />{' '}
                        </>
                      ) : (
                        <>
                          <video
                            src={post.media_url!}
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
                    <p className="mt-2 text-sm">{post.content}</p>

                    <div className="mt-3 flex items-center justify-center gap-5">
                      <Image
                        src={facebookIcon}
                        alt="facebook-icon"
                        width={32}
                        height={32}
                        className="border-2 border-black p-1"
                      />
                      <Image
                        src={youtubeIcon}
                        alt="youtube-icon"
                        width={32}
                        height={32}
                        className="border-2 border-black p-1"
                      />
                      <Image
                        src={instaIcon}
                        alt="instagram-icon"
                        width={32}
                        height={32}
                        className="border-2 border-black p-1"
                      />
                      <Image
                        src={twitterIcon}
                        alt="twitter-icon"
                        width={32}
                        height={32}
                        className="border-2 border-black p-1"
                      />
                    </div>

                    <div className='pt-4'>
                      {formatTimestamp(post.scheduled_time)}
                    </div>
                    {/* Action Buttons */}
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <Button
                        onClick={() => handleEdit(post.id)}
                        variant="outline"
                        className="w-32 shadow-lg"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDraft(post.id)}
                        className="w-32 shadow-lg"
                      >
                        Unschedule
                      </Button>
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
>>>>>>> Stashed changes
