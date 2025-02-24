'use client';

import { useEffect, useRef, useState } from 'react';

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
import SelectPlatform from '../SelectPlatform';

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<any>([]);

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
      const file = event.target.files[0];
      setMedia(file);
      const objectUrl = URL.createObjectURL(file);
      setCoverImage(objectUrl);
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

      const post = await createPost(
        user.id,
        postType,
        content,
        media,
        coverImage || '',
        scheduledTime && scheduledTime !== 'draft' ? scheduledTime : null,
        'draft',
      );

      let social_add = [...selectedPlatforms]
      
      console.log("social_add: ", social_add)

      const getSocialAccounts = await supabase
      .from('social_accounts')
      .select('id, active, platform')
      .eq('user_id', user.id)
      .eq('active', true)
      .in('platform', social_add);

      console.log(post)
      console.log("social_accounts data: ", getSocialAccounts.data)


    let val = getSocialAccounts.data?.map((item) => ({
      post_id: post[0].id!,
      account_id: user.id,
      social_accounts: item.id!,
    }));
    console.log("value data: ", val)


    const addSelectedAccounts = await supabase
    .from('selected_accounts')
    .upsert(val);

      if (post && post.length > 0 && coverImage) {
        await updateCoverImage(post[0].id, coverImage);
      }


      console.log(addSelectedAccounts.error)

      router.push('/home/drafts');
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card>
      <CardContent>
        {/* Post Type Selection */}
        <div className="flex items-center justify-start gap-10 py-5">
          <label>
            <input
              type="radio"
              value="text"
              checked={postType === 'text'}
              onChange={() => {
                setSelectedPlatforms([])
                setPostType('text')}}
            />
            Text Post
          </label>
          <label>
            <input
              type="radio"
              value="media"
              checked={postType === 'media'}
              onChange={() => {
                setSelectedPlatforms([])
                setPostType('media')}}
            />
            Media Post
          </label>
        </div>

        {/* Media Upload Section */}
        {postType === 'media' && (
          <div className="media-preview-container flex items-start justify-start gap-5">
            {/* Clickable Upload Box */}
            {!media && (
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
            {media && (
              <div className="media-preview relative">
                {media.type.startsWith('image/') ? (
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
          {/* <p>Add icons here</p> */}
          <SelectPlatform
            type={postType}
            selectedPlatforms={selectedPlatforms}
            setSelectedPlatforms={setSelectedPlatforms}
          />
        </div>

        {/* Save Draft Button */}
        <Button className="mt-5" onClick={handleSaveDraft} disabled={loading}>
          {loading ? 'Saving...' : 'Save Draft'}
        </Button>
      </CardContent>
    </Card>
  );
}
