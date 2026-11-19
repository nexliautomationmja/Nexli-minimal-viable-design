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
//   - NEXLI CASTS IT; THE FIRM DOES NOT PICK (Marcel, 2026-11-19). Who
//     appears in an ad changes who Meta delivers it to (Ali et al. 2019,
//     "Discrimination through Optimization", arXiv:1904.02095: changing only
//     an ad's image, headline and text changed its delivery under identical
//     targeting). So the avatar is cast from the firm, its market and the
//     clients it wants to reach. The library is the faces we cast from, not
//     a menu. Say the reason neutrally, as above, on every page.
//
// WHY WE DO IT, which is what the page argues (Marcel, 2026-11-13): most
// agencies run the same ads across all their clients. The same people see
// the same ad with a different firm's name on it, which is ad fatigue, and
// firms that all look the same get treated the same and priced the same. A
// firm's own avatar sets it apart and makes it a brand.
//
// THE ROSTER (Marcel, 2026-11-17): seventeen women besides Daniela and
// fourteen men, each with a short intro video on Mux. Women first, then men,
// each alphabetically. The library opens on the women, with a Men tab
// beside it (Marcel, 2026-11-17), so the order here is the order of each tab.
//
// ADDING ONE. Add an entry here with woman() or man() (the slug is the URL,
// /ai-avatars/<slug>), then put the images in public/ai-avatars/<slug>/ as
// WebP. A file named portrait.webp is the card and the video poster: use the
// 9:16 selfie that matches the outfit in the video, so the hover preview
// picks up from it. lib/ai-avatar-images finds the rest with no other change.
// The name is the one burned into the video's "AI AVATAR – NAME" tag.
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

const avatar = (gender: AvatarGender) => (name: string, playbackId: string): AiAvatar => ({
  slug: name.toLowerCase(),
  name,
  gender,
  playbackId,
});
const woman = avatar('female');
const man = avatar('male');

/** The library a firm picks from: the women, then the men. */
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
  woman('Peyton', '1luaf45hNFa02Nrk6ocHzZvcKvAJoFDs7tmZHP00Hjg18'),
  woman('Rene', 'yllxGWf6AVrx4nAEg76i1RVmRb5FI3GgKhi3nmSCqIE'),
  woman('Sofia', 'zi14WHwTKvzsX9HCDiW6O3UU2IVSs02F3VEV2mJpVH01Y'),
  woman('Vivian', '6Hdih9wWtXjCu3BtvtuJxvbf2W3sPzVZA4OgFlRbjw8'),
  woman('Yasmin', '6G5cdFpYM4ww6H19QNnxeWS00ibkoOFYigKCKtRWpBJI'),
  woman('Zoey', 'F5RCKS3800Lbyl022micl67OafLWfEnzHQlzWdi8xTVh8'),

  man('Andre', 'NYG7LNkRR4mObTBc5cwSYnU1J5nRlemKQZ5HrxnnK2g'),
  man('Arthur', 'EBX6DrW9ipbQl7ksC01gr00vcaUM02LYYZ6mv7eLz9uPK4'),
  man('Charles', 'eYzKUp2lIPrXsUt88ZVluEx5gI02G158Q4DjJM4E4pnI'),
  man('Declan', 'fo00I1Tiz69Ka5L9IfTrxPgMw00GKbfkexG8tb7xLs5WI'),
  man('James', 'cBU7wWUW1qZB3Viyfqaagim3Gjvg5BZZQ01AqYcCQU1I'),
  man('Junho', '01FmSAfBvT02a7q37jbxTunaSyM02Jm7NtkQw3ASZq5aWY'),
  man('Karim', 'THjmp5BSx701GFpeE16tFhcJwDz47Lt001VaOXwRotmVI'),
  man('Kenji', 'G00hN9qNkt00ZntTVpB3SXU6rFYDglU42SzAFVK99Bjto'),
  man('Marcus', 'sO021tnicUvQwB01dcc026ikG00oCgdCoiTeQT63HS7uISU'),
  man('Mateo', 'uXeEjfQ8eiMalmCzuJB3lg4yErmMcWTtk2wZtc00nMyg'),
  // "Palolo" as burned into his video's name tag and as Marcel typed it;
  // his reference folder spells it "Paolo". Change both or neither.
  man('Palolo', 'g7dikBHKXzh2H00BGTZ100nJnCAL020202OzbxSj02JnhOH014'),
  man('Rohan', 'OBShdZYTI18HB5O01ESPALKWydcQKh6xktYC5kpzBkWc'),
  man('William', '01tv23vHBoBCeY7YXTXFSFCzstftz00RrPNNMVUjZrJb8'),
  man('Xavier', 'bVR66wxSd9LagTIQ2xVvbms3I7h4NVKw84EIoPdoCBk'),
];

/** "her" or "his", for copy written about one avatar. */
export const possessive = (a: Pick<AiAvatar, 'gender'>) => (a.gender === 'male' ? 'his' : 'her');
/** "her" or "him". */
export const objective = (a: Pick<AiAvatar, 'gender'>) => (a.gender === 'male' ? 'him' : 'her');

/**
 * The library, opened on one gender's tab. The library opens on the women;
 * ?show=men opens it on the men, so a man's page links back to the tab it
 * came from. The page is static, so the deck reads it in the browser.
 */
export const LIBRARY_MEN_PARAM = 'men';
export const libraryHref = (gender: AvatarGender) =>
  gender === 'male' ? `/ai-avatars?show=${LIBRARY_MEN_PARAM}#library` : '/ai-avatars#library';

/** The face in the deck's example ad. */
export const EXAMPLE_AVATAR_SLUG = 'olivia';

/**
 * Daniela explaining this page: the video at the top of /ai-avatars, in
 * place of her portrait card (Marcel, 2026-11-13). Set it to null and the
 * cover shows her portrait instead.
 *
 * playbackId  Mux PLAYBACK id, checked against stream.mux.com: 1080x1920.
 * posterTime  The frame shown before she plays. 2s is the first one with
 *             her smiling under the "Ad agencies don't want you to see this"
 *             banner; frame 0 is caption-free but catches her mid-word.
 * seconds     Its length, for the caption under it. Change it with the video.
 */
export const DANIELA_PAGE_VIDEO: { playbackId: string; posterTime: number; seconds: number } | null = {
  playbackId: 'nfNwjRt3xxrkH172O9dSvyu4zm4rtl02mrAerFByRGhI',
  posterTime: 2,
  seconds: 45,
};

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
