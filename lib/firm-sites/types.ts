import type { FirmBrandConfig } from '../../components/portfolio/firmBrandConfigs';
import { contrastText, withAlpha } from './color';

/**
 * Everything needed to render one Firm Foundation client site.
 * One object per firm lives in data/firm-sites/<slug>.ts and is registered
 * in lib/firm-sites/registry.ts. Keep this plain data (no functions, no JSX)
 * so it can be passed from server to client components and imported by
 * middleware.
 */
export interface FirmSiteConfig {
  /** URL segment under /sites/<slug>. Lowercase, hyphenated. */
  slug: string;
  /** Apex custom domain (no protocol, no www). Enables host-based routing. */
  domain?: string;
  firmName: string;
  /** Short positioning line shown as the hero eyebrow and in the footer. */
  tagline: string;
  heroHeadline: string;
  heroSub: string;
  /**
   * `src` may be a URL or a data: URL (previews store a cleaned PNG inline).
   * `ink` says whether the artwork is dark, light or mixed so the site can add
   * a contrasting backing behind it on the opposite theme.
   */
  logo?: { src: string; alt: string; width?: number; ink?: 'dark' | 'light' | 'mixed' };
  colors: {
    /** Brand colour. Hero gradient, primary buttons, nav background. */
    primary: string;
    /** Highlight colour. Icons, eyebrows, focus rings, hover states. */
    accent: string;
    /** Page background. */
    background: string;
    /** Card / raised surface colour. */
    surface: string;
    /** Body text on background/surface. */
    text: string;
    textMuted: string;
    border: string;
  };
  /**
   * Optional second palette. When present the site can switch themes at
   * runtime: `colors` is the light palette, `darkColors` the dark one, and
   * `theme` selects the default. Sites without `darkColors` have no toggle.
   */
  darkColors?: FirmSiteConfig['colors'];
  theme?: 'dark' | 'light';
  fonts: {
    /** Full CSS font-family stack, e.g. "'Fraunces', Georgia, serif". The first named family is loaded from Google Fonts if it is not a system font. */
    heading: string;
    body: string;
  };
  /** Navbar treatment, matches the portfolio FirmNavbar styles. */
  style: 'glass' | 'solid' | 'minimal';
  services: { title: string; description: string; icon?: string }[];
  about: { heading: string; body: string; highlights?: string[] };
  team?: { name: string; role: string; photo?: string; bio?: string }[];
  testimonials?: { quote: string; name: string; detail?: string }[];
  stats?: { value: string; label: string }[];
  /** Cal.com / Calendly style scheduling link. */
  bookingUrl: string;
  /** Branded client portal login. */
  portalUrl: string;
  contact: { phone?: string; email?: string; address?: string; hours?: string };
  seo: { title: string; description: string; ogImage?: string };
  social?: { linkedin?: string; facebook?: string; google?: string };
}

/** In-page anchors used by the nav, hero and footer. */
export const FIRM_SITE_SECTIONS = {
  services: 'services',
  portal: 'portal',
  about: 'about',
  contact: 'contact',
} as const;

/**
 * Adapter so the existing portfolio FirmNavbar (and the firm-site nav, which
 * shares its visual language) can render from a FirmSiteConfig.
 */
export function toFirmBrandConfig(cfg: FirmSiteConfig): FirmBrandConfig {
  const { colors, fonts, style } = cfg;

  const navOnPrimary = style !== 'minimal';
  const navBg =
    style === 'glass'
      ? withAlpha(colors.primary, 0.92)
      : style === 'solid'
        ? colors.primary
        : colors.background;
  const text = navOnPrimary ? contrastText(colors.primary) : colors.text;
  const textMuted = navOnPrimary ? withAlpha(text, 0.65) : colors.textMuted;
  const border = navOnPrimary ? withAlpha(text, 0.15) : colors.border;

  return {
    firmName: cfg.firmName,
    colors: {
      navBg,
      text,
      textMuted,
      accent: colors.accent,
      border,
    },
    fonts: { heading: fonts.heading, body: fonts.body },
    navLinks: ['Services', 'Client Portal', 'About', 'Contact'],
    style,
  };
}
