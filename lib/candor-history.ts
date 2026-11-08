// ---------------------------------------------------------------------------
// Saved Candor conversations — kept in the visitor's own browser.
//
// WHY localStorage AND NOT A TABLE. The people using Candor are mostly
// anonymous — they arrive from a plain link in the booking emails with no
// session cookie — so there is no account to hang server-side history on,
// and adding a table needs a Neon migration. Marcel already receives every
// conversation through the GHL webhook (see app/api/candor/route.ts); this
// file only exists so a VISITOR can leave a chat and find it again. That is
// exactly the per-device convenience browser storage is for.
//
// The consequence worth knowing: history is per device and per browser. A
// firm owner who chats on their phone will not see it on their laptop.
//
// EVERY READ AND WRITE IS GUARDED. Private windows, blocked site data and
// full quotas all make localStorage throw or come back empty, and none of
// that may break the chat itself — it degrades to "no saved chats".
//
// THE OBJECTION IS STORED BY ID, NEVER AS AN OBJECT. A CandorClip carries
// RegExp patterns, and JSON.stringify turns a RegExp into {}. Storing the id
// and looking it up on load also means a re-recorded clip plays in an old
// conversation, rather than the playback id frozen at the time it was asked.
// ---------------------------------------------------------------------------

import { type CandorClip, clipById } from '@/lib/candor-objections';

/** Bump the suffix if the stored shape changes; old data is then ignored. */
const KEY = 'nexli:candor:conversations:v1';

/** Enough to scroll back through, small enough to stay well inside quota. */
const MAX_SAVED = 30;

export type Turn = {
  role: 'user' | 'assistant';
  content: string;
  /** Set on an assistant turn when the question matched a recorded clip:
   *  an objection, or a chapter of Daniela's intro. */
  objection?: CandorClip;
};

type StoredTurn = { role: 'user' | 'assistant'; content: string; objectionId?: string };

export type Conversation = {
  /** Also the session_id sent with the transcript webhook, so a resumed
   *  chat keeps arriving in GHL as the same thread. */
  id: string;
  title: string;
  turns: Turn[];
  createdAt: number;
  updatedAt: number;
};

type StoredConversation = Omit<Conversation, 'turns'> & { turns: StoredTurn[] };

export function newConversationId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
}

function isStoredTurn(t: unknown): t is StoredTurn {
  const x = t as StoredTurn;
  return (
    !!x &&
    (x.role === 'user' || x.role === 'assistant') &&
    typeof x.content === 'string' &&
    (x.objectionId === undefined || typeof x.objectionId === 'string')
  );
}

function hydrate(c: StoredConversation): Conversation {
  return {
    ...c,
    turns: c.turns.map((t) => ({
      role: t.role,
      content: t.content,
      objection: t.objectionId ? clipById(t.objectionId) : undefined,
    })),
  };
}

/** Reads saved conversations, newest first. Anything malformed is dropped. */
export function loadConversations(): Conversation[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (c): c is StoredConversation =>
          !!c &&
          typeof c.id === 'string' &&
          typeof c.title === 'string' &&
          typeof c.createdAt === 'number' &&
          typeof c.updatedAt === 'number' &&
          Array.isArray(c.turns) &&
          c.turns.every(isStoredTurn),
      )
      .map(hydrate)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function saveConversations(list: Conversation[]): void {
  try {
    const stored: StoredConversation[] = list.slice(0, MAX_SAVED).map((c) => ({
      ...c,
      turns: c.turns.map((t) => ({
        role: t.role,
        content: t.content,
        ...(t.objection ? { objectionId: t.objection.id } : {}),
      })),
    }));
    window.localStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    // Quota, private mode or blocked storage. The chat keeps working; it
    // just will not be there next time.
  }
}

/**
 * Upserts the current conversation at the top of the list.
 *
 * Returns the SAME array when nothing changed, so React skips the render
 * and — more to the point — opening an old chat does not bump it to the top
 * of the list as though it had just been used.
 */
export function upsertConversation(
  list: Conversation[],
  id: string,
  title: string,
  turns: Turn[],
): Conversation[] {
  const existing = list.find((c) => c.id === id);
  const lastNew = turns[turns.length - 1]?.content;
  const lastOld = existing?.turns[existing.turns.length - 1]?.content;
  if (existing && existing.turns.length === turns.length && lastNew === lastOld) return list;

  const now = Date.now();
  const next: Conversation = {
    id,
    title: existing?.title ?? title,
    turns,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  return [next, ...list.filter((c) => c.id !== id)].slice(0, MAX_SAVED);
}

/** "just now", "12m ago", "3h ago", "2d ago", then a date. */
export function relativeTime(ts: number, now = Date.now()): string {
  const m = Math.round((now - ts) / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
