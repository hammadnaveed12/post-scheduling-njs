'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { getSupabaseBrowserClient } from '../../../../supabase/src/clients/browser-client';
import {
  createPost,
  updateCoverImage,
  updatePost,
} from '../../../../supabase/src/posts';
import { requireUser } from '../../../../supabase/src/require-user';
import { getUserAccounts } from '../../../../supabase/src/selectedAccounts';
import { Button } from '../../shadcn/button';
import { Card, CardContent } from '../../shadcn/card';
import { Dialog, DialogContent, DialogTrigger } from '../../shadcn/dialog';
import { Input } from '../../shadcn/input';
import { Textarea } from '../../shadcn/textarea';
import SelectPlatform from '../SelectPlatform';

export default function EditPostForm({ post }: any) {
  const [postType, setPostType] = useState<'text' | 'media'>(post.type);
  const [content, setContent] = useState(post.content);
  const [media, setMedia] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(post.media_url);
  const [scheduledTime, setScheduledTime] = useState(post.schedule_time);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [selectedPlatforms, setSelectedPlatforms] = useState<any>([]);

  const fileInputRef = useRef<any>(null);

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

  function groupAccountsByPlatform(data: any) {
    const groupedData: any = [];

    data.forEach((item) => {
      groupedData.push(item.social_accounts.platform);
    });

    return groupedData;
  }

  useEffect(() => {
    if (post.selected_accounts.length >= 1) {
      let data = groupAccountsByPlatform(post.selected_accounts);
      setSelectedPlatforms(data);
    }
  }, [post]);

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0];
      setMedia(file);
      const objectUrl = URL.createObjectURL(file);
      setCoverImage(objectUrl);
    }
  };

  const removeMedia = () => {
    setMedia(null);
    setCoverImage(null);
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      const { data: user } = await requireUser(supabase);
      if (!user) throw new Error('User not authenticated');

      const updatedPost = await updatePost(
        user.id,
        postType,
        content,
        post,
        media,
        coverImage || '',
        scheduledTime && scheduledTime !== 'draft' ? scheduledTime : null,
        post.status,
      );

      let social_del = [];
      post.selected_accounts.map(({ social_accounts, id }) => {
        if (!selectedPlatforms.includes(social_accounts.platform)) {
          social_del.push(id);
        }
      });

      let social_add =
        post.selected_accounts.length == 0
          ? [...selectedPlatforms]
          : selectedPlatforms.filter((item) => {
              return !post.selected_accounts.find((a) => a.social_accounts.platform == item);
            });

      if (social_del.length >= 1) {
        const { data, error } = await supabase
          .from('selected_accounts')
          .delete()
          .in('id', social_del);
        console.log(error);
      }
      const getSocialAccounts = await supabase
        .from('social_accounts')
        .select('id')
        .eq('user_id', user.id)
        .in('platform', social_add);

      let val = getSocialAccounts.data?.map((item) => ({
        post_id: post.id,
        account_id: user.id,
        social_accounts: item.id!,
      }));

      const addSelectedAccounts = await supabase
        .from('selected_accounts')
        .upsert(val);

      router.push('/home/drafts');

      // if (updatedPost && updatedPost.length > 0 && coverImage) {
      //   await updateCoverImage(updatedPost[0]?.id!, coverImage);
      // }

      // router.push('/home');
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        {/* Media Upload Section */}
        {postType === 'media' && (
          <div className="media-preview-container flex items-start justify-start gap-5">
            {/* Clickable Upload Box */}
            {!coverImage && (
              <label
                htmlFor="file-upload"
                className="mb-5 flex h-64 w-3/4 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300"
              >
                <p className="text-gray-500">Click to upload or drag & drop</p>
              </label>
            )}

            <Input
              id="file-upload"
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaUpload}
              ref={fileInputRef}
              className="mb-5 hidden h-64 w-full"
            />

            {/* Media Preview */}
            {coverImage && (
              <div className="media-preview relative">
                {post.format == 'image' ? (
                  <Image
                    src={coverImage!}
                    alt="Uploaded Media"
                    width={380}
                    height={256}
                    onClick={() => setShowModal(true)}
                    className="mb-5 rounded-lg border border-gray-300"
                  />
                ) : (
                  <video
                    src={coverImage!}
                    controls
                    width="380"
                    height="256"
                    className="rounded-lg border border-gray-300"
                  />
                )}
                <button
                  className="absolute right-0 top-0"
                  onClick={removeMedia}
                >
                  ✖
                </button>
              </div>
            )}
          </div>
        )}

        {/* Media Preview Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            {media &&
              (media.type.startsWith('image/') ? (
                <Image
                  src={coverImage!}
                  alt="Preview"
                  width={500}
                  height={500}
                />
              ) : (
                <video src={coverImage!} controls width="500" height="500" />
              ))}
          </DialogContent>
        </Dialog>

        {/* Content Input */}
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="h-64 w-3/4"
          placeholder="Write post text here."
        />

        {/* Social Media Icons Placeholder */}
        <div className="mt-5 flex items-center justify-start gap-5">
          <SelectPlatform
            type={post.type}
            selectedPlatforms={selectedPlatforms}
            setSelectedPlatforms={setSelectedPlatforms}
          />
        </div>

        {/* Save Draft Button */}
        <Button className="mt-5" onClick={handleSaveDraft} disabled={loading}>
          {loading ? 'Updating...' : 'Update Draft'}
        </Button>
      </CardContent>
    </Card>
  );
}

