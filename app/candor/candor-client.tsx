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
// MOTION BUDGET, per the rule in app/accelerator/landing-body: the composer
// rim turns, turns rise as they arrive, the caret blinks, Daniela's presence
// dot pulses, and — added at Marcel's request, matching the portal's Meta
// chip — the Candor chip's rim turns. Both rims are .rim-spin, so reduced
// motion stops them. Nothing else moves.
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
import { ArrowUp, History, Play, SquarePen } from 'lucide-react';
import MuxPlayer from '@mux/mux-player-react';
import { Eyebrow, OUTFIT, RimCard } from '@/components/funnel/primitives';
import VslDisclaimer from '@/components/funnel/VslDisclaimer';
import FunnelLogo from '@/components/FunnelLogo';
import DanielaAvatar from '@/components/candor/DanielaAvatar';
import CandorChip from '@/components/candor/CandorChip';
import ChatHistory from '@/components/candor/ChatHistory';
import {
  type Conversation,
  type Turn,
  loadConversations,
  newConversationId,
  saveConversations,
  upsertConversation,
} from '@/lib/candor-history';
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

  /**
   * The open conversation's id. Also the session_id on the transcript
   * webhook, so reopening a saved chat and asking more keeps arriving in GHL
   * as the same thread rather than a new one.
   */
  const [conversationId, setConversationId] = useState(newConversationId);
  /** Saved chats, newest first. Empty until mounted: localStorage does not
   *  exist on the server, and reading it during render would mismatch. */
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  /** Title for the conversation, fixed at its first question. A chip uses
   *  its short label; a typed question uses what they typed. */
  const pendingTitle = useRef('');

  useEffect(() => {
    setConversations(loadConversations());
    setHydrated(true);
  }, []);

  // Written only after the first read, or the empty initial state would
  // overwrite everything saved before the page loaded.
  useEffect(() => {
    if (hydrated) saveConversations(conversations);
  }, [conversations, hydrated]);

  // Saved when an answer FINISHES, not per streamed token — the page would
  // otherwise rewrite storage forty times a second. A tab closed mid-answer
  // loses that one partial reply, which is the right trade.
  useEffect(() => {
    if (!hydrated || busy || turns.length === 0) return;
    setConversations((prev) => upsertConversation(prev, conversationId, pendingTitle.current, turns));
  }, [busy, turns, conversationId, hydrated]);

  /**
   * How far the on-screen keyboard reaches into the layout viewport.
   *
   * iOS Safari does not shrink the layout viewport when the keyboard opens —
   * it shrinks the VISUAL viewport — so a `bottom: 0` element stays pinned
   * to a bottom edge that is now behind the keyboard, and the composer
   * someone is typing into vanishes. The gap between the two viewports is
   * the keyboard; lifting the bar by exactly that keeps it on top. Where a
   * browser resizes the layout viewport instead (some Android builds),
   * innerHeight shrinks with it, the gap is zero, and this does nothing —
   * which is correct, because the bar is already above the keyboard there.
   */
  const [keyboardInset, setKeyboardInset] = useState(0);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () =>
      setKeyboardInset(Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)));
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  const area = useRef<HTMLTextAreaElement>(null);

  const grow = useCallback(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, []);

  /**
   * Scroll ONCE per new exchange, to the question, and then leave it alone.
   *
   * This used to run on every streamed token with block: 'end', chasing the
   * newest word down the page. On a phone that meant tapping an objection
   * with a recorded answer and arriving mid-paragraph with the video already
   * scrolled off the top — the thing the chip promised, skipped. Bringing the
   * question to the top instead means the answer reads from its first line,
   * video first, while the text types out underneath at its own pace.
   *
   * Keyed on length, not on `turns`, because `turns` changes with every
   * chunk; a smooth scroll restarted forty times a second is also what made
   * the old version judder.
   */
  const turnRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastCount = useRef(0);
  useEffect(() => {
    if (turns.length > lastCount.current && turns.length >= 2) {
      const el = turnRefs.current[turns.length - 2];
      if (el) {
        // offsetTop, NOT scrollIntoView / getBoundingClientRect. The new turn
        // is mid-entrance when this runs — translated 28px down by `rise` —
        // and both of those measure the transformed box, so the page landed
        // aiming where the turn was rather than where it settles, and the
        // question ended up 12px off the top edge. offsetTop ignores
        // transforms. The margin is read from the element so the
        // scroll-mt-* classes stay the single place it is set.
        let y = 0;
        for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
        const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
        window.scrollTo({ top: Math.max(0, y - margin), behavior: 'smooth' });
      }
    }
    lastCount.current = turns.length;
  }, [turns.length]);

  const ask = useCallback(
    async (question: string, objection?: CandorObjection) => {
      const q = question.trim();
      if (!q || busy) return;

      setError(null);
      setBusy(true);
      setInput('');
      if (turns.length === 0) pendingTitle.current = (objection?.label ?? q).slice(0, 80);
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
            sessionId: conversationId,
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
    [busy, conversationId, firstName, grow, leadId, turns],
  );

  const started = turns.length > 0;
  // Derived from the turns rather than tracked separately, so reopening a
  // saved chat brings back the right "not asked yet" chips with it.
  const askedIds = turns.flatMap((t) => (t.role === 'assistant' && t.objection ? [t.objection.id] : []));
  const remaining = CANDOR_OBJECTIONS.filter((o) => !askedIds.includes(o.id));

  /** Leave the current chat. It is already saved; this just clears the room. */
  const newChat = useCallback(() => {
    if (busy) return;
    setConversationId(newConversationId());
    pendingTitle.current = '';
    setTurns([]);
    setInput('');
    setError(null);
    setHistoryOpen(false);
    lastCount.current = 0;
    window.scrollTo({ top: 0 });
  }, [busy]);

  const openConversation = useCallback(
    (id: string) => {
      const c = conversations.find((x) => x.id === id);
      if (!c || busy) return;
      setConversationId(c.id);
      pendingTitle.current = c.title;
      setError(null);
      setInput('');
      setHistoryOpen(false);
      // Reset so the scroll effect treats this as new and brings the last
      // question into view, instead of leaving the page wherever the
      // previous chat happened to be scrolled.
      lastCount.current = 0;
      setTurns(c.turns);
    },
    [busy, conversations],
  );

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (id === conversationId) newChat();
    },
    [conversationId, newChat],
  );

  /**
   * Chats on the left, Candor in the middle, New chat on the right.
   *
   * One row does three jobs, which is what pays for it on a phone: the
   * brand, the way back to saved chats, and the way out of this one. Grid
   * with equal outer columns so the chip stays centred whether or not the
   * side buttons are showing. Pinned to the top once a conversation starts,
   * because "how do I leave this" has to be answerable from anywhere in a
   * long thread, not only after scrolling back up.
   */
  const sideButton =
    'inline-flex h-10 touch-manipulation items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 text-[13px] font-semibold text-white/75 transition-colors [-webkit-tap-highlight-color:transparent] hover:border-white/20 hover:bg-white/[0.08] hover:text-white disabled:opacity-40';
  const header = (
    <div
      className={
        started
          ? 'sticky top-0 z-[90] -mx-4 mb-5 border-b border-white/[0.06] bg-[#020617]/85 px-4 pb-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] backdrop-blur-xl sm:-mx-6 sm:px-6'
          : 'mb-3 sm:mb-6'
      }
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="justify-self-start">
          {hydrated && conversations.length > 0 && (
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              disabled={busy}
              aria-label="Your saved chats"
              className={sideButton}
            >
              <History size={15} aria-hidden="true" />
              Chats
            </button>
          )}
        </div>
        <CandorChip />
        <div className="justify-self-end">
          {started && (
            <button type="button" onClick={newChat} disabled={busy} className={sideButton}>
              <SquarePen size={14} aria-hidden="true" />
              New chat
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const composer = (
    <RimCard innerClassName="p-0 relative" orbs>
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
        // appearance-none is the fix for the grey box behind the placeholder
        // on iPhone. Safari paints its NATIVE textarea chrome — background
        // and inset shadow included — underneath bg-transparent unless the
        // native appearance is switched off. 16px exactly: anything smaller
        // and iOS zooms the whole page the moment the field is tapped.
        //
        // pr-16 keeps text clear of the send button, which now sits INSIDE
        // the field. A separate footer row under the textarea cost a phone
        // ~56px of composer height to hold one button and a keyboard hint
        // that touch screens cannot use anyway.
        className="block w-full resize-none appearance-none bg-transparent pb-3.5 pl-5 pr-16 pt-4 text-[16px] leading-relaxed text-white shadow-none outline-none placeholder:text-white/35 sm:pt-5"
      />
      <button
          type="button"
          onClick={() => void ask(input)}
          disabled={busy || !input.trim()}
          aria-label="Ask"
          className="absolute bottom-2.5 right-2.5 flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30 transition-transform [-webkit-tap-highlight-color:transparent] hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:from-white/10 disabled:to-white/10 disabled:text-white/30 disabled:shadow-none disabled:hover:scale-100"
        >
          {busy ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <ArrowUp size={18} />
          )}
        </button>
    </RimCard>
  );

  /**
   * A chip with a recorded answer is styled differently, and the difference
   * is information rather than decoration: the cyan rim and the play glyph
   * mean "Daniela answers this one on camera". Chips without a clip stay
   * quiet, so the accented ones actually read as the offer.
   */
  const chipRow = (items: CandorObjection[], compact = false) => (
    // A list on a phone, pills from sm up. Centred pills of five different
    // widths wrapped into five ragged rows on a 390px screen and ran under
    // Safari's toolbar. A full-width list is the same content read the way
    // a phone reads a menu: one row per option, every row a 44px tap
    // target, the runtimes lined up down the right edge.
    <div
      className={`flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-2 sm:justify-center ${
        compact ? 'mt-4' : 'mt-2 sm:mt-5'
      }`}
    >
      {items.map((o) => {
        const video = hasVideo(o);
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => void ask(o.prompt, o)}
            disabled={busy}
            className={`group flex min-h-[44px] w-full touch-manipulation items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-[13.5px] transition-colors [-webkit-tap-highlight-color:transparent] disabled:opacity-40 sm:inline-flex sm:min-h-0 sm:w-auto sm:max-w-full sm:gap-2 sm:rounded-full sm:px-3 sm:py-1.5 sm:text-[11px] ${
              video
                ? 'border-cyan-400/30 bg-cyan-400/[0.07] text-cyan-100/90 hover:border-cyan-300/60 hover:bg-cyan-400/[0.12] hover:text-white'
                : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-blue-400/40 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            {video && (
              <span
                aria-hidden="true"
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300 sm:h-4 sm:w-4"
              >
                <Play size={9} fill="currentColor" strokeWidth={0} />
              </span>
            )}
            <span className="min-w-0">{o.label}</span>
            {video && o.duration && (
              <span className="ml-auto shrink-0 tabular-nums text-[11px] text-cyan-300/60 sm:ml-0 sm:text-[10px]">
                {o.duration}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    // overflow-anchor: none on the WHOLE page. Chrome's scroll anchoring
    // picks a visible node to hold steady while layout changes, and as an
    // answer streams it was scrolling the page down after the text — the
    // token-chasing this page had just stopped doing, back via the browser.
    //
    // It has to be the page, not the thread. Excluding only the thread made
    // Chrome anchor on the next visible thing, the background glow at
    // top-1/3 of <main>; as the answer lengthened the page, that glow slid
    // down a third as far and the page followed it. Measured exactly: +96px
    // of content, +32px of scroll, every time. Nothing above the reading
    // point changes height on its own here (the video box is a fixed size),
    // so there is nothing for anchoring to protect.
    <main
      className="relative min-h-screen overflow-x-hidden [overflow-anchor:none]"
      style={{ backgroundColor: '#020617' }}
    >
      {/* Off on a phone, the same call already made for the VSL pages: on a
          narrow screen it is a whole row of chrome above the person you
          came to talk to. FunnelLogo takes no className, hence the wrapper. */}
      {/* Mid-conversation, also off below xl: the header row is pinned to
          the top then, and at tablet widths the fixed logo would sit on top
          of its Chats button. The Candor chip carries the brand there. */}
      <div className={started ? 'hidden xl:block' : 'hidden md:block'}>
        <FunnelLogo />
      </div>

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
        className={`mx-auto max-w-3xl px-4 sm:px-6 ${
          started ? 'pb-32 pt-0 sm:pb-16 sm:pt-6' : 'pb-10 pt-[max(0.5rem,env(safe-area-inset-top))] sm:pt-28'
        }`}
      >
        {header}

        {/* ── The empty state: her face, then the question ─────────────── */}
        {!started && (
          <motion.div {...rise} className="flex flex-col items-center text-center">
            {/* Phone: her face and her name share one row. Desktop: the
                portrait stands alone with the eyebrow beneath. Stacked on a
                phone, the 88px portrait plus the eyebrow took a fifth of the
                screen before the headline, and pushed the composer below
                halfway — the one thing on the page that has to be in reach.
                Two elements rather than one resized avatar because the size
                is set in px on the element; only one is ever displayed. */}
            <div className="flex items-center gap-3 sm:hidden">
              <DanielaAvatar size="md" presence />
              <Eyebrow>Daniela · COO, Nexli</Eyebrow>
            </div>
            <div className="hidden flex-col items-center sm:flex">
              <DanielaAvatar size="lg" presence />
              <div className="mt-5">
                <Eyebrow>Daniela · COO, Nexli</Eyebrow>
              </div>
            </div>
            <h1
              className="mt-3 text-[1.9rem] font-bold leading-[1.08] tracking-tighter text-white sm:mt-4 sm:text-5xl"
              style={OUTFIT}
            >
              {firstName ? `${firstName}, what's ` : "What's "}
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-300 bg-clip-text text-transparent">
                actually stopping you?
              </span>
            </h1>
            <p
              className="mx-auto mt-2.5 max-w-xl text-[15px] leading-relaxed sm:mt-3 sm:text-base"
              style={{ color: MUTED }}
            >
              {/* The middle clause is desktop-only: on a phone it was the line
                  that took this paragraph to three, and the two that remain
                  carry the whole promise. */}
              Your call is booked. Ask me anything before it
              <span className="hidden sm:inline">
                {' '}— the price, the risk, whether this works for a firm like yours
              </span>
              . You will get a straight answer, including the ones that don&apos;t flatter us.
            </p>
          </motion.div>
        )}

        {/* ── The conversation ─────────────────────────────────────────── */}
        {started && (
          <div className="space-y-6">
            {turns.map((t, i) =>
              t.role === 'user' ? (
                <motion.div
                  key={i}
                  ref={(el) => {
                    turnRefs.current[i] = el;
                  }}
                  {...rise}
                  className="flex scroll-mt-20 justify-end sm:scroll-mt-24"
                >
                  <div className="max-w-[85%] rounded-2xl rounded-br-md border border-blue-400/25 bg-gradient-to-br from-blue-600/25 to-cyan-500/15 px-4 py-3">
                    <p className="whitespace-pre-line text-[15px] leading-relaxed sm:text-sm" style={{ color: '#ffffff' }}>
                      {t.content}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={i}
                  ref={(el) => {
                    turnRefs.current[i] = el;
                  }}
                  {...rise}
                  className="flex items-start gap-3"
                >
                  {/* The avatar column is desktop-only. On a phone it moves
                      into the name row, so the answer — and the video in it —
                      gets the full width of the screen instead of losing
                      48px to a column holding one small circle. */}
                  <div className="mt-0.5 hidden sm:block">
                    <DanielaAvatar size="sm" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="ml-1 flex items-center gap-2">
                      <span className="sm:hidden">
                        <DanielaAvatar size="xs" />
                      </span>
                      <p className="text-[11px] font-bold sm:text-[10px]" style={{ color: FAINT }}>
                        Daniela, COO
                      </p>
                    </div>
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
                          // svh, not vh: on iOS 100vh is the height with the
                          // toolbar HIDDEN, so a vh-sized video overshoots the
                          // screen the moment Safari's bars are showing.
                          className="relative flex h-[min(52svh,400px)] justify-center overflow-hidden border-b sm:h-[440px]"
                          style={{
                            borderColor: 'rgba(255,255,255,0.08)',
                            background: '#070c17',
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
                            // 15px on a phone. 14px is comfortable on a
                            // monitor at arm's length and small on a phone
                            // held closer, and these answers are the product.
                            className={`text-[15px] leading-[1.65] sm:text-sm sm:leading-[1.7] ${pi ? 'mt-3.5' : ''}`}
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

          </div>
        )}

        {/* ── Composer ─────────────────────────────────────────────────────
            Inline before the first question, where it is the whole page.
            Pinned to the bottom on a phone once the thread is running, so
            the answer scrolls behind it instead of pushing it off screen. */}
        {!started ? (
          <motion.div {...rise} transition={{ ...rise.transition, delay: 0.08 }} className="mt-4 sm:mt-8">
            {composer}
            <p className="mt-2 hidden text-center text-[11px] sm:block" style={{ color: FAINT }}>
              Enter to ask · Shift+Enter for a new line
            </p>
            {error && (
              <p role="alert" className="mt-3 text-center text-sm" style={{ color: '#fca5a5' }}>
                {error}
              </p>
            )}
            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] sm:hidden" style={{ color: FAINT }}>
              Or start with the one that&apos;s closest
            </p>
            {chipRow(CANDOR_OBJECTIONS)}
            {/* The line that was here promised "nothing you ask comes up on
                the call unless you raise it". That stopped being true the
                moment the transcript started reaching Marcel, so it had to
                go rather than be softened. What is left says only what is
                still true. */}
            <p className="mt-6 text-center text-[11px] leading-relaxed" style={{ color: FAINT }}>
              Candor is an AI. It answers from what Nexli publishes, and it tells you when
              it does not know something rather than guessing.
            </p>
          </motion.div>
        ) : (
          // Background and border are CLASSES now. They were inline, and an
          // inline style beats a class — so sm:bg-transparent never applied
          // and desktop carried a dark band behind the composer it was never
          // meant to have.
          //
          // `bottom` is the keyboard inset: see the hook above. The safe-area
          // padding only does anything because page.tsx sets viewportFit
          // 'cover'; without it iOS reports the inset as 0.
          <div
            className="fixed inset-x-0 bottom-0 z-[100] border-t border-white/[0.08] bg-[#020617]/90 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pt-3 backdrop-blur-xl sm:static sm:mt-8 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0 sm:backdrop-blur-none"
            style={{ bottom: keyboardInset }}
          >
            <div className="mx-auto max-w-3xl sm:max-w-none">
              {composer}
              {/* Inside the bar, not after it: rendered after, on a phone the
                  error landed underneath the fixed composer where nobody
                  could see it. */}
              {error && (
                <p role="alert" className="mt-2 text-center text-sm" style={{ color: '#fca5a5' }}>
                  {error}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <VslDisclaimer />

      <ChatHistory
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        conversations={conversations}
        activeId={conversationId}
        onOpen={openConversation}
        onDelete={deleteConversation}
        onNew={newChat}
      />
    </main>
  );
}
