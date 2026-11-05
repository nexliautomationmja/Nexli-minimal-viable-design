'use client';

// ---------------------------------------------------------------------------
// Candor — the room.
//
// THE PAGE IS A CONVERSATION WITH A PERSON, not a chat widget. The answers
// have always been written in Daniela's voice; this makes the page say so.
// Her portrait opens it, her face sits on every answer, and the bubble shape
// is the one components/booking/DanielaFaq.tsx already uses — tightened
// bottom-left corner pointing at the avatar — so a firm owner who has seen
// the booking page recognises this as the same product rather than a second
// one bolted on.
//
// THE CHIPS ARE THE OBJECTIONS, and that is the design idea underneath all
// of it. Someone who would never type "honestly, I think I could just do
// this myself" will click it when it is sitting there as a button. After the
// first answer the chips come back minus the ones already asked, which is
// what turns one question into four.
//
// MOTION BUDGET: FOUR THINGS, per the rule in app/accelerator/landing-body.
// The composer rim turns, turns rise as they arrive, the caret blinks, and
// Daniela's presence dot pulses. Nothing else moves. If a fifth is ever
// proposed, one of these comes out.
//
// PARAGRAPH COLOURS ARE INLINE, NOT UTILITIES. app/globals.css declares
// `p { color: var(--text-muted) }` outside any @layer, and in Tailwind v4 an
// unlayered rule beats a layered utility whatever the specificity. A <p> with
// text-neutral-600 on it silently renders at rgba(255,255,255,0.7). The first
// version of this page had that bug in four places; AdCreativeLab documents
// the same trap and the same workaround.
// ---------------------------------------------------------------------------

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Play } from 'lucide-react';
import MuxPlayer from '@mux/mux-player-react';
import { Eyebrow, OUTFIT, RimCard } from '@/components/funnel/primitives';
import VslDisclaimer from '@/components/funnel/VslDisclaimer';
import FunnelLogo from '@/components/FunnelLogo';
import DanielaAvatar from '@/components/candor/DanielaAvatar';
import { renderInline } from '@/lib/inline-markdown';
import {
  CANDOR_OBJECTIONS,
  type CandorObjection,
  hasVideo,
  matchObjection,
} from '@/lib/candor-objections';

/** The house entrance, from app/accelerator/landing-body.tsx. */
const rise = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: 'easeOut' as const },
};

const MUTED = 'rgba(255,255,255,0.62)';
const FAINT = 'rgba(255,255,255,0.38)';

/**
 * Blank-line-separated paragraphs. Mid-stream the final paragraph is a
 * partial sentence, which is exactly what should render — it is being
 * written. An empty string yields one empty paragraph so the caret always
 * has somewhere to sit.
 */
function splitParagraphs(text: string): string[] {
  const parts = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return parts.length ? parts : [''];
}

type Turn = {
  role: 'user' | 'assistant';
  content: string;
  /** Set on an assistant turn when the question came from an objection with
   *  a recorded clip. Carried on the turn rather than looked up at render
   *  time so a later edit to the chip copy cannot orphan a playing video. */
  objection?: CandorObjection;
};

