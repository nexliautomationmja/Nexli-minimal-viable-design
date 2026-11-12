// ---------------------------------------------------------------------------
// The AI avatar library behind /ai-avatars. Data only, no React, no fs.
//
// WHAT AN AVATAR IS. An AI-generated presenter Nexli makes a firm's ads
// with, so nobody at the firm has to get on camera. Every one of these
// people is AI-made, and the page says so on every card. Never describe one
// as a real person, a model or an employee.
//
// THE RULES THE PAGE PROMISES (Marcel, 2026-11-11). Change them here and on
// the page together, never one without the other:
//   - ONE AVATAR, ONE FIRM. While a firm is a client, no other client's ads
//     use its avatar. When the firm leaves, the avatar can go to a new firm.
//   - Daniela is Nexli's own. She presents Nexli (Candor, the booking page)
//     and is never offered to a client.
//   - Like all ad creative, an avatar stays Nexli's property (Terms §6).
//
// FILLING A SLOT. The unnamed slots are placeholders until Marcel sends the
// names and images. To fill one: give it a name, persona and bestFor, change
// its slug to the name (the slug is the URL, /ai-avatars/<slug>), and put
// the images in public/ai-avatars/<slug>/. lib/ai-avatar-images picks them
// up with no other change. A slot with no name renders as "In production"
// and gets no page of its own.
// ---------------------------------------------------------------------------

export type AvatarGender = 'female' | 'male';

export interface AiAvatar {
  /** URL segment and image folder: /ai-avatars/<slug>, public/ai-avatars/<slug>/. */
  slug: string;
  /** Null for a slot that has not been cast yet. */
  name: string | null;
  gender: AvatarGender;
  /** One line on who this avatar is on screen. Hidden when absent. */
  persona?: string;
  /** Regions, markets and ideal clients this avatar suits. Hidden when absent. */
  bestFor?: string[];
}

/** Nexli's own presenter. Featured, never in the library a client picks from. */
export const NEXLI_AVATAR: AiAvatar = {
  slug: 'daniela',
  name: 'Daniela',
  gender: 'female',
  persona: 'The face of Nexli. She answers prospects on Candor and on the booking page.',
};

const slot = (gender: AvatarGender, n: number): AiAvatar => ({
  slug: `${gender === 'female' ? 'woman' : 'man'}-${String(n).padStart(2, '0')}`,
  name: null,
  gender,
});

/** The library a firm picks from: ten women, then ten men. */
export const AI_AVATARS: AiAvatar[] = [
  { slug: 'jasmine', name: 'Jasmine', gender: 'female' },
  { slug: 'olivia', name: 'Olivia', gender: 'female' },
  { slug: 'justine', name: 'Justine', gender: 'female' },
  ...[4, 5, 6, 7, 8, 9, 10].map((n) => slot('female', n)),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => slot('male', n)),
];

/** Every avatar that has a page of its own: Daniela and each named slot. */
export const NAMED_AVATARS: AiAvatar[] = [NEXLI_AVATAR, ...AI_AVATARS.filter((a) => a.name)];

export function avatarBySlug(slug: string): AiAvatar | undefined {
  return NAMED_AVATARS.find((a) => a.slug === slug);
}

/** Alt text that always says what the picture is. */
export function avatarAlt(a: AiAvatar, index?: number): string {
  const who = a.name ?? 'An unnamed avatar';
  return index === undefined
    ? `${who}, an AI-generated avatar`
    : `${who}, an AI-generated avatar, image ${index + 1}`;
}
