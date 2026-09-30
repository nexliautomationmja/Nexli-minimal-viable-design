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
 * Logo clean-up for generated previews.
 *
 * Firms usually publish their logo as a flat JPG/PNG on a white (or solid)
 * background, which looks like a sticker on the dark Nexli canvas. This module
 * fetches the logo (SSRF-guarded), knocks out a uniform background with a
 * flood fill from the edges, trims the transparent margin, and returns a PNG
 * data URL plus an "ink" hint (dark / light / mixed) so the site can put a
 * contrasting backing behind dark logos on the dark theme.
 *
 * Server-only. Never throws: returns null when the logo cannot be processed
 * so the caller keeps the original URL.
 */
import sharp from "sharp";
import { isSafePublicUrl, MAX_REDIRECTS } from "./fetch-site";

export type LogoInk = "dark" | "light" | "mixed";

export interface ProcessedLogo {
  /** PNG (or SVG) data URL, transparent background when one was detected. */
  dataUrl: string;
  ink: LogoInk;
  width: number;
  height: number;
  /** True when a solid background was removed. */
  transparentized: boolean;
  notes: string;
}

const FETCH_TIMEOUT_MS = 6_000;
const MAX_IMAGE_BYTES = 3_000_000;
const MAX_WIDTH = 480;
/** Per-channel distance to the border colour that still counts as background. */
const SEED_TOLERANCE = 28;
/** Slightly wider tolerance while flooding, to eat anti-aliased edges. */
const FILL_TOLERANCE = 44;
/** The border must be this uniform before we treat it as a background. */
const MIN_BORDER_UNIFORMITY = 0.85;
const MAX_DATA_URL_BYTES = 450_000;

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

async function fetchImage(input: string): Promise<{ bytes: Buffer; contentType: string } | { error: string }> {
  let current = (input || "").trim();
  if (!current) return { error: "No logo URL." };
  if (current.startsWith("//")) current = `https:${current}`;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const guard = await isSafePublicUrl(current);
    if (guard.ok === false) return { error: guard.reason };
    let res: Response;
    try {
      res = await fetch(guard.url, {
        redirect: "manual",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { "user-agent": USER_AGENT, accept: "image/*,*/*;q=0.5" },
      });
    } catch (err) {
      return { error: `Logo fetch failed (${(err as Error)?.name || "error"}).` };
    }
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) return { error: "Redirect without location." };
      current = new URL(loc, guard.url).toString();
      continue;
    }
    if (!res.ok) return { error: `Logo responded ${res.status}.` };
    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    const len = Number(res.headers.get("content-length") || 0);
    if (len > MAX_IMAGE_BYTES) return { error: "Logo too large." };
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > MAX_IMAGE_BYTES) return { error: "Logo too large." };
    // Many servers omit or mislabel the type; trust the bytes first.
    const sniffed = sniffImageType(buf);
    if (!sniffed && !contentType.startsWith("image/")) return { error: `Not an image (${contentType || "unknown"}).` };
    return { bytes: buf, contentType: sniffed || contentType };
  }
  return { error: "Too many redirects." };
}

/** Detect common image formats from their magic bytes. */
function sniffImageType(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (buf.subarray(0, 6).toString("ascii") === "GIF87a" || buf.subarray(0, 6).toString("ascii") === "GIF89a") return "image/gif";
  if (buf.subarray(4, 12).toString("ascii").includes("ftyp")) return "image/avif";
  if (looksLikeSvg(buf)) return "image/svg+xml";
  return null;
}

function looksLikeSvg(buf: Buffer): boolean {
  const head = buf.subarray(0, 512).toString("utf8").trimStart().toLowerCase();
  return head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"));
}

/**
 * Ink hint from the opaque pixels. Only near-black/gray artwork counts as
 * "dark" and near-white as "light": colourful logos (teal, red, navy-with-
 * accent) already read on either canvas and get no backing.
 */
