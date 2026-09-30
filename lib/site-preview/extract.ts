/**
 * UNUSED BY THE DEMO FUNNEL (kept on purpose).
 *
 * This module was part of the retired /foundation "see your new website"
 * preview flow, which the /demo-opt-in -> /demo funnel replaced with one
 * fixed demo firm. Nothing in the funnel imports it today.
 *
 * It is kept because it is the only working code that scrapes a real firm's
 * live website and turns it into a Nexli site config. That capability moves
 * to the portal (nexli-portal), where an admin generates a paying firm's
 * site from its existing one. Deleting it would mean rewriting it there.
 */
/**
 * Pull structured facts out of a prospect's homepage HTML. Pure string/regex
 * work, no parser dependency, safe on any runtime. Output feeds the copy pass
 * in lib/firm-sites/generator.ts and is stored on site_previews.extracted.
 */
import type { ExtractedSiteFacts } from "../site-previews-schema";

const LIMITS = {
  headings: 20,
  navLinks: 15,
  text: 6000,
  colors: 6,
  logoCandidates: 4,
} as const;

// ── helpers ──────────────────────────────────────────────

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  copy: "©",
  reg: "®",
  trade: "™",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  bull: "•",
  middot: "·",
};

export function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeChar(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => safeChar(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, name: string) => ENTITIES[name.toLowerCase()] ?? m);
}

function safeChar(code: number): string {
  if (!Number.isFinite(code) || code < 32 || code > 0x10ffff) return " ";
  try {
    return String.fromCodePoint(code);
  } catch {
    return " ";
  }
}

function collapse(s: string): string {
  return decodeEntities(s).replace(/\s+/g, " ").trim();
}

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, " ");
}

/** Remove script/style/noscript/svg/template blocks and comments. */
export function stripNonContent(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg|template|iframe|canvas|object)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ");
}

/** Attribute value from a tag string, unquoted and entity-decoded. */
function attr(tag: string, name: string): string | undefined {
  const re = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i");
  const m = re.exec(tag);
  if (!m) return undefined;
  return decodeEntities(m[1] ?? m[2] ?? m[3] ?? "").trim();
}

function resolveUrl(candidate: string | undefined, base: string): string | undefined {
  if (!candidate) return undefined;
  const c = candidate.trim();
  if (!c || c.startsWith("data:") || c.startsWith("javascript:") || c.startsWith("#")) return undefined;
  try {
    const u = new URL(c, base);
    if (u.protocol !== "http:" && u.protocol !== "https:") return undefined;
    // Avoid mixed content when the preview is served over https.
    if (u.protocol === "http:" && base.startsWith("https:")) u.protocol = "https:";
    return u.toString();
  } catch {
    return undefined;
  }
}

function uniq(list: string[], limit: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list) {
    const key = item.toLowerCase();
    if (!item || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= limit) break;
  }
  return out;
}

// ── individual extractors ────────────────────────────────

function metaTags(html: string): string[] {
  return html.match(/<meta\b[^>]*>/gi) ?? [];
}

function metaContent(tags: string[], key: "name" | "property", value: string): string | undefined {
  for (const t of tags) {
    const k = attr(t, key);
    if (k && k.toLowerCase() === value) {
      const c = attr(t, "content");
      if (c) return collapse(c);
    }
  }
  // Some sites swap name/property.
  for (const t of tags) {
    const k = attr(t, key === "name" ? "property" : "name");
    if (k && k.toLowerCase() === value) {
      const c = attr(t, "content");
      if (c) return collapse(c);
    }
  }
  return undefined;
}

export function extractTitle(html: string): string | undefined {
  const m = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  const t = m ? collapse(stripTags(m[1])) : "";
  return t ? t.slice(0, 300) : undefined;
}

