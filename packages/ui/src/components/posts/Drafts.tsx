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
import { Dialog, DialogContent, DialogTrigger } from '../../shadcn/dialog';
import { Input } from '../../shadcn/input';
import { Label } from '../../shadcn/label';
import { ScrollArea } from '../../shadcn/scroll-area';
import { Separator } from '../../shadcn/separator';
import getIcon from '../../../../../apps/web/lib/utils/icon';

export default function Drafts() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [scheduleTime, setScheduleTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    async function fetchDrafts() {
      const { data: user } = await requireUser(supabase);
      if (!user) return;

      try {
        const posts = await getUserPosts(user.id, 'draft');
        console.log('Fetched Drafts:', posts);
        setDrafts(posts || []);
      } catch (error) {
        console.error('Error fetching drafts:', error);
      }
    }
    fetchDrafts();
  }, [supabase]);

  const handleEdit = (postId: string) => {
    router.push(`/home/new-post?edit=${postId}`);
  };

  const handleSchedule = async () => {
    if (!selectedPost) return;
    setLoading(true);
    try {
      const {data,error } = await supabase
        .from('posts')
        .update({ scheduled_time: scheduleTime, status: 'scheduled' })
        .eq('id', selectedPost);

        console.log(error)
        console.log(data)
      // await updatePostStatus(selectedPost, 'scheduled');
      setDrafts(drafts.filter((post) => post.id !== selectedPost));
    } catch (error) {
      console.error('Error scheduling post:', error);
    } finally {
      setLoading(false);
      setSelectedPost(null);
      setScheduleTime('');
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h1 className="text-2xl font-bold">Drafts</h1>
        <Separator className="my-4" />

        <ScrollArea className="h-[500px]">
          {drafts.length === 0 ? (
            <p className="text-gray-500">No drafts available.</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {drafts.map((post) => (
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

                    {/* Social Media Account Selection */}
                    {/* <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">Accounts</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Instagram</DropdownMenuItem>
                        <DropdownMenuItem>Twitter</DropdownMenuItem>
                        <DropdownMenuItem>YouTube</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu> */}
                    <div className="mt-3 flex items-center justify-center gap-5">

                      {post.selected_accounts.length >= 1  ? 
                     post.selected_accounts.map(({social_accounts}:any) => (

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

                    
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-10 flex items-center justify-between gap-4">
                      <Button
                        onClick={() => handleEdit(post.id)}
                        variant="outline"
                        className="w-32 shadow-lg"
                      >
                        Edit
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button onClick={() => setSelectedPost(post.id)}
                            disabled={post.selected_accounts.length <= 0}>
                            Schedule
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="p-6">
                          <h2 className="mb-2 text-lg font-bold">
                            Schedule Post
                          </h2>
                          <Label htmlFor="schedule-time">
                            Select Date & Time
                          </Label>
                          <Input
                            id="schedule-time"
                            type="datetime-local"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            className="w-full border p-2"
                          />
                          <Button
                            onClick={handleSchedule}
                            className="mt-4 w-full"
                            disabled={loading}
                          >
                            {loading ? 'Scheduling...' : 'Confirm'}
                          </Button>
                        </DialogContent>
                      </Dialog>
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
