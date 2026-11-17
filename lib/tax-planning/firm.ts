// ---------------------------------------------------------------------------
// A firm's settings for the Tax Planning Tool, carried in its link.
//
//   /tax-planning-tool?firm=Smith+%26+Co&fee=7500&inc=1&book=https://...&off=kids,hsa&sal=40
//
// ONLY THE FIRM'S SETTINGS EVER GO IN THE URL. Nexli's Meta pixel, Vercel
// Analytics and portal t.js record the page address on every page, so a
// prospect's revenue and profit in the link would end up with all three.
// The answers stay in the browser (localStorage) and leave it only as the
// PDF the firm sends.
//
// Parsed on the server (app/tax-planning-tool/page.tsx) so the firm's name
// is in the HTML, and serialised on the client as the firm edits. Everything
// is clamped here: the link is typed by people and pasted around, and a
// booking link that isn't plain http(s) is dropped rather than rendered.
// ---------------------------------------------------------------------------
import { DEFAULT_SALARY_PCT, STRATEGY_IDS, type StrategyId } from './engine';

export interface FirmConfig {
  name: string;
  /** The annual planning fee, in dollars. */
  fee: number;
  /** Whether the fee covers the return, or the return is billed on top. */
  feeIncludesReturn: boolean;
  bookUrl: string | null;
  /** Strategies this firm doesn't offer. */
  off: StrategyId[];
  /** Reasonable-salary assumption for S corps, percent of profit. */
  salaryPct: number;
}

export const DEFAULT_FIRM: FirmConfig = {
  name: '',
  fee: 7_500,
  feeIncludesReturn: true,
  bookUrl: null,
  off: [],
  salaryPct: DEFAULT_SALARY_PCT,
};

export const FIRM_NAME_MAX = 60;
export const FEE_MAX = 1_000_000;
export const SALARY_PCT_MIN = 20;
export const SALARY_PCT_MAX = 80;

type Params = Record<string, string | string[] | undefined> | URLSearchParams;

function get(p: Params, key: string): string | undefined {
  if (p instanceof URLSearchParams) return p.get(key) ?? undefined;
  const v = p[key];
  return Array.isArray(v) ? v[0] : v;
}

export function cleanName(raw: string): string {
  // Control characters out, whitespace collapsed. React escapes the rest.
  return raw.replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, FIRM_NAME_MAX);
}

/** http(s) only, with a host. Anything else (javascript:, data:) is dropped. */
export function cleanUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  let s = raw.trim();
  if (!s) return null;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(s)) s = `https://${s}`;
  try {
    const u = new URL(s);
    if ((u.protocol !== 'https:' && u.protocol !== 'http:') || !u.hostname.includes('.')) return null;
    return u.toString().slice(0, 500);
  } catch {
    return null;
  }
}

function clampInt(raw: string | undefined, min: number, max: number, fallback: number): number {
  const n = Math.round(Number(raw));
  if (!raw || !Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/** `setup` is true when no firm is named: the page shows the setup panel. */
export function parseFirm(p: Params): { firm: FirmConfig; setup: boolean } {
  const rawName = get(p, 'firm');
  const name = rawName ? cleanName(rawName) : '';
  const off = (get(p, 'off') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is StrategyId => (STRATEGY_IDS as readonly string[]).includes(s));
  return {
    setup: !name,
    firm: {
      name,
      fee: clampInt(get(p, 'fee'), 0, FEE_MAX, DEFAULT_FIRM.fee),
      feeIncludesReturn: get(p, 'inc') !== '0',
      bookUrl: cleanUrl(get(p, 'book')),
      off: [...new Set(off)],
      salaryPct: clampInt(get(p, 'sal'), SALARY_PCT_MIN, SALARY_PCT_MAX, DEFAULT_FIRM.salaryPct),
    },
  };
}

/** The query string for a firm's link. Defaults are left out to keep it short. */
export function firmQuery(f: FirmConfig): string {
  const q = new URLSearchParams();
  const name = cleanName(f.name);
  if (name) q.set('firm', name);
  q.set('fee', String(Math.round(f.fee)));
  if (!f.feeIncludesReturn) q.set('inc', '0');
  const book = cleanUrl(f.bookUrl ?? undefined);
  if (book) q.set('book', book);
  if (f.off.length) q.set('off', f.off.join(','));
  if (f.salaryPct !== DEFAULT_FIRM.salaryPct) q.set('sal', String(f.salaryPct));
  return q.toString();
}

export const TOOL_PATH = '/tax-planning-tool';
