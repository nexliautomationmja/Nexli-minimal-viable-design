'use client';

// ---------------------------------------------------------------------------
// Delivery first, then the bridge to the agency offer.
//
// Order matters: they paid thirty seconds ago, so the thing they bought is at
// the top of the page. The pitch earns its place underneath it, not above.
// ---------------------------------------------------------------------------

import React, { useEffect, useRef, useState } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { CheckCircle2, Volume2 } from 'lucide-react';
import DeliveryBlock from '@/components/advisory/DeliveryBlock';
import PipelineMath from '@/components/advisory/PipelineMath';
import { ShimmerBadge } from '@/components/TransformationCards';
import FunnelCta from '@/components/funnel/FunnelCta';
import { RimCard } from '@/components/funnel/primitives';
import { trackMetaEvent } from '@/lib/meta-events';
import { useVideoTracking } from '@/lib/use-video-tracking';
import {
  ADVISORY_PRODUCT_ID,
  ADVISORY_PRODUCT_NAME,
  ADVISORY_QUALIFY_PATH,
  ADVISORY_THANKYOU_VIDEO_PLAYBACK_ID,
  ADVISORY_THANKYOU_VIDEO_TITLE,
} from '@/lib/advisory-config';

const OUTFIT: React.CSSProperties = {
  fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
};

interface Props {
  firstName: string;
  email: string;
  /** Empty for a returning buyer arriving on the cookie. */
  sessionId: string;
  purchaseEventId: string;
  amount: number;
  currency: string;
}

