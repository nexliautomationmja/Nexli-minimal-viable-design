// ---------------------------------------------------------------------------
// Shared avatar pieces: the "AI-generated" badge and the portrait (or its
// placeholder), used by the deck and by each avatar's page.
//
// Every face says "AI-generated" — the people on these pages are not real
// and the pages must never let anyone think otherwise. An avatar whose
// images have not landed yet renders the "In production" placeholder.
//
// No 'use client' and no hooks, so a server page can render these too.
// ---------------------------------------------------------------------------
import Image from 'next/image';
import { Sparkles, UserRound } from 'lucide-react';
import { avatarAlt, type AiAvatar } from '@/lib/ai-avatars';

export interface CardAvatar extends AiAvatar {
  /** Resolved on the server by lib/ai-avatar-images. */
  portrait: string | null;
}

export function AiBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md ${className}`}
    >
      <Sparkles size={11} className="text-cyan-300" aria-hidden="true" />
      AI-generated
    </span>
  );
}

export function AvatarPortrait({
  avatar,
  sizes,
  priority = false,
}: {
  avatar: CardAvatar;
  sizes: string;
  priority?: boolean;
}) {
  if (avatar.portrait) {
    return (
      <Image
        src={avatar.portrait}
        alt={avatarAlt(avatar)}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover object-top"
      />
    );
  }
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-blue-500/10 via-white/[0.02] to-cyan-500/5">
      <UserRound size={64} strokeWidth={1.2} className="text-white/20" aria-hidden="true" />
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
        In production
      </span>
    </div>
  );
}
