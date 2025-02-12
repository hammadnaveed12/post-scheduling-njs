'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { getSupabaseBrowserClient } from '../../../../supabase/src/clients/browser-client';
import { createPost } from '../../../../supabase/src/posts';
import { requireUser } from '../../../../supabase/src/require-user';
import { selectAccountsForPost } from '../../../../supabase/src/selectedAccounts';
import { getUserAccounts } from '../../../../supabase/src/selectedAccounts';
import { Button } from '../../shadcn/button';
import { Card, CardContent } from '../../shadcn/card';
import { Dialog, DialogContent, DialogTrigger } from '../../shadcn/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../shadcn/dropdown-menu';
import { Input } from '../../shadcn/input';
import { Label } from '../../shadcn/label';
import { Textarea } from '../../shadcn/textarea';

// Use correct auth function

export default function NewPostForm() {
  const [postType, setPostType] = useState<'text' | 'media'>('text');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [scheduledTime, setScheduledTime] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    async function fetchUserAccounts() {
      const { data: user, error } = await requireUser(supabase);
      if (error) {
        console.error('Error fetching user:', error);
        return;
      }

      if (user) {
        try {
          const userAccounts = await getUserAccounts(user.id);
          setAccounts(userAccounts);
        } catch (error) {
          console.error('Error fetching user accounts:', error);
        }
      }
    }

    fetchUserAccounts();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: user } = await requireUser(supabase); // Fetch user session

      if (!user) {
        console.error('No user found');
        setLoading(false);
        return;
      }

      const mediaUrl = media ? URL.createObjectURL(media) : undefined;
      const post = await createPost(
        user.id,
        postType,
        content || null,
        mediaUrl,
        coverImage || undefined,
        scheduledTime || undefined,
      );

      if (!post || post.length === 0 || !post[0]?.id) {
        console.error('Post creation failed: No valid post returned');
        setLoading(false);
        return;
      }

      await selectAccountsForPost(post[0].id, selectedAccounts);
      router.push('/home/drafts');
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card className="mx-auto mt-8 max-w-3xl p-6">
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button
            variant={postType === 'text' ? 'default' : 'outline'}
            onClick={() => setPostType('text')}
          >
            Text Post
          </Button>
          <Button
            variant={postType === 'media' ? 'default' : 'outline'}
            onClick={() => setPostType('media')}
          >
            Media Post
          </Button>
        </div>

        {postType === 'text' && (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post here..."
          />
        )}

        {postType === 'media' && (
          <>
            <Input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setMedia(e.target.files?.[0] || null)}
            />
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add a description (optional)..."
            />
            {media && media.type.startsWith('video') && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Select Cover Image</Button>
                </DialogTrigger>
                <DialogContent>
                  <p>Frame selection feature coming soon...</p>
                </DialogContent>
              </Dialog>
            )}
          </>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Select Accounts</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {accounts.map((account) => (
              <DropdownMenuItem
                key={account.id}
                onClick={() =>
                  setSelectedAccounts((prev) =>
                    prev.includes(account.id)
                      ? prev.filter((id) => id !== account.id)
                      : [...prev, account.id],
                  )
                }
              >
                {selectedAccounts.includes(account.id) ? '✅ ' : ''}
                {account.platform}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Label>Schedule Post:</Label>
        <Input
          type="datetime-local"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
        />

        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Submitting...' : 'Create Post'}
        </Button>
      </CardContent>
    </Card>
  );
}