export function extractIcons(html: string, base: string): { faviconUrl?: string; appleTouchIcon?: string } {
  const links = html.match(/<link\b[^>]*>/gi) ?? [];
  let favicon: string | undefined;
  let apple: string | undefined;
  for (const l of links) {
    const rel = (attr(l, "rel") || "").toLowerCase();
    const href = resolveUrl(attr(l, "href"), base);
    if (!href) continue;
    if (rel.includes("apple-touch-icon") && !apple) apple = href;
    else if (/(^|\s)(shortcut icon|icon)(\s|$)/.test(rel) && !favicon) favicon = href;
  }
  if (!favicon) {
    try {
      favicon = new URL("/favicon.ico", base).toString();
    } catch {
      // ignore
    }
  }
  return { faviconUrl: favicon, appleTouchIcon: apple };
}

const LOGO_HINT = /logo|brand|wordmark/i;

export function extractLogoCandidates(html: string, base: string): string[] {
  const imgs = html.match(/<img\b[^>]*>/gi) ?? [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const tag of imgs) {
    const src = attr(tag, "src") || attr(tag, "data-src") || attr(tag, "data-lazy-src");
    const hint = [src, attr(tag, "alt"), attr(tag, "class"), attr(tag, "id")].filter(Boolean).join(" ");
    if (!LOGO_HINT.test(hint)) continue;
    const url = resolveUrl(src, base);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push(url);
    if (out.length >= LIMITS.logoCandidates) break;
  }
  // Fallback: the first image inside a <header> or an element with a logo-ish class.
  if (!out.length) {
    const header = /<header\b[^>]*>([\s\S]*?)<\/header>/i.exec(html)?.[1];
    if (header) {
      const img = /<img\b[^>]*>/i.exec(header)?.[0];
      const url = img ? resolveUrl(attr(img, "src") || attr(img, "data-src"), base) : undefined;
      if (url) out.push(url);
    }
  }
  return out;
}

const PHONE_RE = /(?:\+?1[\s.-]?)?\(?\b([2-9]\d{2})\)?[\s.-]?([2-9]\d{2})[\s.-]?(\d{4})\b/g;

export function extractPhone(html: string, text: string): string | undefined {
  // Prefer tel: links.
  const tel = /href\s*=\s*["']tel:([^"']+)["']/i.exec(html)?.[1];
  const tryFormat = (raw: string): string | undefined => {
    const digits = raw.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
    if (digits.length !== 10 || !/^[2-9]\d{2}[2-9]\d{6}$/.test(digits)) return undefined;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };
  if (tel) {
    const f = tryFormat(decodeEntities(tel));
    if (f) return f;
  }
  PHONE_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = PHONE_RE.exec(text))) {
    const f = tryFormat(m[0]);
    if (f) return f;
  }
  return undefined;
}

const EMAIL_RE = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi;

export function extractEmail(html: string, text: string): string | undefined {
  const mailto = /href\s*=\s*["']mailto:([^"'?]+)/i.exec(html)?.[1];
  const ok = (e: string) => {
    const v = decodeEntities(e).trim().toLowerCase();
    if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(v)) return undefined;
    if (/\.(png|jpe?g|gif|svg|webp|css|js)$/.test(v)) return undefined;
    if (/(sentry|wixpress|example\.com|domain\.com|email\.com)/.test(v)) return undefined;
    return v;
  };
  if (mailto) {
    const e = ok(mailto);
    if (e) return e;
  }
  EMAIL_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = EMAIL_RE.exec(text))) {
    const e = ok(m[0]);
    if (e) return e;
  }
  return undefined;
}

const STREET_TYPES =
  "(?:St(?:reet)?|Ave(?:nue)?|Blvd|Boulevard|Rd|Road|Dr(?:ive)?|Ln|Lane|Way|Pkwy|Parkway|Hwy|Highway|Ct|Court|Pl(?:ace)?|Cir(?:cle)?|Ter(?:race)?|Trl|Trail|Plaza|Sq(?:uare)?|Suite|Ste)";
