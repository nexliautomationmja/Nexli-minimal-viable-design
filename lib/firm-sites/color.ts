/**
 * Tiny colour helpers for the firm-site template.
 * Pure functions only (no Node APIs) so they are safe to import from
 * middleware, server components and client components alike.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Parse #rgb / #rrggbb / rgb() / rgba() into channels. Returns null if unparseable. */
export function parseColor(input: string): Rgb | null {
  const value = input.trim();

  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }

  const rgb = value.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgb) {
    return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]) };
  }

  return null;
}

/** "r, g, b" string for use inside rgba(var(--x-rgb), a). */
export function toRgbChannels(color: string, fallback = '0, 0, 0'): string {
  const c = parseColor(color);
  return c ? `${c.r}, ${c.g}, ${c.b}` : fallback;
}

/** rgba() string built from any parseable colour. */
export function withAlpha(color: string, alpha: number): string {
  const c = parseColor(color);
  if (!c) return color;
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
}

function channelToLinear(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function luminance(color: string): number {
  const c = parseColor(color);
  if (!c) return 0;
  return 0.2126 * channelToLinear(c.r) + 0.7152 * channelToLinear(c.g) + 0.0722 * channelToLinear(c.b);
}

export function isDark(color: string): boolean {
  return luminance(color) < 0.4;
}

/** White or near-black, whichever reads better on the given background. */
export function contrastText(background: string, dark = '#0f172a', light = '#ffffff'): string {
  return isDark(background) ? light : dark;
}

function clamp(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

/** Mix a colour toward black (amount 0..1). */
export function darken(color: string, amount: number): string {
  const c = parseColor(color);
  if (!c) return color;
  const f = 1 - amount;
  return `rgb(${clamp(c.r * f)}, ${clamp(c.g * f)}, ${clamp(c.b * f)})`;
}

/** Mix a colour toward white (amount 0..1). */
export function lighten(color: string, amount: number): string {
  const c = parseColor(color);
  if (!c) return color;
  return `rgb(${clamp(c.r + (255 - c.r) * amount)}, ${clamp(c.g + (255 - c.g) * amount)}, ${clamp(
    c.b + (255 - c.b) * amount,
  )})`;
}
