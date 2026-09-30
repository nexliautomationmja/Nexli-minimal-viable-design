/**
 * Derive a Google Fonts stylesheet URL from the CSS font stacks in a config.
 * The first named family in each stack is loaded unless it is a system font.
 */
const SYSTEM_FAMILIES = new Set(
  [
    'system-ui',
    '-apple-system',
    'blinkmacsystemfont',
    'segoe ui',
    'roboto',
    'helvetica',
    'helvetica neue',
    'arial',
    'georgia',
    'times new roman',
    'times',
    'serif',
    'sans-serif',
    'monospace',
    'ui-serif',
    'ui-sans-serif',
    'ui-monospace',
    'ui-rounded',
    'cursive',
    'fantasy',
  ].map((f) => f.toLowerCase()),
);

export function firstFamily(stack: string): string | null {
  const first = stack.split(',')[0]?.trim().replace(/^['"]|['"]$/g, '');
  if (!first) return null;
  if (SYSTEM_FAMILIES.has(first.toLowerCase())) return null;
  return first;
}

/**
 * Weights to request per family. Google Fonts drops weights a family does
 * not ship (and 400s when none match), so families known to carry heavy cuts
 * get 800/900 — the Nexli-look headings (Syne 800) depend on this — and
 * everything else keeps the safe 400–700 set.
 */
const BASE_WEIGHTS = [400, 500, 600, 700];
const HEAVY_WEIGHTS: Record<string, number[]> = {
  syne: [400, 500, 600, 700, 800],
  outfit: [400, 500, 600, 700, 800, 900],
  inter: [400, 500, 600, 700, 800, 900],
  'plus jakarta sans': [400, 500, 600, 700, 800],
  fraunces: [400, 500, 600, 700, 800, 900],
  manrope: [400, 500, 600, 700, 800],
  poppins: [400, 500, 600, 700, 800, 900],
  montserrat: [400, 500, 600, 700, 800, 900],
  'dm sans': [400, 500, 600, 700, 800, 900],
  'space grotesk': [400, 500, 600, 700],
  sora: [400, 500, 600, 700, 800],
  'playfair display': [400, 500, 600, 700, 800, 900],
  lora: [400, 500, 600, 700],
  'libre baskerville': [400, 700],
  'cormorant garamond': [400, 500, 600, 700],
  'source serif 4': [400, 500, 600, 700, 800, 900],
  'work sans': [400, 500, 600, 700, 800, 900],
  nunito: [400, 500, 600, 700, 800, 900],
  raleway: [400, 500, 600, 700, 800, 900],
  lato: [400, 700, 900],
  'open sans': [400, 500, 600, 700, 800],
  merriweather: [400, 700, 900],
};

export function weightsFor(family: string): number[] {
  return HEAVY_WEIGHTS[family.toLowerCase()] ?? BASE_WEIGHTS;
}

export function googleFontsHref(fonts: { heading: string; body: string }): string | null {
  const families = Array.from(
    new Set([firstFamily(fonts.heading), firstFamily(fonts.body)].filter((f): f is string => !!f)),
  );
  if (families.length === 0) return null;

  const params = families
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@${weightsFor(f).join(';')}`)
    .join('&');
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}