function classifyInk(rgba: Uint8Array, channels: number): LogoInk {
  let lumSum = 0;
  let satSum = 0;
  let n = 0;
  for (let i = 0; i < rgba.length; i += channels) {
    const a = channels === 4 ? rgba[i + 3] : 255;
    if (a < 128) continue;
    const r = rgba[i] / 255;
    const g = rgba[i + 1] / 255;
    const b = rgba[i + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    lumSum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
    satSum += max === 0 ? 0 : (max - min) / max;
    n++;
  }
  if (!n) return "mixed";
  const lum = lumSum / n;
  const sat = satSum / n;
  if (lum < 0.3 && sat < 0.35) return "dark";
  if (lum > 0.8 && sat < 0.25) return "light";
  return "mixed";
}

interface Raw {
  data: Buffer;
  width: number;
  height: number;
}

/**
 * Flood-fill transparent from every border pixel that matches the dominant
 * border colour. Returns the modified RGBA buffer and whether anything changed.
 */
function knockOutBackground(raw: Raw): { data: Buffer; changed: boolean; reason: string } {
  const { data, width, height } = raw;
  const px = (x: number, y: number) => (y * width + x) * 4;

  // 1. Is the border already transparent? Then nothing to do.
  let borderCount = 0;
  let transparentBorder = 0;
  const border: number[] = [];
  for (let x = 0; x < width; x++) border.push(px(x, 0), px(x, height - 1));
  for (let y = 1; y < height - 1; y++) border.push(px(0, y), px(width - 1, y));
  for (const i of border) {
    borderCount++;
    if (data[i + 3] < 24) transparentBorder++;
  }
  if (borderCount && transparentBorder / borderCount > 0.5) {
    return { data, changed: false, reason: "already transparent" };
  }

  // 2. Dominant border colour (median per channel of opaque border pixels).
  const rs: number[] = [];
  const gs: number[] = [];
  const bs: number[] = [];
  for (const i of border) {
    if (data[i + 3] < 24) continue;
    rs.push(data[i]);
    gs.push(data[i + 1]);
    bs.push(data[i + 2]);
  }
  if (!rs.length) return { data, changed: false, reason: "no opaque border" };
  const median = (arr: number[]) => {
    const s = [...arr].sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)];
  };
  const seed = [median(rs), median(gs), median(bs)];
  const near = (i: number, tol: number) =>
    Math.abs(data[i] - seed[0]) <= tol && Math.abs(data[i + 1] - seed[1]) <= tol && Math.abs(data[i + 2] - seed[2]) <= tol;

  let uniform = 0;
  for (const i of border) if (data[i + 3] < 24 || near(i, SEED_TOLERANCE)) uniform++;
  const uniformity = uniform / borderCount;
  if (uniformity < MIN_BORDER_UNIFORMITY) {
    return { data, changed: false, reason: `border not uniform (${Math.round(uniformity * 100)}%)` };
  }

  // 3. Flood fill from the border.
  const visited = new Uint8Array(width * height);
  const stack: number[] = [];
  const push = (x: number, y: number) => {
    const idx = y * width + x;
    if (visited[idx]) return;
    visited[idx] = 1;
    if (near(idx * 4, FILL_TOLERANCE)) stack.push(idx);
  };
  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }
  let cleared = 0;
  while (stack.length) {
    const idx = stack.pop()!;
    const i = idx * 4;
    // Soften pixels that are close but not identical (anti-aliased edge).
    const d = Math.max(Math.abs(data[i] - seed[0]), Math.abs(data[i + 1] - seed[1]), Math.abs(data[i + 2] - seed[2]));
    data[i + 3] = d <= SEED_TOLERANCE ? 0 : Math.round((d / FILL_TOLERANCE) * 255 * 0.6);
    cleared++;
    const x = idx % width;
    const y = (idx - x) / width;
    if (x > 0) {
      const n = idx - 1;
      if (!visited[n]) {
        visited[n] = 1;
        if (near(n * 4, FILL_TOLERANCE)) stack.push(n);
      }
    }
    if (x < width - 1) {
      const n = idx + 1;
      if (!visited[n]) {
        visited[n] = 1;
        if (near(n * 4, FILL_TOLERANCE)) stack.push(n);
      }
    }
    if (y > 0) {
      const n = idx - width;
      if (!visited[n]) {
        visited[n] = 1;
        if (near(n * 4, FILL_TOLERANCE)) stack.push(n);
      }
    }
    if (y < height - 1) {
      const n = idx + width;
      if (!visited[n]) {
        visited[n] = 1;
        if (near(n * 4, FILL_TOLERANCE)) stack.push(n);
      }
    }
  }
  // Refuse if we wiped (almost) the whole image: probably a solid-colour logo.
  if (cleared > width * height * 0.97) return { data, changed: false, reason: "fill covered the whole image" };
  return { data, changed: true, reason: `removed ${Math.round((cleared / (width * height)) * 100)}% background` };
}

/**
 * Fetch and clean a logo. Returns null when it cannot be processed.
 */
export async function processLogo(url: string): Promise<ProcessedLogo | null> {
  const fetched = await fetchImage(url);
  if ("error" in fetched) {
    console.warn(`[site-preview logo] ${fetched.error} (${url})`);
    return null;
  }

  // SVGs are already resolution-independent and usually transparent.
  if (fetched.contentType.includes("svg") || looksLikeSvg(fetched.bytes)) {
    const svg = fetched.bytes.toString("utf8");
    if (svg.length > MAX_DATA_URL_BYTES) return null;
    let ink: LogoInk = "mixed";
    try {
      const raw = await sharp(fetched.bytes, { density: 96 })
        .resize({ width: 240, withoutEnlargement: true })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      ink = classifyInk(new Uint8Array(raw.data), raw.info.channels);
    } catch {
      /* keep mixed */
    }
    return {
      dataUrl: `data:image/svg+xml;base64,${fetched.bytes.toString("base64")}`,
      ink,
      width: 0,
      height: 0,
      transparentized: false,
      notes: "svg passed through",
    };
  }

  try {
    const base = sharp(fetched.bytes, { animated: false }).rotate();
    const meta = await base.metadata();
    if (!meta.width || !meta.height) return null;

    const raw = await base
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const { width, height } = raw.info;
    const knocked = knockOutBackground({ data: Buffer.from(raw.data), width, height });

    let out = sharp(knocked.data, { raw: { width, height, channels: 4 } }).png({ compressionLevel: 9, palette: false });
    if (knocked.changed) out = out.trim({ threshold: 10 });
    let png = await out.toBuffer();
    let finalMeta = await sharp(png).metadata();

    // Keep the stored config small.
    if (png.byteLength > MAX_DATA_URL_BYTES) {
      png = await sharp(png).resize({ width: 320, withoutEnlargement: true }).png({ compressionLevel: 9 }).toBuffer();
      finalMeta = await sharp(png).metadata();
    }
    if (png.byteLength > MAX_DATA_URL_BYTES) return null;

    const finalRaw = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const ink = classifyInk(new Uint8Array(finalRaw.data), finalRaw.info.channels);

    return {
      dataUrl: `data:image/png;base64,${png.toString("base64")}`,
      ink,
      width: finalMeta.width ?? width,
      height: finalMeta.height ?? height,
      transparentized: knocked.changed,
      notes: knocked.reason,
    };
  } catch (err) {
    console.warn(`[site-preview logo] processing failed: ${(err as Error)?.message || err}`);
    return null;
  }
}
