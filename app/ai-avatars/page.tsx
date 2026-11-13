// ---------------------------------------------------------------------------
// /ai-avatars — the AI avatar pitch deck.
//
// A funnel page in the See the Math style: just the logo, no site nav or
// footer (both hide on /ai-avatars in ConditionalNavbar and Footer). The
// slides and their copy are in components/ai-avatars/AvatarDeck; the
// promises it makes are listed at the top of lib/ai-avatars.
//
// Server side only to find the images: lib/ai-avatar-images reads
// public/ai-avatars/<slug>/, and force-static makes that a build-time read
// in production. Public and indexed (it is in the sitemap and the footer of
// the rest of the site), unlike /math.
// ---------------------------------------------------------------------------
import type { Metadata, Viewport } from 'next';
import { socialMeta } from '@/lib/seo';
import { AI_AVATARS, NEXLI_AVATAR, type AiAvatar } from '@/lib/ai-avatars';
import { avatarImages } from '@/lib/ai-avatar-images';
import { AGENCY_FIRM_SPOTS } from '@/lib/agency-offer';
import { ADVISORY_PATH } from '@/lib/advisory-config';
import AvatarDeck from '@/components/ai-avatars/AvatarDeck';
import type { CardAvatar } from '@/components/ai-avatars/AvatarCard';

export const dynamic = 'force-static';

const TITLE = 'AI Avatars: Branding for CPA Firms | Nexli Automation';
const DESCRIPTION =
  'Most agencies run the same ads for every client, so firms end up looking the same and getting priced the same. Nexli gives your CPA firm its own AI-generated avatar that no other client’s ads use, so your firm stands out as a brand, without you on camera.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/ai-avatars' },
  ...socialMeta({ title: TITLE, description: DESCRIPTION, path: '/ai-avatars' }),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#020617',
};

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

const withPortrait = (a: AiAvatar): CardAvatar => ({ ...a, portrait: avatarImages(a.slug).portrait });

export default function AiAvatarsPage() {
  return (
    <AvatarDeck
      daniela={withPortrait(NEXLI_AVATAR)}
      library={AI_AVATARS.map(withPortrait)}
      firmSpots={WORDS[AGENCY_FIRM_SPOTS] ?? String(AGENCY_FIRM_SPOTS)}
      ctaHref={ADVISORY_PATH}
    />
  );
}
