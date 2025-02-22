'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { RefreshCcw, X } from 'lucide-react';

import BlueSkyIntegration from '../../../../../apps/web/lib/socials/BlueSkyIntegration';
import facebookIcon from '../../../../../apps/web/public/icons/facebook-icon.svg';
import instaIcon from '../../../../../apps/web/public/icons/instagram-icon.svg';
import twitterIcon from '../../../../../apps/web/public/icons/twitter-icon.svg';
import youtubeIcon from '../../../../../apps/web/public/icons/youtube-icon.svg';
import { getSupabaseBrowserClient } from '../../../../supabase/src/clients/browser-client';
import { Avatar, AvatarFallback, AvatarImage } from '../../shadcn/avatar';
import { Button } from '../../shadcn/button';
import { Card, CardContent } from '../../shadcn/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../shadcn/dialog';
import { Input } from '../../shadcn/input';
import { Label } from '../../shadcn/label';
import { Separator } from '../../shadcn/separator';
import { Switch } from '../../shadcn/switch';

const platforms = [
  { id: 'twitter', name: 'Twitter', icon: twitterIcon },
  { id: 'threads', name: 'threads', icon: facebookIcon },
  { id: 'bluesky', name: 'bluesky', icon: twitterIcon },
  { id: 'instagram', name: 'instagram', icon: facebookIcon },
  { id: 'facebook', name: 'facebook', icon: facebookIcon },
  { id: 'linkedin', name: 'LinkedIn', icon: instaIcon },
  { id: 'youtube', name: 'YouTube', icon: youtubeIcon },
  { id: 'tiktok', name: 'tiktok', icon: youtubeIcon },
];

const initialAccounts = {
  twitter: [],
  linkedin: [],
  youtube: [],
  bluesky: [],
  tiktok: [],
  instagram: [],
  threads: [],
  facebook: [],
};

export default function SelectAccounts({
  user_id,
  accounts: socialAccount,
}: {
  user_id: string | undefined;
  accounts: any;
}) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [blueskyUsername, setBlueskyUsername] = useState('');
  const [blueskyPassword, setBlueskyPassword] = useState('');
  const [open, setopen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    socialAccount.map((item, index) => {
      console.log(item);
      setAccounts((prev) => {
        let filtered = prev[item.platform].filter(
          (acc: any) => acc.id != item.id,
        );
        let it = [
          ...filtered,
          {
            id: item.id,
            name: item?.name,
            active: true,
            avatar: item.avatar,
          },
        ];
        return {
          ...prev,
          [item.platform]: it,
        };
      });
    });
  }, [socialAccount]);

  const toggleAccount = (platform: string, id: number) => {
    setAccounts((prev) => ({
      ...prev,
      [platform]: prev[platform].map((acc) =>
        acc.id === id ? { ...acc, active: !acc.active } : acc,
      ),
    }));
  };

  const removeAccount = (platform: string, id: number) => {
    setAccounts((prev) => ({
      ...prev,
      [platform]: prev[platform].filter((acc) => acc.id !== id),
    }));
  };

  const refreshAccount = (platform: string, id: number) => {
    console.log(`Refreshing account ${id} on ${platform}`);
  };

  const addAccount = (platform: string) => {
    const supabase = getSupabaseBrowserClient();
    if (platform.id == 'bluesky') {
      const bsky = new BlueSkyIntegration(blueskyUsername, blueskyPassword);

      bsky.Authorize().then((res) =>
        bsky
          .SaveToSupabase({ supabase, platform, res, user_id })
          .then((res) => {
            if (res.statusText == 'Created') {
              setopen(false);
              router.refresh();
            }
          }),
      );
    } else if (platform.id == 'linkedin') {
      window.location.href = '/api/auth/linkedin';
    } else if (platform.id == 'threads') {
      window.location.href = '/api/auth/threads';
    } else if (platform.id == 'instagram') {
      window.location.href = '/api/auth/instagram';
    } else if (platform.id == 'youtube') {
      window.location.href = '/api/auth/youtube';
    } else if (platform.id == 'tiktok') {
      window.location.href = '/api/auth/tiktok';
    } else if (platform.id == 'twitter') {
    } else if (platform.id == 'facebook') {
      window.location.href = '/api/auth/facebook';
    } else {
      alert(`${platform.id} is not supported yet.`);
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-start text-3xl font-bold">Select Accounts</h1>
      <Separator className="mb-6" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {platforms.map((platform) => (
          <Card key={platform.id} className="p-4 shadow-lg">
            <CardContent>
              <div className="mb-4 flex items-center space-x-2">
                <Image
                  src={platform.icon}
                  alt={platform.name}
                  width={30}
                  height={30}
                  className="h-6 w-6"
                />
                <h2 className="text-lg font-semibold">{platform.name}</h2>
              </div>

              {accounts[platform.id]?.map((account) => (
                <div
                  key={account.id}
                  className="mb-2 flex items-center justify-between rounded-lg border p-2"
                >
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={account.active}
                      onCheckedChange={() =>
                        toggleAccount(platform.id, account.id)
                      }
                    />
                    <Avatar>
                      <AvatarImage src={account.avatar} alt="" />

                      <AvatarFallback>{account.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{account.name}</span>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => refreshAccount(platform.id, account.id)}
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => removeAccount(platform.id, account.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {platform.id == 'bluesky' ? (
                <Dialog open={open} onOpenChange={setopen}>
                  <DialogTrigger asChild>
                    <Button className="mt-2 w-full">Add New</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New</DialogTitle>
                      <DialogDescription>
                        Get your bluesky app password from the bluesky
                        application.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Username
                        </Label>
                        <Input
                          id="name"
                          value={blueskyUsername}
                          onChange={(e) =>
                            setBlueskyUsername(e.currentTarget.value)
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">
                          Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={blueskyPassword}
                          onChange={(e) =>
                            setBlueskyPassword(e.currentTarget.value)
                          }
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        onClick={() => addAccount(platform)}
                      >
                        Add Account
                      </Button>
                    </DialogFooter>
                  </DialogContent>{' '}
                </Dialog>
              ) : (
                <Button
                  className="mt-2 w-full"
                  onClick={() => addAccount(platform)}
                >
                  Add New
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
