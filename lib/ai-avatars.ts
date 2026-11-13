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
// WHY WE DO IT, which is what the page argues (Marcel, 2026-11-13): most
// agencies run the same ads across all their clients. The same people see
// the same ad with a different firm's name on it, which is ad fatigue, and
// firms that all look the same get treated the same and priced the same. A
// firm's own avatar sets it apart and makes it a brand.
//
// THE ROSTER (Marcel, 2026-11-13): fifteen women besides Daniela, each with
// a short intro video on Mux. No men yet. Listed alphabetically, which is
// the order the library shows them in.
//
// ADDING ONE. Add an entry here (the slug is the URL, /ai-avatars/<slug>),
// then put her images in public/ai-avatars/<slug>/ as WebP. A file named
// portrait.webp is the card and the video poster: use the 9:16 selfie that
// matches the outfit in her video, so the hover preview picks up from it.
// lib/ai-avatar-images finds the rest with no other change.
//
// THE VIDEOS. Mux PLAYBACK ids, not asset ids (https://stream.mux.com/<id>.m3u8
// returns 200 for a playback id). Every one was checked before wiring. The
// captions and the "AI AVATAR – NAME" tag are burned into the video, so the
// players never turn on captions of their own.
// ---------------------------------------------------------------------------

export type AvatarGender = 'female' | 'male';

export interface AiAvatar {
  /** URL segment and image folder: /ai-avatars/<slug>, public/ai-avatars/<slug>/. */
  slug: string;
  name: string;
  gender: AvatarGender;
  /** Mux playback id of the avatar's intro video. */
  playbackId?: string;
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

const woman = (name: string, playbackId: string): AiAvatar => ({
  slug: name.toLowerCase(),
  name,
  gender: 'female',
  playbackId,
});

/** The library a firm picks from. */
export const AI_AVATARS: AiAvatar[] = [
  woman('Abbey', 'Rl1S1B537ZkFBmlCmNFCpECDcZt7h5uYYCNJrKYobjk'),
  woman('Adrianna', 'lAFoxqj02Kku5CW4D01rYGVDm8D9HC3hIK9q009VXymuCk'),
  woman('Anika', 'DTHW003pJfQb4V1Eput7ladg2xVlVsl01BcvIVAuts6fU'),
  woman('Aniyah', 'x6U1p7nPHu6z4Ojoy8pNE6Oc7mSGDpJ1D8MLGgt00C4s'),
  woman('Donna', 'PH02TyJHCdKPxQsbnZ6OqE7GkqpktWlbS7N669UXgHHk'),
  woman('Eliana', 'gNyx02HdVhfBzXiwYoxLv7BJ2VlTZ2FocA01br01JsHFUQ'),
  woman('Grace', 'Hllp02VnJB73F51bECbfdPt82Q0200kTl3plNFncEuHW7Q'),
  woman('Jasmine', '3kXiwnnIiPmOHVgNsfP01mfylvBHy74HthX5VVK8m02Og'),
  woman('Madeline', 'wd1yUP9D003wyJQTUwJzzmSY1u1a802GdOYyUJeCPq00S00'),
  woman('Natalya', 'z00BOr02EoFa02knfil301jxLn8ID61sWc001E7WHQKhel4s'),
  woman('Olivia', 'b3md2n01hefpGcUNdEjKdcgt01lBVLDJnQ00o4QIxGUNwg'),
  woman('Rene', 'yllxGWf6AVrx4nAEg76i1RVmRb5FI3GgKhi3nmSCqIE'),
  woman('Sofia', 'zi14WHwTKvzsX9HCDiW6O3UU2IVSs02F3VEV2mJpVH01Y'),
  woman('Vivian', '6Hdih9wWtXjCu3BtvtuJxvbf2W3sPzVZA4OgFlRbjw8'),
  woman('Zoey', 'F5RCKS3800Lbyl022micl67OafLWfEnzHQlzWdi8xTVh8'),
];

/** The face in the deck's example ad. */
export const EXAMPLE_AVATAR_SLUG = 'olivia';

/**
 * Daniela explaining this page: the video at the top of /ai-avatars, in
 * place of her portrait card. Mux PLAYBACK id; null until Marcel sends it
 * (2026-11-13: rendering). While it is null the cover shows her portrait,
 * so setting it here is the only change the video needs.
 */
export const DANIELA_PAGE_VIDEO: string | null = null;

/** Every avatar that has a page of its own: Daniela and the library. */
export const NAMED_AVATARS: AiAvatar[] = [NEXLI_AVATAR, ...AI_AVATARS];

export function avatarBySlug(slug: string): AiAvatar | undefined {
  return NAMED_AVATARS.find((a) => a.slug === slug);
}

/** Alt text that always says what the picture is. */
export function avatarAlt(a: AiAvatar, index?: number): string {
  return index === undefined
    ? `${a.name}, an AI-generated avatar`
    : `${a.name}, an AI-generated avatar, image ${index + 1}`;
}

/** A still from the video, for wherever there is no portrait.webp. Frame 0
 *  is the only one without the burned-in captions over her face. */
export const muxPoster = (playbackId: string, width = 640) =>
  `https://image.mux.com/${playbackId}/thumbnail.webp?time=0&width=${width}`;