export default function CandorClient({
  firstName,
  leadId,
}: {
  firstName: string | null;
  leadId: string | null;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [asked, setAsked] = useState<string[]>([]);

  const area = useRef<HTMLTextAreaElement>(null);
  const bottom = useRef<HTMLDivElement>(null);

  const grow = useCallback(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, []);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns]);

  const ask = useCallback(
    async (question: string, objection?: CandorObjection) => {
      const q = question.trim();
      if (!q || busy) return;

      setError(null);
      setBusy(true);
      setInput('');
      if (objection) setAsked((prev) => [...prev, objection.id]);
      requestAnimationFrame(grow);

      // A chip click knows its own objection. Anything TYPED is matched on
      // the way through, so "I tried an agency last year and it was a
      // disaster" reaches the same clip the chip would.
      const matched = objection ?? matchObjection(q);

      const history = turns;
      setTurns((prev) => [
        ...prev,
        { role: 'user', content: q },
        { role: 'assistant', content: '', objection: matched },
      ]);

      try {
        const res = await fetch('/api/candor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: q,
            // Strip the objection: the route validates role/content only.
            history: history.map((t) => ({ role: t.role, content: t.content })),
            firstName,
            leadId,
          }),
        });

        if (!res.ok || !res.body) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || 'Something went wrong.');
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setTurns((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === 'assistant') next[next.length - 1] = { ...last, content: last.content + chunk };
            return next;
          });
        }
      } catch (err) {
        // Drop the empty bubble rather than leaving a blank card, and put the
        // question back in the box so it is not lost.
        setTurns((prev) => {
          const next = [...prev];
          if (next[next.length - 1]?.role === 'assistant' && !next[next.length - 1].content) next.pop();
          return next;
        });
        setInput((cur) => cur || q);
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      } finally {
        setBusy(false);
      }
    },
    [busy, firstName, grow, leadId, turns],
  );

  const started = turns.length > 0;
  const remaining = CANDOR_OBJECTIONS.filter((o) => !asked.includes(o.id));

  const composer = (
    <RimCard innerClassName="p-0" orbs>
      <label htmlFor="candor-input" className="sr-only">
        Ask Candor a question
      </label>
      <textarea
        id="candor-input"
        ref={area}
        rows={started ? 1 : 2}
        value={input}
        disabled={busy}
        placeholder={started ? 'Ask another…' : 'Type the thing you would not say on the call…'}
        onChange={(e) => {
          setInput(e.target.value);
          grow();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            // Touch keyboards have no Shift+Enter: Return adds a newline there
            // and only the button sends. Learned the hard way in the studio
            // composer this is ported from.
            if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
            e.preventDefault();
            void ask(input);
          }
        }}
        className="block w-full resize-none bg-transparent px-5 pb-2 pt-5 text-[16px] leading-relaxed text-white outline-none placeholder:text-white/35"
      />
      <div className="flex items-center gap-2 px-3 pb-3 pt-1">
        <span className="hidden min-w-0 flex-1 truncate pl-2 text-[11px] sm:block" style={{ color: FAINT }}>
          Enter to ask · Shift+Enter for a new line
        </span>
        <button
          type="button"
          onClick={() => void ask(input)}
          disabled={busy || !input.trim()}
          aria-label="Ask"
          className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30 transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:from-white/10 disabled:to-white/10 disabled:text-white/30 disabled:shadow-none disabled:hover:scale-100"
        >
          {busy ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <ArrowUp size={18} />
          )}
        </button>
      </div>
    </RimCard>
  );

  /**
   * A chip with a recorded answer is styled differently, and the difference
   * is information rather than decoration: the cyan rim and the play glyph
   * mean "Daniela answers this one on camera". Chips without a clip stay
   * quiet, so the accented ones actually read as the offer.
   */
  const chipRow = (items: CandorObjection[], compact = false) => (
    <div className={`flex flex-wrap justify-center gap-2 ${compact ? 'mt-4' : 'mt-5'}`}>
      {items.map((o) => {
        const video = hasVideo(o);
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => void ask(o.prompt, o)}
            disabled={busy}
            className={`group inline-flex max-w-full items-center gap-2 rounded-2xl border px-3 py-1.5 text-left text-[11px] transition-colors disabled:opacity-40 sm:rounded-full ${
              video
                ? 'border-cyan-400/30 bg-cyan-400/[0.07] text-cyan-100/90 hover:border-cyan-300/60 hover:bg-cyan-400/[0.12] hover:text-white'
                : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-blue-400/40 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            {video && (
              <span
                aria-hidden="true"
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300"
              >
                <Play size={8} fill="currentColor" strokeWidth={0} />
              </span>
            )}
            <span className="min-w-0">{o.label}</span>
            {video && o.duration && (
              <span className="shrink-0 tabular-nums text-[10px] text-cyan-300/60">{o.duration}</span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <main className="relative min-h-screen overflow-x-hidden" style={{ backgroundColor: '#020617' }}>
      <FunnelLogo />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -right-32 -top-40 h-[560px] w-[560px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -left-40 top-1/3 h-[480px] w-[480px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -right-24 h-[480px] w-[480px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 70%)' }}
        />
      </div>

      <div
        className={`mx-auto max-w-3xl px-4 pt-24 sm:px-6 sm:pt-28 ${
          started ? 'pb-44 sm:pb-16' : 'pb-10'
        }`}
      >
        {/* ── The empty state: her face, then the question ─────────────── */}
        {!started && (
          <motion.div {...rise} className="flex flex-col items-center text-center">
            <DanielaAvatar size="lg" presence />
            <div className="mt-5">
              <Eyebrow>Daniela · COO, Nexli</Eyebrow>
            </div>
            <h1
              className="mt-4 text-4xl font-bold tracking-tighter text-white sm:text-5xl"
              style={OUTFIT}
            >
              {firstName ? `${firstName}, what's ` : "What's "}
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-300 bg-clip-text text-transparent">
                actually stopping you?
              </span>
            </h1>
            <p
              className="mx-auto mt-3 max-w-xl text-sm leading-relaxed sm:text-base"
              style={{ color: MUTED }}
            >
              Your call is booked. Ask me anything before it — the price, the risk,
              whether this works for a firm like yours. You will get a straight answer,
              including the ones that don&apos;t flatter us.
            </p>
          </motion.div>
        )}

        {/* ── The conversation ─────────────────────────────────────────── */}
        {started && (
          <div className="space-y-6">
            {turns.map((t, i) =>
              t.role === 'user' ? (
                <motion.div key={i} {...rise} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md border border-blue-400/25 bg-gradient-to-br from-blue-600/25 to-cyan-500/15 px-4 py-3">
                    <p className="whitespace-pre-line text-sm leading-relaxed" style={{ color: '#ffffff' }}>
                      {t.content}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key={i} {...rise} className="flex items-start gap-3">
                  <DanielaAvatar size="sm" className="mt-0.5" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="ml-1 text-[10px] font-bold" style={{ color: FAINT }}>
                      Daniela, COO
                    </p>
                    <div className="overflow-hidden rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.04] backdrop-blur-sm">
                      {/* Her recorded answer, when one exists for this
                          objection. It sits ABOVE the written reply rather
                          than replacing it: a clip cannot say "57 days left
                          in 2026" without going stale the week after it is
                          cut, and the text underneath computes that live
                          every time. The clip does the part writing cannot —
                          concede the objection out loud, in her face. */}
                      {t.objection && hasVideo(t.objection) && (
                        <div
                          className="relative flex justify-center overflow-hidden border-b"
                          style={{
                            borderColor: 'rgba(255,255,255,0.08)',
                            background: '#070c17',
                            height: 'min(58vh, 440px)',
                          }}
                        >
                          {/* Pillarbox, filled with a blurred copy of the
                              clip's own first frame. These are 9:16 Reels in
                              a wide bubble, so something has to occupy the
                              sides; object-cover would decapitate her and
                              flat black reads as a letterboxing bug. Lifted
                              from components/booking/AdCreativeLab, which
                              solved this for the ad grid. */}
                          <span
                            aria-hidden="true"
                            className="absolute inset-0 scale-125"
                            style={{
                              backgroundImage: `url(https://image.mux.com/${t.objection.muxPlaybackId}/thumbnail.jpg?time=${t.objection.posterTime}&width=400)`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              filter: 'blur(28px) brightness(0.45)',
                            }}
                          />
                          {/* The 9:16 box is the WRAPPER, not the player.
                              mux-player is a custom element: given
                              aspect-ratio directly it still stretches to the
                              flex line and letterboxes itself in opaque
                              black, which covered the blurred fill entirely.
                              Sizing a plain div and letting the player fill
                              it 100%/100% is what actually constrains it. */}
                          <div className="relative h-full" style={{ aspectRatio: '9 / 16' }}>
                            <MuxPlayer
                              playbackId={t.objection.muxPlaybackId}
                              streamType="on-demand"
                              // Mux serves a mid-asset frame when given no
                              // time, which on a captioned cut is a poster
                              // of half a sentence.
                              thumbnailTime={t.objection.posterTime}
                              metadata={{ video_title: `Candor — ${t.objection.id}` }}
                              accentColor="#22d3ee"
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'block',
                                // Without this the player paints its own
                                // opaque black behind the frame and the
                                // blurred fill never shows.
                                '--media-background-color': 'transparent',
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {/* Real paragraphs on a capped measure, not one
                          pre-line blob. A bubble can run 1,000px wide on a
                          desktop, and a 150-character line is the single
                          biggest thing that makes a good answer feel like
                          homework. 64ch is the comfortable reading measure;
                          the bubble can stay wide for the video. */}
                      <div className="max-w-[64ch] px-4 py-3.5 sm:px-5">
                        {splitParagraphs(t.content).map((para, pi, all) => (
                          <p
                            key={pi}
                            className={`text-sm leading-[1.7] ${pi ? 'mt-3.5' : ''}`}
                            style={{ color: 'rgba(255,255,255,0.88)' }}
                          >
                            {/* renderInline is the guides' helper — it turns
                                **bold** into a <strong> and nothing else.
                                The persona is allowed one bolded phrase per
                                answer, which is what makes a reply skimmable
                                without turning a spoken voice into a list. */}
                            {renderInline(para)}
                            {/* The caret rides the final paragraph while
                                tokens arrive, so the page reads as being
                                written rather than as having stalled. */}
                            {busy && i === turns.length - 1 && pi === all.length - 1 && (
                              <span
                                aria-hidden="true"
                                className="candor-caret ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.18em] bg-cyan-300"
                              />
                            )}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ),
            )}

            {/* What they have not asked yet. One question becomes four. */}
            {!busy && remaining.length > 0 && chipRow(remaining.slice(0, 3), true)}

            <div ref={bottom} />
          </div>
        )}

        {/* ── Composer ─────────────────────────────────────────────────────
            Inline before the first question, where it is the whole page.
            Pinned to the bottom on a phone once the thread is running, so
            the answer scrolls behind it instead of pushing it off screen. */}
        {!started ? (
          <motion.div {...rise} transition={{ ...rise.transition, delay: 0.08 }} className="mt-8">
            {composer}
            {chipRow(CANDOR_OBJECTIONS)}
            <p className="mt-6 text-center text-[11px] leading-relaxed" style={{ color: FAINT }}>
              Nothing you ask here comes up on the call unless you raise it. Candor is an
              AI — it answers from what Nexli publishes, and it tells you when it does not
              know something rather than guessing.
            </p>
          </motion.div>
        ) : (
          <div
            className="fixed inset-x-0 bottom-0 z-[100] border-t px-4 pt-3 backdrop-blur-xl sm:static sm:mt-8 sm:border-0 sm:bg-transparent sm:px-0 sm:pt-0 sm:backdrop-blur-none"
            style={{
              background: 'rgba(2,6,23,0.9)',
              borderColor: 'rgba(255,255,255,0.08)',
              paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
            }}
          >
            <div className="mx-auto max-w-3xl sm:max-w-none">{composer}</div>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-3 text-center text-sm" style={{ color: '#fca5a5' }}>
            {error}
          </p>
        )}
      </div>

      <VslDisclaimer />
    </main>
  );
}
