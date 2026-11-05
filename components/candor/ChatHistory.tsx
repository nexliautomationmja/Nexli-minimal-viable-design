'use client';

// ---------------------------------------------------------------------------
// The saved-chats drawer.
//
// Slides in from the left over the page, on a phone and a desktop alike — a
// permanent sidebar would cost a 390px screen a third of its width to show a
// list most visitors open once. Escape, the backdrop and the close button all
// dismiss it; the page behind does not scroll while it is open.
//
// DELETE TAKES TWO TAPS. The first turns the bin into a red "Delete" for that
// row only; the second removes it. A single tap next to a row you are trying
// to open is how a conversation disappears by accident, and a native
// confirm() dialog is a heavy way to ask a small question.
// ---------------------------------------------------------------------------

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SquarePen, Trash2, X } from 'lucide-react';
import { type Conversation, relativeTime } from '@/lib/candor-history';

const FAINT = 'rgba(255,255,255,0.4)';

export default function ChatHistory({
  open,
  onClose,
  conversations,
  activeId,
  onOpen,
  onDelete,
  onNew,
}: {
  open: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeId: string;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setPendingDelete(null);
    // Focus the panel, not the close button: a scripted focus on a button
    // draws the focus ring in Safari even after a tap, and the first thing a
    // phone user saw was an orange circle round the X. Tab still lands in the
    // drawer from here.
    panelRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true" aria-label="Your chats">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 h-full w-full cursor-default bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.aside
            ref={panelRef}
            tabIndex={-1}
            className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col border-r border-white/10 bg-[#070c17] shadow-2xl outline-none"
            style={{
              paddingTop: 'max(1rem, env(safe-area-inset-top))',
              paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
            }}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          >
            <div className="flex items-center justify-between px-4 pb-3">
              <h2 className="text-base font-bold text-white">Your chats</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close chats"
                className="flex h-10 w-10 touch-manipulation items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-4 pb-3">
              <button
                type="button"
                onClick={onNew}
                className="flex h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-transform active:scale-[0.98]"
              >
                <SquarePen size={16} />
                New chat
              </button>
            </div>

            <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-2">
              {conversations.length === 0 && (
                <li className="px-3 py-6 text-center text-sm" style={{ color: FAINT }}>
                  No saved chats yet.
                </li>
              )}
              {conversations.map((c) => {
                const questions = c.turns.filter((t) => t.role === 'user').length;
                const active = c.id === activeId;
                const confirming = pendingDelete === c.id;
                return (
                  <li key={c.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => onOpen(c.id)}
                      className={`flex min-h-[56px] w-full touch-manipulation flex-col justify-center rounded-xl px-3 py-2.5 pr-14 text-left transition-colors ${
                        active ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'
                      }`}
                    >
                      <span className="w-full truncate text-sm font-medium text-white/90">{c.title}</span>
                      <span className="mt-0.5 text-[11px]" style={{ color: FAINT }}>
                        {questions} question{questions === 1 ? '' : 's'} · {relativeTime(c.updatedAt)}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => (confirming ? onDelete(c.id) : setPendingDelete(c.id))}
                      onBlur={() => confirming && setPendingDelete(null)}
                      aria-label={confirming ? 'Confirm delete' : 'Delete chat'}
                      className={`absolute right-2 top-1/2 flex h-10 -translate-y-1/2 touch-manipulation items-center justify-center rounded-lg transition-colors ${
                        confirming
                          ? 'bg-red-500/15 px-3 text-xs font-bold text-red-300'
                          : 'w-10 text-white/35 hover:bg-white/10 hover:text-white/80'
                      }`}
                    >
                      {confirming ? 'Delete' : <Trash2 size={15} />}
                    </button>
                  </li>
                );
              })}
            </ul>

            <p className="px-4 pt-3 text-center text-[11px]" style={{ color: FAINT }}>
              Saved on this device only.
            </p>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
