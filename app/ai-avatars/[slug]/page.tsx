// ---------------------------------------------------------------------------
// /ai-avatars/<slug> — one avatar: profile, then every image of them.
//
// Same chrome as the deck it hangs off (components/ai-avatars/AvatarDeck):
// the logo top left, no site nav or footer (ConditionalNavbar and Footer
// hide on /ai-avatars/*), the deck's background and glows. The only ways on
// are back to the library and the CTA.
//
// Only named avatars have a page (lib/ai-avatars NAMED_AVATARS, Daniela
// included); an unnamed slot 404s rather than rendering an empty profile.
// Images come from public/ai-avatars/<slug>/ at build time, like the deck.
//
// The deck's style constants live in components/math/ui, a client module, so
// a server page cannot import their values; the few used here are restated.
// ---------------------------------------------------------------------------
import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { socialMeta } from '@/lib/seo';
import { NAMED_AVATARS, NEXLI_AVATAR, avatarBySlug } from '@/lib/ai-avatars';
import { avatarImages } from '@/lib/ai-avatar-images';
import { ADVISORY_PATH } from '@/lib/advisory-config';
import FunnelLogo from '@/components/FunnelLogo';
import AvatarGallery from '@/components/ai-avatars/AvatarGallery';
import { AiBadge, AvatarPortrait } from '@/components/ai-avatars/AvatarCard';

export const dynamic = 'force-static';
export const dynamicParams = false;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#020617',
};

const OUTFIT = { fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" } as const;
const HEADING = { ...OUTFIT, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', color: '#fff' } as const;
const MUTED = 'rgba(255,255,255,0.62)';
const GRADIENT_TEXT = 'bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-300 bg-clip-text text-transparent';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return NAMED_AVATARS.map((a) => ({ slug: a.slug }));
}

function describe(name: string, isNexli: boolean): string {
  return isNexli
    ? `${name} is Nexli Automation’s own AI-generated avatar, the face of Nexli. She is not available to clients.`
    : `${name} is one of the AI-generated avatars Nexli gives a CPA firm as the recurring face of its ads. Each avatar runs for one firm at a time.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const avatar = avatarBySlug(slug);
  if (!avatar?.name) return { title: 'AI Avatars | Nexli Automation' };
  const title = `${avatar.name} | AI Avatar | Nexli Automation`;
  const description = describe(avatar.name, avatar.slug === NEXLI_AVATAR.slug);
  return {
    title,
    description,
    alternates: { canonical: `/ai-avatars/${slug}` },
    ...socialMeta({ title, description, path: `/ai-avatars/${slug}` }),
  };
}

export default async function AiAvatarPage({ params }: Props) {
  const { slug } = await params;
  const avatar = avatarBySlug(slug);
  if (!avatar?.name) notFound();

  const images = avatarImages(avatar.slug);
  const isNexli = avatar.slug === NEXLI_AVATAR.slug;
  const card = { ...avatar, portrait: images.portrait };

  return (
    <main className="relative min-h-screen overflow-x-hidden text-white" style={{ backgroundColor: '#020617', ...OUTFIT }}>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -right-32 -top-40 h-[560px] w-[560px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.13) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -left-40 top-1/3 h-[480px] w-[480px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)' }}
        />
      </div>

      <FunnelLogo />

      <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-24 sm:px-8 md:pt-32">
        <Link
          href="/ai-avatars#library"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-white/60 no-underline transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All avatars
        </Link>

        <section className="mb-14 grid items-center gap-8 md:mb-20 md:grid-cols-[minmax(0,340px)_1fr] md:gap-14">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-[2rem] border border-white/10 md:max-w-none">
            <AvatarPortrait avatar={card} sizes="(min-width: 768px) 340px, 80vw" priority />
            <AiBadge className="absolute left-3 top-3" />
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-400 sm:text-xs">
              {isNexli ? 'Nexli’s own avatar' : 'AI-generated avatar'}
            </div>
            <h1 className="mt-3 text-5xl md:text-7xl" style={HEADING}>
              {isNexli ? avatar.name : <span className={GRADIENT_TEXT}>{avatar.name}</span>}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed md:text-lg" style={{ color: MUTED }}>
              {avatar.persona ?? describe(avatar.name, isNexli)}
            </p>
            {avatar.bestFor && avatar.bestFor.length > 0 && (
              <div className="mt-6">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Best for</div>
                <ul className="flex list-none flex-wrap gap-2 p-0">
                  {avatar.bestFor.map((b) => (
                    <li
                      key={b}
                      className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200"
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-6 max-w-xl text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {isNexli
                ? 'Daniela is the face of Nexli. She is not available to clients.'
                : 'Every avatar is AI-generated and runs for one firm at a time: while a firm is with us, no other client’s ads use it.'}
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-xl md:text-2xl" style={HEADING}>
            {images.all.length > 0 ? `All images (${images.all.length})` : 'Images'}
          </h2>
          <AvatarGallery images={images.all} name={avatar.name} />
        </section>

        <div className="mt-16 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-5">
          <Link
            href="/ai-avatars#library"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-bold text-white no-underline transition-colors hover:border-white/25"
          >
            Browse the library
          </Link>
          <Link
            href={ADVISORY_PATH}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-bold text-white no-underline shadow-xl shadow-blue-600/25"
          >
            See how the system works
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  );
}
