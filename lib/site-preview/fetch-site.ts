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
 * Fetch a prospect's public website for the preview generator.
 *
 * Server-only (uses node:dns). Hardened against SSRF: only http(s) on ports
 * 80/443 to public hostnames whose every resolved address is public; redirects
 * are followed manually (max 3) and re-checked per hop; 8s timeout; 1.5MB body
 * cap; text/html only. Never throws — returns { error } instead.
 */
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export const FETCH_TIMEOUT_MS = 8_000;
export const MAX_HTML_BYTES = 1_500_000;
export const MAX_REDIRECTS = 3;

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const BLOCKED_TLDS = ["local", "internal", "test", "localhost", "invalid", "example", "onion", "home", "lan", "corp"];

export type FetchSiteResult =
  | { finalUrl: string; html: string; contentType: string }
  | { error: string };

// ── IP range checks ──────────────────────────────────────

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const v = Number(p);
    if (v > 255) return null;
    n = n * 256 + v;
  }
  return n;
}

function inV4Range(ip: number, cidr: string): boolean {
  const [base, bitsStr] = cidr.split("/");
  const bits = Number(bitsStr);
  const b = ipv4ToInt(base);
  if (b === null) return false;
  if (bits === 0) return true;
  const mask = bits === 32 ? 0xffffffff : (~((1 << (32 - bits)) - 1)) >>> 0;
  return ((ip & mask) >>> 0) === ((b & mask) >>> 0);
}

const PRIVATE_V4 = [
  "0.0.0.0/8", // "this" network
  "10.0.0.0/8", // private
  "100.64.0.0/10", // carrier NAT
  "127.0.0.0/8", // loopback
  "169.254.0.0/16", // link-local (cloud metadata)
  "172.16.0.0/12", // private
  "192.0.0.0/24", // IETF protocol assignments
  "192.0.2.0/24", // TEST-NET-1
  "192.88.99.0/24", // 6to4 relay
  "192.168.0.0/16", // private
  "198.18.0.0/15", // benchmarking
  "198.51.100.0/24", // TEST-NET-2
  "203.0.113.0/24", // TEST-NET-3
  "224.0.0.0/4", // multicast
  "240.0.0.0/4", // reserved + broadcast
];

export function isPublicIPv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  if (n === null) return false;
  return !PRIVATE_V4.some((cidr) => inV4Range(n, cidr));
}

/** Expand an IPv6 textual address into 8 16-bit groups (null if malformed). */
function parseIPv6(ip: string): number[] | null {
  let addr = ip.trim().toLowerCase();
  const zone = addr.indexOf("%");
  if (zone !== -1) addr = addr.slice(0, zone);
  // Embedded IPv4 tail (::ffff:1.2.3.4)
  const v4Tail = addr.match(/^(.*:)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (v4Tail) {
    const v4 = ipv4ToInt(v4Tail[2]);
    if (v4 === null) return null;
    addr = `${v4Tail[1]}${((v4 >>> 16) & 0xffff).toString(16)}:${(v4 & 0xffff).toString(16)}`;
  }
  const halves = addr.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const fill = 8 - head.length - tail.length;
  if (halves.length === 2 ? fill < 1 : fill !== 0) return null;
  const groups = [...head, ...Array(halves.length === 2 ? fill : 0).fill("0"), ...tail];
  if (groups.length !== 8) return null;
  const out: number[] = [];
  for (const g of groups) {
    if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
    out.push(parseInt(g, 16));
  }
  return out;
}

export function isPublicIPv6(ip: string): boolean {
  const g = parseIPv6(ip);
  if (!g) return false;
  const allZero = g.every((x) => x === 0);
  if (allZero) return false; // ::
  if (g.slice(0, 7).every((x) => x === 0) && g[7] === 1) return false; // ::1
  // IPv4-mapped ::ffff:a.b.c.d and IPv4-compatible ::a.b.c.d
  if (g.slice(0, 5).every((x) => x === 0) && (g[5] === 0xffff || g[5] === 0)) {
    const v4 = `${g[6] >> 8}.${g[6] & 0xff}.${g[7] >> 8}.${g[7] & 0xff}`;
    return isPublicIPv4(v4);
  }
  // 64:ff9b::/96 NAT64 — treat embedded v4
  if (g[0] === 0x64 && g[1] === 0xff9b && g.slice(2, 6).every((x) => x === 0)) {
    const v4 = `${g[6] >> 8}.${g[6] & 0xff}.${g[7] >> 8}.${g[7] & 0xff}`;
    return isPublicIPv4(v4);
  }
  const first = g[0];
  if ((first & 0xfe00) === 0xfc00) return false; // fc00::/7 unique local
  if ((first & 0xffc0) === 0xfe80) return false; // fe80::/10 link-local
  if ((first & 0xffc0) === 0xfec0) return false; // fec0::/10 site-local (deprecated)
  if ((first & 0xff00) === 0xff00) return false; // ff00::/8 multicast
  if (first === 0x2001 && g[1] === 0x0db8) return false; // 2001:db8::/32 documentation
  if (first === 0x2001 && g[1] === 0) return false; // 2001::/32 Teredo
  if (first === 0x2002) return false; // 2002::/16 6to4 (embeds v4; be conservative)
  if (first === 0x0100 && g[1] === 0 && g[2] === 0 && g[3] === 0) return false; // 100::/64 discard
  return true;
}

export function isPublicIp(ip: string): boolean {
  const kind = isIP(ip);
  if (kind === 4) return isPublicIPv4(ip);
  if (kind === 6) return isPublicIPv6(ip);
  return false;
}

// ── URL / hostname checks ────────────────────────────────

/** Syntactic check only (no DNS): scheme, port, hostname shape and blocked names. */
export function isAllowedUrlShape(url: URL): { ok: true } | { ok: false; reason: string } {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, reason: "Only http and https URLs are allowed." };
  }
  if (url.username || url.password) return { ok: false, reason: "Credentials in URLs are not allowed." };
  if (url.port && url.port !== "80" && url.port !== "443") {
    return { ok: false, reason: "Only ports 80 and 443 are allowed." };
  }
  let host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!host) return { ok: false, reason: "Missing hostname." };
  if (host.startsWith("[") && host.endsWith("]")) host = host.slice(1, -1);
  if (isIP(host)) return { ok: false, reason: "IP-literal hosts are not allowed." };
  if (host === "localhost" || host.endsWith(".localhost")) {
    return { ok: false, reason: "localhost is not allowed." };
  }
  if (!host.includes(".")) return { ok: false, reason: "Single-label hostnames are not allowed." };
  const tld = host.slice(host.lastIndexOf(".") + 1);
  if (BLOCKED_TLDS.includes(tld)) return { ok: false, reason: `.${tld} hostnames are not allowed.` };
  if (!/^[a-z0-9.-]+$/.test(host) && !/^xn--/.test(host)) {
    // Allow IDNs via punycode; reject anything else exotic.
    try {
      const ascii = new URL(`http://${host}`).hostname;
      if (!/^[a-z0-9.-]+$/.test(ascii)) return { ok: false, reason: "Invalid hostname." };
    } catch {
      return { ok: false, reason: "Invalid hostname." };
    }
  }
  return { ok: true };
}

