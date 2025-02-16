// 'use client';

// import { useEffect, useState, useRef } from 'react';
// import Image from 'next/image';
// import { useRouter } from 'next/navigation';

// import { getSupabaseBrowserClient } from '../../../../supabase/src/clients/browser-client';
// import { createPost, updateCoverImage } from '../../../../supabase/src/posts';
// import { requireUser } from '../../../../supabase/src/require-user';
// import { selectAccountsForPost } from '../../../../supabase/src/selectedAccounts';
// import { getUserAccounts } from '../../../../supabase/src/selectedAccounts';
// import { Button } from '../../shadcn/button';
// import { Card, CardContent } from '../../shadcn/card';
// import { Dialog, DialogContent, DialogTrigger } from '../../shadcn/dialog';
// import { Input } from '../../shadcn/input';
// import { Label } from '../../shadcn/label';
// import { Textarea } from '../../shadcn/textarea';

// export default function NewPostForm() {
//   const [postType, setPostType] = useState<'text' | 'media'>('text');
//   const [content, setContent] = useState('');
//   const [media, setMedia] = useState<File | null>(null);
//   const [coverImage, setCoverImage] = useState<string | null>(null);
//   const [scheduledTime, setScheduledTime] = useState('');
//   const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
//   const [accounts, setAccounts] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const router = useRouter();
//   const supabase = getSupabaseBrowserClient();
//   const fileInputRef = useRef<HTMLInputElement | null>(null);

//   useEffect(() => {
//     async function fetchUserAccounts() {
//       const { data: user, error } = await requireUser(supabase);
//       if (error) return console.error('Error fetching user:', error);
//       if (user) {
//         try {
//           const userAccounts = await getUserAccounts(user.id);
//           setAccounts(userAccounts);
//         } catch (err) {
//           console.error('Error fetching accounts:', err);
//         }
//       }
//     }
//     fetchUserAccounts();
//   }, [supabase]);

//   // Handle media upload and update coverImage
//   const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     if (event.target.files?.[0]) {
//       const file = event.target.files[0];
//       setMedia(file);
//       const objectUrl = URL.createObjectURL(file);
//       setCoverImage(objectUrl);
//     }
//   };

//   // Remove media and clean up URL object
//   const removeMedia = () => {
//     if (coverImage) URL.revokeObjectURL(coverImage);
//     setMedia(null);
//     setCoverImage(null);
//   };

//   // Cleanup object URLs when media changes
//   useEffect(() => {
//     return () => {
//       if (coverImage) URL.revokeObjectURL(coverImage);
//     };
//   }, [coverImage]);

//   const handleSaveDraft = async () => {
//     setLoading(true);
//     try {
//       const { data: user } = await requireUser(supabase);
//       if (!user) throw new Error('User not authenticated');

//       const post = await createPost(
//         user.id,
//         postType,
//         content,
//         coverImage || '',
//         scheduledTime && scheduledTime !== 'draft' ? scheduledTime : null,
//         'draft',
//       );

//       if (post && post.length > 0 && coverImage) {
//         await updateCoverImage(post[0].id, coverImage);
//       }

//       router.push('/home');
//     } catch (error) {
//       console.error('Error saving draft:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Card>
//       <CardContent>
//         {/* Post Type Selection */}
//         <div className='flex justify-start items-center gap-10 py-5'>
//           <label>
//             <input
//               type="radio"
//               value="text"
//               checked={postType === 'text'}
//               onChange={() => setPostType('text')}
//             />
//             Text Post
//           </label>
//           <label>
//             <input
//               type="radio"
//               value="media"
//               checked={postType === 'media'}
//               onChange={() => setPostType('media')}
//             />
//             Media Post
//           </label>
//         </div>

//         {/* Media Upload Section */}
//         {postType === 'media' && (
//           <div className="flex justify-start items-start gap-5 media-preview-container">
//             {/* Clickable Upload Box */}
//             {!media && (
//               <label
//                 htmlFor="file-upload"
//                 className="w-3/4 h-64 mb-5 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer rounded-lg"
//               >
//                 <p className="text-gray-500">Click to upload or drag & drop</p>
//               </label>
//             )}