const STATE = "(?:A[LKZR]|C[AOT]|D[EC]|FL|GA|HI|I[DLNA]|K[SY]|LA|M[EDAINSOT]|N[EVHJMYCD]|O[HKR]|PA|RI|S[CD]|T[NX]|UT|V[TA]|W[AVIY])";
const ADDRESS_RE = new RegExp(
  `\\b\\d{1,6}\\s+(?:[A-Z0-9][A-Za-z0-9.'-]*\\s+){0,5}${STREET_TYPES}\\.?(?:[\\s,]+(?:Suite|Ste\\.?|Unit|#|Floor|Fl\\.?)\\s*[A-Za-z0-9-]+)?[\\s,]+[A-Z][A-Za-z.'\\s-]{1,40}?,?\\s+${STATE}\\.?\\s+\\d{5}(?:-\\d{4})?\\b`,
  "g"
);

export function extractAddress(text: string): string | undefined {
  ADDRESS_RE.lastIndex = 0;
  const m = ADDRESS_RE.exec(text);
  if (!m) return undefined;
  return collapse(m[0]).replace(/\s+,/g, ",").slice(0, 200);
}

export function extractHeadings(html: string): string[] {
  const out: string[] = [];
  const re = /<(h[1-3])\b[^>]*>([\s\S]*?)<\/\1\s*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const t = collapse(stripTags(m[2]));
    if (t.length >= 3 && t.length <= 200) out.push(t);
    if (out.length > LIMITS.headings * 3) break;
  }
  return uniq(out, LIMITS.headings);
}

const NAV_SKIP = /^(home|menu|close|toggle|skip to|search|login|log in|sign in|client login|portal|facebook|twitter|linkedin|instagram|youtube|x|\||›|»)$/i;

export function extractNavLinks(html: string): string[] {
  let scope = "";
  const navs = html.match(/<nav\b[^>]*>[\s\S]*?<\/nav\s*>/gi) ?? [];
  if (navs.length) scope = navs.join(" ");
  else {
    const header = /<header\b[^>]*>([\s\S]*?)<\/header>/i.exec(html)?.[1];
    if (header) scope = header;
  }
  if (!scope) return [];
  const out: string[] = [];
  const re = /<a\b[^>]*>([\s\S]*?)<\/a\s*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(scope))) {
    const t = collapse(stripTags(m[1]));
    if (t.length >= 2 && t.length <= 40 && !NAV_SKIP.test(t)) out.push(t);
    if (out.length > LIMITS.navLinks * 4) break;
  }
  return uniq(out, LIMITS.navLinks);
}

export function extractBodyText(html: string): string {
  const bodyMatch = /<body\b[^>]*>([\s\S]*)<\/body>/i.exec(html);
  let scope = bodyMatch ? bodyMatch[1] : html;
  // Block-level tags become line breaks so sentences don't fuse.
  scope = scope.replace(/<\/?(p|div|br|li|h[1-6]|section|article|header|footer|nav|tr|td|th|ul|ol|blockquote)\b[^>]*>/gi, "\n");
  const text = decodeEntities(stripTags(scope))
    .replace(/[ \t\r\f\v]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim()
    .replace(/\n/g, " · ")
    .replace(/(?:\s·\s){2,}/g, " · ");
  return text.slice(0, LIMITS.text);
}

const HEX_RE = /#(?:[0-9a-f]{6}|[0-9a-f]{3})\b/gi;

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.slice(1);
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** True for near-white, near-black and low-saturation greys. */
export function isNeutralColor(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max >= 235 && min >= 225) return true; // near white
  if (max <= 40) return true; // near black
  const l = (max + min) / 2 / 255;
  const d = (max - min) / 255;
  const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return sat < 0.2;
}

