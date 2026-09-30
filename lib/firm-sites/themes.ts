/**
 * Nexli-look palettes for Firm Foundation sites. Plain data, edge-safe.
 *
 * A generated site carries BOTH palettes: `colors` is the light palette and
 * `darkColors` the dark one; `theme` picks the default. The firm's own accent
 * (pulled from their current site) replaces `accent` when it has enough
 * contrast; `primary` stays Nexli blue so buttons and the nav read as one system.
 */
import type { FirmSiteConfig } from './types';

export type FirmSiteColors = FirmSiteConfig['colors'];

/** Nexli marketing-site dark look (#0a0f1c canvas, white text, blue/cyan accents). */
export const NEXLI_DARK: FirmSiteColors = {
  primary: '#2563eb',
  accent: '#06b6d4',
  background: '#0a0f1c',
  surface: 'rgba(255, 255, 255, 0.04)',
  text: '#ffffff',
  textMuted: 'rgba(255, 255, 255, 0.7)',
  border: 'rgba(255, 255, 255, 0.1)',
};

/** Same structure on a light canvas for firms whose clients prefer it. */
export const NEXLI_LIGHT: FirmSiteColors = {
  primary: '#2563eb',
  accent: '#0891b2',
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#0f172a',
  textMuted: 'rgba(15, 23, 42, 0.7)',
  border: 'rgba(15, 23, 42, 0.1)',
};

/**
 * Font stacks that match the marketing site: Outfit everywhere, bold and
 * tightly tracked for headings (the homepage hero), regular for body copy.
 */
export const NEXLI_FONTS: FirmSiteConfig['fonts'] = {
  heading: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
  body: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
};

export const NEXLI_STYLE: FirmSiteConfig['style'] = 'glass';