//             <Input
//               id="file-upload"
//               type="file"
//               accept="image/*,video/*"
//               onChange={handleMediaUpload}
//               ref={fileInputRef}
//               className='hidden w-full h-64 mb-5'
//             />

//             {/* Media Preview */}
//             {media && (
//               <div className="media-preview relative">
//                 {media.type.startsWith('image/') ? (
//                   <Image
//                     src={coverImage!}
//                     alt="Uploaded Media"
//                     width={380}
//                     height={256}
//                     onClick={() => setShowModal(true)}
//                     className='border border-gray-300 rounded-lg mb-5'
//                   />
//                 ) : (
//                   <video
//                     src={coverImage!}
//                     controls
//                     width="380"
//                     height="256"
//                     className="border border-gray-300 rounded-lg"
//                   />
//                 )}
//                 <button className='absolute top-0 right-0' onClick={removeMedia}>✖</button>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Media Preview Modal */}
//         <Dialog open={showModal} onOpenChange={setShowModal}>
//           <DialogContent>
//             {media && (
//               media.type.startsWith('image/') ? (
//                 <Image src={coverImage!} alt="Preview" width={500} height={500} />
//               ) : (
//                 <video src={coverImage!} controls width="500" height="500" />
//               )
//             )}
//           </DialogContent>
//         </Dialog>

//         {/* Content Input */}
//         <Textarea
//           value={content}
//           onChange={(e) => setContent(e.target.value)}
//           className="w-3/4 h-64"
//           placeholder='Write post text here.'
//         />

//         {/* Social Media Icons Placeholder */}
//         <div className="flex justify-start items-center gap-5 mt-5">
//           <p>Add icons here</p>
//         </div>

//         {/* Save Draft Button */}
//         <Button className="mt-5" onClick={handleSaveDraft} disabled={loading}>
//           {loading ? 'Saving...' : 'Save Draft'}
//         </Button>
//       </CardContent>
//     </Card>
//   );
// }


'use client';

import { useEffect, useState, useRef } from 'react';

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        {/* Post Type Selection */}
        <div className='flex justify-start items-center gap-10 py-5'>
          <label>
            <input
              type="radio"
              value="text"
              checked={postType === 'text'}
              onChange={() => setPostType('text')}
            />
            Text Post
          </label>
          <label>
            <input
              type="radio"
              value="media"
              checked={postType === 'media'}
              onChange={() => setPostType('media')}
            />
            Media Post
          </label>
        </div>

        {/* Media Upload Section */}
        {postType === 'media' && (
          <div className="flex justify-start items-start gap-5 media-preview-container">
            {/* Clickable Upload Box */}
            {!media && (
              <label
                htmlFor="file-upload"
                className="w-3/4 h-64 mb-5 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer rounded-lg"
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
              className='hidden w-full h-64 mb-5'
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
                    className='border border-gray-300 rounded-lg mb-5'
                  />
                ) : (
                  <video
                    src={coverImage!}
                    controls
                    width="380"
                    height="256"
                    className="border border-gray-300 rounded-lg"
                  />
                )}
                <button className='absolute top-0 right-0' onClick={removeMedia}>✖</button>
              </div>
            )}
          </div>
        )}

        {/* Media Preview Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            {media && (
              media.type.startsWith('image/') ? (
                <Image src={coverImage!} alt="Preview" width={500} height={500} />
              ) : (
                <video src={coverImage!} controls width="500" height="500" />
              )
            )}
          </DialogContent>
        </Dialog>

        {/* Content Input */}
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-3/4 h-64"
          placeholder='Write post text here.'
        />

        {/* Social Media Icons Placeholder */}
        <div className="flex justify-start items-center gap-5 mt-5">
          <p>Add icons here</p>
        </div>

        {/* Save Draft Button */}
        <Button className="mt-5" onClick={handleSaveDraft} disabled={loading}>
          {loading ? 'Saving...' : 'Save Draft'}
        </Button>
      </CardContent>
    </Card>
  );
}