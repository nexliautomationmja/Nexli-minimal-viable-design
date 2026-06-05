'use client';

// ---------------------------------------------------------------------------
// Attribution data types
// ---------------------------------------------------------------------------
export interface AttributionData {
  fbclid: string | null;
  fbp: string | null;
  fbc: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  landing_page: string | null;
  referrer: string | null;
  captured_at: string | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const COOKIE_NAME = '_nexli_attr';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds
const LS_KEY = 'nexli_attribution';

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------
function setCookie(name: string, value: string, maxAge: number): void {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${maxAge};SameSite=Lax;Secure`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// ---------------------------------------------------------------------------
// FBP / FBC helpers
// ---------------------------------------------------------------------------

/** Read _fbp cookie set by Meta Pixel */
function getFbp(): string | null {
  return getCookie('_fbp');
}

/**
 * Generate fbc value from fbclid per Meta spec:
 * fb.1.{creation_time_ms}.{fbclid}
 */
function generateFbc(fbclid: string): string {
  return `fb.1.${Date.now()}.${fbclid}`;
}

// ---------------------------------------------------------------------------
// URL parameter helper
// ---------------------------------------------------------------------------
function getParam(params: URLSearchParams, name: string): string | null {
  return params.get(name) || null;
}

// ---------------------------------------------------------------------------
// Core: captureAttribution()
// ---------------------------------------------------------------------------
/**
 * Capture attribution data from URL parameters and browser context.
 * Persists to first-party cookie (30 days) and localStorage.
 *
 * Behavior:
 * - If attribution already exists and no new fbclid is present, preserves
 *   existing data (first-touch attribution).
 * - If a new fbclid is detected, overwrites everything (new ad click).
 */
export function captureAttribution(): AttributionData {
  const params = new URLSearchParams(window.location.search);
  const newFbclid = getParam(params, 'fbclid');

  // Check for existing attribution
  const existing = getAttribution();

  // If we have existing attribution and no new fbclid, keep first-touch
  if (existing && !newFbclid) {
    // Still update fbp in case Meta Pixel set it after our initial capture
    const fbp = getFbp();
    if (fbp && fbp !== existing.fbp) {
      existing.fbp = fbp;
      persist(existing);
    }
    return existing;
  }

  const fbp = getFbp();
  const fbc = newFbclid
    ? generateFbc(newFbclid)
    : getCookie('_fbc') || existing?.fbc || null;

  const data: AttributionData = {
    fbclid: newFbclid || existing?.fbclid || null,
    fbp: fbp || existing?.fbp || null,
    fbc,
    utm_source: getParam(params, 'utm_source') || existing?.utm_source || null,
    utm_medium: getParam(params, 'utm_medium') || existing?.utm_medium || null,
    utm_campaign: getParam(params, 'utm_campaign') || existing?.utm_campaign || null,
    utm_content: getParam(params, 'utm_content') || existing?.utm_content || null,
    utm_term: getParam(params, 'utm_term') || existing?.utm_term || null,
    landing_page: newFbclid
      ? window.location.href
      : existing?.landing_page || window.location.href,
    referrer: newFbclid
      ? document.referrer || null
      : existing?.referrer || document.referrer || null,
    captured_at: newFbclid
      ? new Date().toISOString()
      : existing?.captured_at || new Date().toISOString(),
  };

  persist(data);
  return data;
}

// ---------------------------------------------------------------------------
// Core: getAttribution()
// ---------------------------------------------------------------------------
/**
 * Read stored attribution data. Cookie is primary, localStorage is fallback.
 */
export function getAttribution(): AttributionData | null {
  if (typeof window === 'undefined') return null;

  // Try cookie first
  const cookieVal = getCookie(COOKIE_NAME);
  if (cookieVal) {
    try {
      return JSON.parse(cookieVal) as AttributionData;
    } catch {
      // Corrupted cookie, fall through to localStorage
    }
  }

  // Fallback to localStorage
  try {
    const lsVal = localStorage.getItem(LS_KEY);
    if (lsVal) {
      const data = JSON.parse(lsVal) as AttributionData;
      // Restore cookie from localStorage
      setCookie(COOKIE_NAME, lsVal, COOKIE_MAX_AGE);
      return data;
    }
  } catch {
    // localStorage unavailable or corrupted
  }

  return null;
}

// ---------------------------------------------------------------------------
// Internal: persist to both stores
// ---------------------------------------------------------------------------
function persist(data: AttributionData): void {
  const json = JSON.stringify(data);
  setCookie(COOKIE_NAME, json, COOKIE_MAX_AGE);
  try {
    localStorage.setItem(LS_KEY, json);
  } catch {
    // localStorage full or unavailable
  }
}
