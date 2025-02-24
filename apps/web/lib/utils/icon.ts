import blueskyIcon from '../../public/icons/bluesky-icon.svg';
import facebookIcon from '../../public/icons/facebook-icon.svg';
import instaIcon from '../../public/icons/instagram-icon.svg';
import linkedinIcon from '../../public/icons/linkedin-icon.svg';
import threadsIcon from '../../public/icons/threads-icon.svg';
import tiktokIcon from '../../public/icons/tiktok-icon.svg';
import twitterIcon from '../../public/icons/twitter-icon.svg';
import youtubeIcon from '../../public/icons/youtube-icon.svg';

const icon: any = {
  instagram: instaIcon,
  facebook: facebookIcon,
  threads: threadsIcon,
  twitter: twitterIcon,
  bluesky: blueskyIcon,
  linkedin: linkedinIcon,
  tiktok: tiktokIcon,
  youtube: youtubeIcon,
};

export default function getIcon(platform: string) {
  console.log(platform);
  console.log(icon[platform]);
  return icon[platform];
}