function normalizeHex(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

/**
 * Colours that appear on countless sites without being anyone's brand:
 * the WordPress/Gutenberg default editor palette, Bootstrap/Tailwind defaults
 * and common social-button colours.
 */
const STOCK_COLORS = new Set([
  // Gutenberg default palette
  "#00d084", "#0693e3", "#7a00df", "#8ed1fc", "#f78da7", "#cf2e2e", "#fcb900", "#ff6900", "#abb8c3", "#9b51e0", "#f47e3f", "#eb144c",
  // Bootstrap
  "#007bff", "#0d6efd", "#6c757d", "#28a745", "#198754", "#dc3545", "#ffc107", "#17a2b8", "#0dcaf0",
  // Social buttons
  "#1877f2", "#3b5998", "#1da1f2", "#0077b5", "#0a66c2", "#ff0000", "#e4405f", "#25d366",
]);

export function extractColors(rawHtml: string): string[] {
  const counts = new Map<string, number>();
  const bump = (hex: string, weight: number) => {
    const n = normalizeHex(hex.toLowerCase());
    if (isNeutralColor(n) || STOCK_COLORS.has(n)) return;
    counts.set(n, (counts.get(n) ?? 0) + weight);
  };
  const styles = rawHtml.match(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi) ?? [];
  for (const s of styles) for (const m of s.match(HEX_RE) ?? []) bump(m, 1);
  const inline = rawHtml.match(/\sstyle\s*=\s*["'][^"']*["']/gi) ?? [];
  for (const s of inline) for (const m of s.match(HEX_RE) ?? []) bump(m, 2);
  // CSS custom properties and theme hints are strong brand signals.
  for (const m of rawHtml.match(/--(?:primary|brand|accent|main|theme)[a-z0-9-]*\s*:\s*#(?:[0-9a-f]{6}|[0-9a-f]{3})\b/gi) ?? []) {
    const hex = m.match(HEX_RE)?.[0];
    if (hex) bump(hex, 5);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, LIMITS.colors)
    .map(([hex]) => hex);
}

// ── main ─────────────────────────────────────────────────

export function extractSiteFacts(html: string, finalUrl: string): ExtractedSiteFacts {
  const raw = html || "";
  const clean = stripNonContent(raw);
  const metas = metaTags(clean);

  const title = extractTitle(clean);
  const description = metaContent(metas, "name", "description") || metaContent(metas, "property", "og:description");
  const ogImage = resolveUrl(metaContent(metas, "property", "og:image"), finalUrl);
  const siteName = metaContent(metas, "property", "og:site_name");
  const themeColorRaw = metaContent(metas, "name", "theme-color");
  const themeColor = themeColorRaw && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(themeColorRaw) && !isNeutralColor(normalizeHex(themeColorRaw))
    ? normalizeHex(themeColorRaw.toLowerCase())
    : undefined;

  const { faviconUrl, appleTouchIcon } = extractIcons(clean, finalUrl);
  const logos = extractLogoCandidates(clean, finalUrl);
  const logoUrl = logos[0] ?? appleTouchIcon;

  const text = extractBodyText(clean);
  const phone = extractPhone(clean, text);
  const email = extractEmail(clean, text);
  const address = extractAddress(text);
  const headings = extractHeadings(clean);
  const navLinks = extractNavLinks(clean);
  const colors = extractColors(raw);

  const facts: ExtractedSiteFacts = {
    url: finalUrl,
    finalUrl,
    fetchedAt: new Date().toISOString(),
  };
  if (title) facts.title = siteName && !title.toLowerCase().includes(siteName.toLowerCase()) ? `${title} (${siteName})` : title;
  else if (siteName) facts.title = siteName;
  if (description) facts.description = description.slice(0, 500);
  if (ogImage) facts.ogImage = ogImage;
  if (logoUrl) facts.logoUrl = logoUrl;
  if (faviconUrl) facts.faviconUrl = faviconUrl;
  if (themeColor) facts.themeColor = themeColor;
  if (colors.length) facts.colors = colors;
  if (phone) facts.phone = phone;
  if (email) facts.email = email;
  if (address) facts.address = address;
  if (headings.length) facts.headings = headings;
  if (navLinks.length) facts.navLinks = navLinks;
  if (text) facts.text = text;
  return facts;
}
