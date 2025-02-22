'use client';

import React, { useEffect, useState } from 'react';

import Image from 'next/image';

import facebookIcon from '../../../../apps/web/public/icons/facebook-icon.svg';
import instaIcon from '../../../../apps/web/public/icons/instagram-icon.svg';
import twitterIcon from '../../../../apps/web/public/icons/twitter-icon.svg';
import youtubeIcon from '../../../../apps/web/public/icons/youtube-icon.svg';
import { getSupabaseBrowserClient } from '../../../supabase/src/clients/browser-client';
import { requireUser } from '../../../supabase/src/require-user';

const platformIcons = [
  { id: 'twitter', name: 'Twitter', icon: twitterIcon },
  { id: 'threads', name: 'threads', icon: facebookIcon },
  { id: 'bluesky', name: 'bluesky', icon: twitterIcon },
  { id: 'instagram', name: 'instagram', icon: facebookIcon },
  { id: 'facebook', name: 'facebook', icon: facebookIcon },
  { id: 'linkedin', name: 'LinkedIn', icon: instaIcon },
  { id: 'youtube', name: 'YouTube', icon: youtubeIcon },
  { id: 'tiktok', name: 'tiktok', icon: youtubeIcon },
];

function SelectPlatform({ type = 'text' }: { type: 'text' | 'media' }) {
  const [platforms, setPlatforms] = useState([]);
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);

  const handleCheckboxChange = (platform: any) => {
    setSelectedPlatforms(
      (prev: any) =>
        prev.includes(platform)
          ? prev.filter((item: any) => item !== platform) // Remove if already selected
          : [...prev, platform], // Add if not selected
    );
  };

  function filterPlatformsByType(platforms: any, type: 'text' | 'media') {
    const platformTypes: any = {
      facebook: ['text', 'media'],
      instagram: ['media'],
      threads: ['text'],
      bluesky: ['text'],
      twitter: ['text', 'media'], // X (Twitter) supports both
      youtube: ['media'],
      linkedin: ['text', 'media'],
      tiktok: ['media'],
    };

    if (type === 'text') {
      return platforms.filter((platform: any) =>
        platformTypes[platform]?.includes('text'),
      );
    } else if (type === 'media') {
      return platforms.filter((platform: any) =>
        platformTypes[platform]?.includes('media'),
      );
    }
  }

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    async function getPlatformsForUser() {
      const { data: user } = await requireUser(supabase);
      if (!user) return;

      try {
        const social_accounts = await supabase
          .from('social_accounts')
          .select('*')
          .eq('user_id', user.id)
          .eq('active', true);

        const platforms = social_accounts!.data.map((item) => item.platform);
        setPlatforms(platforms);

        console.log('Fetched published posts:', social_accounts);
        // setPlatforms(posts || []);
      } catch (error) {
        console.error('Error fetching published posts:', error);
      }
    }
    getPlatformsForUser();
  }, []);

  useEffect(() => {
    if (type) {
      let platform = filterPlatformsByType(platforms, type);
      setAvailablePlatforms(platform);
    }
  }, [type, platforms]);

  return (
    <div className="mt-3 flex items-center justify-center gap-5">
      {availablePlatforms.map((platform) => (
        <label key={platform} className="flex items-center space-x-2">
          <input
            type="checkbox"
            value={platform}
            checked={selectedPlatforms.includes(platform)}
            onChange={() => handleCheckboxChange(platform)}
            className="h-4 w-4"
          />
          <span>{platform}</span>
        </label>
      ))}
    </div>
  );
}

export default SelectPlatform;