export default function AdvisoryThankYouClient({
  firstName,
  email,
  sessionId,
  purchaseEventId,
  amount,
  currency,
}: Props) {
  const fired = useRef(false);
  const { videoRef, handlers } = useVideoTracking('advisory_thankyou_session_id', 'advisory-thankyou', email);

  // ── Autoplay with sound ────────────────────────────────────────────────
  // Browsers decide this, not us. Chrome and Safari refuse autoplay with
  // sound until the origin has earned enough engagement, and a refused
  // play() leaves a dead player. So: ask for sound first, and if the browser
  // says no, fall back to muted playback and unmute on the viewer's very
  // first interaction with the page — which is the loudest we are allowed
  // to be without ever showing a stalled video.
  const [needsTapForSound, setNeedsTapForSound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const t = window.setTimeout(async () => {
      const el = videoRef.current as HTMLVideoElement | null;
      if (!el || cancelled) return;
      try {
        el.muted = false;
        el.volume = 1;
        await el.play();
      } catch {
        if (cancelled) return;
        el.muted = true;
        setNeedsTapForSound(true);
        try {
          await el.play();
        } catch {
          /* nothing left to try; the player keeps its own play button */
        }
      }
    }, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [videoRef]);

  useEffect(() => {
    if (!needsTapForSound) return;
    const unmute = () => {
      const el = videoRef.current as HTMLVideoElement | null;
      if (el) {
        el.muted = false;
        el.volume = 1;
        void el.play().catch(() => {});
      }
      setNeedsTapForSound(false);
    };
    window.addEventListener('pointerdown', unmute, { once: true });
    window.addEventListener('keydown', unmute, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unmute);
      window.removeEventListener('keydown', unmute);
    };
  }, [needsTapForSound, videoRef]);

  // Browser-side Purchase with the same event_id as the server webhook → dedup.
  // Only on a fresh arrival from Stripe; a returning buyer has no session id
  // and must not re-fire a conversion.
  useEffect(() => {
    if (fired.current || !sessionId || !purchaseEventId) return;
    fired.current = true;

    const guardKey = `advisory_purchase_fired:${sessionId}`;
    try {
      if (sessionStorage.getItem(guardKey)) return;
      sessionStorage.setItem(guardKey, '1');
    } catch {
      // storage unavailable — fire anyway; the server dedups on event_id
    }

    trackMetaEvent(
      'Purchase',
      {
        content_name: ADVISORY_PRODUCT_NAME,
        content_type: 'product',
        content_ids: [ADVISORY_PRODUCT_ID],
        value: amount,
        currency,
        num_items: 1,
      },
      purchaseEventId,
    );
  }, [sessionId, purchaseEventId, amount, currency]);

  return (
    <div className="relative z-10 mx-auto max-w-4xl px-4 pt-20 pb-20 md:pt-24">
      <div>
        <span
          className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
          style={{
            backgroundColor: 'rgba(16,185,129,0.1)',
            borderColor: 'rgba(16,185,129,0.25)',
          }}
        >
          <CheckCircle2 size={14} style={{ color: '#34d399' }} aria-hidden="true" />
          <span
            className="text-[11px] font-bold uppercase tracking-[0.15em]"
            style={{ color: '#34d399' }}
          >
            Payment complete
          </span>
        </span>

        <h1
          className="mt-4 text-2xl sm:text-3xl md:text-4xl font-black leading-[1.08] tracking-tight text-white"
          style={OUTFIT}
        >
          {firstName ? `You're in, ${firstName}.` : "You're in."}
        </h1>
        {/* Desktop only. On a phone this is ~95px of prose sitting between the
            buyer and the agency CTA, and `hidden` collapses its margin too, so
            the notice, the video and the CTA card all move up with it. */}
        <p
          className="mt-4 hidden text-sm sm:text-base leading-relaxed md:block"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          Pull your top twenty this week and make the first call. That is when the gap
          between what you charge and what the work is worth stops being theoretical.
        </p>
      </div>

      {/* ---- What they bought, and the welcome video ---------------------- */}
      {/* Side by side from md up. Stacked, these two run ~860px and push the
          agency CTA a long way below the fold; in one row they cost ~360px
          and the CTA clears it. On mobile they stack in the same order.
          The video lives here rather than inside DeliveryBlock, which is also
          rendered on /next-steps — a "thanks for buying" video on the page
          that tells a firm they are not a fit would be the wrong note. */}
      <div className="mt-6 grid grid-cols-1 items-start gap-5 md:grid-cols-2">
        <DeliveryBlock email={email} />

        {ADVISORY_THANKYOU_VIDEO_PLAYBACK_ID && (
          <div
            className="relative overflow-hidden rounded-2xl md:rounded-[2rem] border bg-[#050505] shadow-2xl"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <div className="pointer-events-none absolute top-0 left-1/2 h-[200px] w-full -translate-x-1/2 bg-blue-500/5 blur-[100px]" />
            <div className="relative z-10 p-2.5 sm:p-4">
              <MuxPlayer
                ref={videoRef}
                playbackId={ADVISORY_THANKYOU_VIDEO_PLAYBACK_ID}
                metadata={{ video_title: ADVISORY_THANKYOU_VIDEO_TITLE }}
                streamType="on-demand"
                accentColor="#3b82f6"
                /* The floor: guarantees the video plays at all. The effect
                   above immediately tries to upgrade it to sound. */
                autoPlay="muted"
                playsInline
                className="w-full rounded-xl md:rounded-2xl"
                style={{ aspectRatio: '16/9' }}
                onPlay={handlers.onPlay}
                onPause={handlers.onPause}
                onTimeUpdate={handlers.onTimeUpdate}
                onEnded={handlers.onEnded}
              />

              {/* Only rendered when the browser refused sound. Any click
                  anywhere on the page clears it, so this is a hint rather
                  than a thing they have to hit. */}
              {needsTapForSound && (
                <button
                  type="button"
                  onClick={() => {
                    const el = videoRef.current as HTMLVideoElement | null;
                    if (el) {
                      el.muted = false;
                      el.volume = 1;
                      void el.play().catch(() => {});
                    }
                    setNeedsTapForSound(false);
                  }}
                  className="absolute left-1/2 top-4 z-20 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold text-white backdrop-blur-md transition-transform hover:scale-[1.03]"
                  style={{
                    background: 'rgba(37,99,235,0.85)',
                    borderColor: 'rgba(255,255,255,0.2)',
                  }}
                >
                  <Volume2 size={14} aria-hidden="true" />
                  Tap for sound
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ---- The bridge to the agency offer ----------------------------- */}
      {/* Breaks out past the max-w-3xl column on purpose — the benchmark's
          feature card is wider than its surroundings, and that is what makes
          it read as a showpiece rather than another section.
          Only from lg: at the md breakpoint the viewport is 768px and the
          column is already max-w-3xl, so a negative margin there would push
          the card wider than the screen and cause horizontal scroll. */}
      <RimCard
        className="mt-8 lg:-mx-12"
        innerClassName="px-4 py-5 sm:px-8 sm:py-7"
      >
        <div className="mb-2 sm:mb-3">
          <ShimmerBadge
            conicStops="#60a5fa, #a78bfa, #22d3ee, #60a5fa"
            starClass="text-blue-400 fill-blue-400"
            labelClass="text-blue-300"
          >
            While you are here
          </ShimmerBadge>
        </div>

        <h2
          className="text-lg sm:text-2xl md:text-[1.9rem] font-black tracking-[-0.03em] leading-[1.15] text-white"
          style={OUTFIT}
        >
          Where is the next 50 going to come from?
          {/* Its own line, and the gradient, because it is the answer to the
              question above it — the same treatment the sales-page h1 uses. */}
          <span
            className="mt-1 block bg-clip-text text-transparent sm:mt-1.5"
            style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa, #22d3ee)' }}
          >
            We keep your pipeline full.
          </span>
        </h2>

        {/* Desktop only, here and for the two paragraphs below. On a phone the
            card earns its place as question -> answer -> button; the argument
            underneath is what you read on a laptop, not what you act on with
            a thumb. */}
        <p
          className="mt-3 hidden text-base font-black tracking-[-0.02em] sm:text-lg md:block"
          style={{ ...OUTFIT, color: 'rgba(255,255,255,0.7)' }}
        >
          Your top 20 will run out.
        </p>

        <p
          className="mt-3 hidden text-sm leading-relaxed sm:text-base md:block"
          style={{ color: 'rgba(255,255,255,0.72)' }}
        >
          There is no twenty-first name on that sheet. We bring you 50 new qualified
          advisory leads, so the play you just learned keeps paying after your own book
          is spent.
        </p>

        <p
          className="mt-3 hidden text-sm leading-relaxed sm:text-base md:block"
          style={{ color: 'rgba(255,255,255,0.72)' }}
        >
          Not every firm is a fit, and we would rather say so now than at the end of a
          call. Six questions, about a minute.
        </p>

        <div className="mt-4 md:mt-6">
          <FunnelCta href={ADVISORY_QUALIFY_PATH} size="mdTight">
            Show me where the next 50 come from
          </FunnelCta>
        </div>

        <p className="mt-2.5 text-[11px] leading-relaxed sm:mt-3 sm:text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
          No pitch until we both know it makes sense. The guide is yours either way.
        </p>
      </RimCard>

      {/* ---- What that half is worth ------------------------------------ */}
      <PipelineMath />
    </div>
  );
}
