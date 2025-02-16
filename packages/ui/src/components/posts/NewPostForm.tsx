'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { getSupabaseBrowserClient } from '../../../../supabase/src/clients/browser-client';
import { createPost, updateCoverImage } from '../../../../supabase/src/posts';
import { requireUser } from '../../../../supabase/src/require-user';
import { selectAccountsForPost } from '../../../../supabase/src/selectedAccounts';
import { getUserAccounts } from '../../../../supabase/src/selectedAccounts';
import { Button } from '../../shadcn/button';
import { Card, CardContent } from '../../shadcn/card';
import { Dialog, DialogContent, DialogTrigger } from '../../shadcn/dialog';
import { Input } from '../../shadcn/input';
import { Label } from '../../shadcn/label';
import { Textarea } from '../../shadcn/textarea';

export default function NewPostForm() {
  const [postType, setPostType] = useState<'text' | 'media'>('text');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [scheduledTime, setScheduledTime] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    async function fetchUserAccounts() {
      const { data: user, error } = await requireUser(supabase);
      if (error) return console.error('Error fetching user:', error);
      if (user) {
        try {
          const userAccounts = await getUserAccounts(user.id);
          setAccounts(userAccounts);
        } catch (err) {
          console.error('Error fetching accounts:', err);
        }
      }
    }
    fetchUserAccounts();
  }, [supabase]);

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setMedia(event.target.files[0]);
    }
  };

  const removeMedia = () => {
    setMedia(null);
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      const { data: user } = await requireUser(supabase);
      if (!user) throw new Error('User not authenticated');

      const mediaUrl = media ? URL.createObjectURL(media) : null;
      const post = await createPost(
        user.id,
        postType,
        content,
        mediaUrl || '',
        coverImage || '',
        scheduledTime && scheduledTime !== 'draft' ? scheduledTime : null,
        'draft',
      );
      if (post && post.length > 0 && coverImage) {
        await updateCoverImage(post[0].id, coverImage);
      }

      router.push('/home');
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card>
      <CardContent>
        <Label>Post Type</Label>
        <select
          value={postType}
          onChange={(e) => setPostType(e.target.value as 'text' | 'media')}
        >
          <option value="text">Text</option>
          <option value="media">Media</option>
        </select>

        {postType === 'media' && (
          <div className="media-preview-container">
            <Input
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaUpload}
            />
            {media && (
              <div className="media-preview">
                <Image
                  src={URL.createObjectURL(media)}
                  alt="Uploaded Media"
                  width={200}
                  height={200}
                  onClick={() => setShowModal(true)}
                />
                <button onClick={removeMedia}>✖</button>
              </div>
            )}
          </div>
        )}

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger>Open Media</DialogTrigger>
          <DialogContent>
            {media && (
              <Image
                src={URL.createObjectURL(media)}
                alt="Preview"
                width={500}
                height={500}
              />
            )}
          </DialogContent>
        </Dialog>

        <Label>Content</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <Button onClick={handleSaveDraft} disabled={loading}>
          {loading ? 'Saving...' : 'Save Draft'}
        </Button>
      </CardContent>
    </Card>
  );
}