/**
 * Full guard: shape check + DNS resolution of every address (A and AAAA).
 * Returns the resolved public addresses so the caller can log them.
 */
export async function isSafePublicUrl(
  input: string | URL
): Promise<{ ok: true; url: URL; addresses: string[] } | { ok: false; reason: string }> {
  let url: URL;
  try {
    url = typeof input === "string" ? new URL(input) : input;
  } catch {
    return { ok: false, reason: "Invalid URL." };
  }
  const shape = isAllowedUrlShape(url);
  if (shape.ok === false) return shape;

  let records: { address: string; family: number }[];
  try {
    records = await lookup(url.hostname, { all: true, verbatim: true });
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    return { ok: false, reason: `DNS lookup failed${code ? ` (${code})` : ""}.` };
  }
  if (!records.length) return { ok: false, reason: "Hostname did not resolve." };
  for (const r of records) {
    if (!isPublicIp(r.address)) {
      return { ok: false, reason: `Hostname resolves to a non-public address (${r.address}).` };
    }
  }
  return { ok: true, url, addresses: records.map((r) => r.address) };
}

// ── Fetch ────────────────────────────────────────────────

async function readCapped(res: Response, cap: number): Promise<{ text: string; truncated: boolean }> {
  const body = res.body;
  if (!body) return { text: await res.text(), truncated: false };
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  let truncated = false;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      if (received + value.byteLength > cap) {
        chunks.push(value.subarray(0, cap - received));
        received = cap;
        truncated = true;
        break;
      }
      chunks.push(value);
      received += value.byteLength;
    }
  } finally {
    if (truncated) reader.cancel().catch(() => undefined);
    else reader.releaseLock();
  }
  const merged = new Uint8Array(received);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.byteLength;
  }
  return { text: new TextDecoder("utf-8", { fatal: false }).decode(merged), truncated };
}

/**
 * Fetch the HTML of a public web page. Never throws.
 */
export async function fetchSiteHtml(input: string): Promise<FetchSiteResult> {
  let current: string = (input || "").trim();
  if (!current) return { error: "No URL provided." };
  if (!/^https?:\/\//i.test(current)) current = `https://${current}`;

  const deadline = AbortSignal.timeout(FETCH_TIMEOUT_MS);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const guard = await isSafePublicUrl(current);
    if (guard.ok === false) return { error: `Blocked URL: ${guard.reason}` };
    const url = guard.url;

    let res: Response;
    try {
      res = await fetch(url.toString(), {
        method: "GET",
        redirect: "manual",
        signal: deadline,
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
          "Accept-Language": "en-US,en;q=0.9",
        },
        cache: "no-store",
      });
    } catch (err) {
      if (deadline.aborted) return { error: `Timed out after ${FETCH_TIMEOUT_MS / 1000}s fetching ${url.hostname}.` };
      const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      return { error: `Fetch failed for ${url.hostname} (${msg}).` };
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      res.body?.cancel().catch(() => undefined);
      if (!location) return { error: `Redirect (${res.status}) without a Location header.` };
      let nextUrl: URL;
      try {
        nextUrl = new URL(location, url);
      } catch {
        return { error: "Redirect to an invalid URL." };
      }
      if (hop === MAX_REDIRECTS) return { error: `Too many redirects (more than ${MAX_REDIRECTS}).` };
      current = nextUrl.toString();
      continue;
    }

    if (!res.ok) {
      res.body?.cancel().catch(() => undefined);
      return { error: `HTTP ${res.status} from ${url.hostname}.` };
    }

    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      res.body?.cancel().catch(() => undefined);
      return { error: `Not an HTML page (content-type: ${contentType || "unknown"}).` };
    }

    try {
      const { text } = await readCapped(res, MAX_HTML_BYTES);
      if (!text.trim()) return { error: "Empty HTML response." };
      return { finalUrl: url.toString(), html: text, contentType };
    } catch (err) {
      if (deadline.aborted) return { error: `Timed out after ${FETCH_TIMEOUT_MS / 1000}s reading ${url.hostname}.` };
      return { error: `Failed reading body (${err instanceof Error ? err.message : String(err)}).` };
    }
  }
  return { error: "Too many redirects." };
}
