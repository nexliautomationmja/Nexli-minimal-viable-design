import React from 'react';
import type { FirmSiteConfig } from '../../lib/firm-sites/types';
import { contrastText, darken, isDark, lighten, parseColor, toRgbChannels, withAlpha } from '../../lib/firm-sites/color';
import { googleFontsHref } from '../../lib/firm-sites/fonts';

/**
 * Wraps a firm site, exposing the config's colours and fonts as CSS custom
 * properties so every section renders any brand from the same markup.
 *
 * Theme model: `cfg.colors` is the LIGHT palette and the optional
 * `cfg.darkColors` the DARK one. Both are emitted as `--fs-*` variable blocks
 * scoped by `.firm-site[data-theme="light" | "dark"]`, so switching theme is a
 * single attribute flip (see ThemeToggle.tsx) with no re-render. When
 * `darkColors` is absent only the light block exists and no toggle renders.
 *
 * Variable scheme (all prefixed --fs-):
 *   --fs-primary / --fs-primary-rgb / --fs-primary-dark / --fs-primary-deep / --fs-on-primary
 *   --fs-accent  / --fs-accent-rgb  / --fs-on-accent
 *   --fs-bg / --fs-bg-rgb, --fs-surface, --fs-surface-raised, --fs-text / --fs-text-rgb,
 *   --fs-text-muted, --fs-border, --fs-glow, --fs-pill-bg
 *   --fs-font-heading, --fs-font-body (on the root, theme independent)
 */
type Palette = FirmSiteConfig['colors'];

/** Alpha channel of an rgba() string, 1 for anything else. */
function alphaOf(color: string): number {
  const m = color.trim().match(/^rgba?\([^)]*?,\s*([\d.]+)\s*\)$/i);
  if (!m) return 1;
  const a = Number(m[1]);
  return Number.isFinite(a) ? Math.min(1, Math.max(0, a)) : 1;
}

/** A slightly "higher" surface: more alpha for translucent surfaces, more lightness otherwise. */
function raise(surface: string, background: string): string {
  const alpha = alphaOf(surface);
  if (alpha < 1) {
    const c = parseColor(surface);
    if (c) return `rgba(${c.r}, ${c.g}, ${c.b}, ${Math.min(1, alpha + 0.04).toFixed(3)})`;
    return surface;
  }
  return isDark(background) ? lighten(surface, 0.06) : lighten(surface, 0.6);
}

export function paletteVars(colors: Palette): Record<string, string> {
  return {
    '--fs-primary': colors.primary,
    '--fs-primary-rgb': toRgbChannels(colors.primary),
    '--fs-primary-dark': darken(colors.primary, 0.25),
    '--fs-primary-deep': darken(colors.primary, 0.5),
    '--fs-on-primary': contrastText(colors.primary),
    '--fs-accent': colors.accent,
    '--fs-accent-rgb': toRgbChannels(colors.accent),
    '--fs-on-accent': contrastText(colors.accent),
    '--fs-bg': colors.background,
    '--fs-bg-rgb': toRgbChannels(colors.background, isDark(colors.background) ? '10, 15, 28' : '255, 255, 255'),
    '--fs-surface': colors.surface,
    '--fs-surface-raised': raise(colors.surface, colors.background),
    '--fs-text': colors.text,
    '--fs-text-rgb': toRgbChannels(colors.text),
    '--fs-text-muted': colors.textMuted,
    '--fs-border': colors.border,
    '--fs-glow': withAlpha(colors.accent, 0.08),
    '--fs-pill-bg': withAlpha(colors.background, isDark(colors.background) ? 0.85 : 0.92),
  };
}

/**
 * Inline-style form of the default palette (kept for callers that render a
 * fragment of a firm site outside FirmSiteShell).
 */
export function firmSiteCssVars(cfg: FirmSiteConfig): React.CSSProperties {
  const palette = resolveDefaultTheme(cfg) === 'dark' && cfg.darkColors ? cfg.darkColors : cfg.colors;
  return {
    ...paletteVars(palette),
    '--fs-font-heading': cfg.fonts.heading,
    '--fs-font-body': cfg.fonts.body,
  } as React.CSSProperties;
}

/** 'light' when the site has a single palette, else the configured default (dark). */
export function resolveDefaultTheme(cfg: FirmSiteConfig): 'dark' | 'light' {
  if (!cfg.darkColors) return 'light';
  return cfg.theme === 'light' ? 'light' : 'dark';
}

function declarations(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([k, v]) => `${k}: ${v};`)
    .join(' ');
}

/** Per-site <style> block: fonts on the root, one palette block per theme. */
function themeCss(cfg: FirmSiteConfig): string {
  const light = declarations(paletteVars(cfg.colors));
  const fonts = declarations({ '--fs-font-heading': cfg.fonts.heading, '--fs-font-body': cfg.fonts.body });
  let css = `.firm-site { ${fonts} ${light} }\n.firm-site[data-theme="light"] { ${light} }`;
  if (cfg.darkColors) {
    css += `\n.firm-site[data-theme="dark"] { ${declarations(paletteVars(cfg.darkColors))} }`;
  }
  return css;
}

const BASE_CSS = `
.firm-site {
  font-family: var(--fs-font-body);
  background: var(--fs-bg);
  color: var(--fs-text);
  letter-spacing: 0;
  -webkit-font-smoothing: antialiased;
  overflow-x: clip;
  min-height: 100vh;
  transition: background-color 0.3s ease, color 0.3s ease;
}
.firm-site h1, .firm-site h2, .firm-site h3, .firm-site h4 {
  font-family: var(--fs-font-heading);
  color: inherit;
  letter-spacing: -0.02em;
  font-weight: 600;
}
.firm-site h1 { line-height: 1.05; }
.firm-site h2 { line-height: 1.12; }
.firm-site h3 { line-height: 1.25; }
/* Nexli's globals.css sets p { color: var(--text-muted) }; restore inheritance so sections control colour. */
.firm-site p { margin: 0; color: inherit; }
/* :where() keeps this at element specificity so .fs-btn-* colours still win. */
:where(.firm-site) a { color: inherit; text-decoration: none; }
.firm-site :where(a, button):focus-visible {
  outline: 2px solid var(--fs-accent);
  outline-offset: 3px;
  border-radius: 4px;
}
.fs-container {
  width: 100%;
  max-width: 72rem;
  margin-inline: auto;
  padding-inline: 16px;
}
@media (min-width: 640px) { .fs-container { padding-inline: 24px; } }
@media (min-width: 1024px) { .fs-container { padding-inline: 32px; } }

.fs-eyebrow {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--fs-accent);
}
.fs-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.9375rem;
  line-height: 1;
  border: 1px solid transparent;
  transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
  cursor: pointer;
  white-space: nowrap;
}
.fs-btn:hover { transform: translateY(-1px); }
.fs-btn:active { transform: translateY(0) scale(0.98); }
.fs-btn-accent {
  background: var(--fs-accent);
  color: var(--fs-on-accent);
  box-shadow: 0 10px 30px -12px rgba(var(--fs-accent-rgb), 0.7);
}
.fs-btn-accent:hover { box-shadow: 0 14px 34px -12px rgba(var(--fs-accent-rgb), 0.85); }
.fs-btn-primary {
  background: var(--fs-primary);
  color: var(--fs-on-primary);
}
.fs-btn-primary:hover { background: var(--fs-primary-dark); }
.fs-btn-outline {
  background: transparent;
  color: var(--fs-text);
  border-color: var(--fs-border);
}
.fs-btn-outline:hover { border-color: var(--fs-accent); background: rgba(var(--fs-accent-rgb), 0.08); }
.fs-btn-outline-light {
  background: rgba(255, 255, 255, 0.06);
  color: var(--fs-on-primary);
  border-color: rgba(255, 255, 255, 0.3);
}
.fs-btn-outline-light:hover { background: rgba(255, 255, 255, 0.14); border-color: rgba(255, 255, 255, 0.6); }

.fs-card {
  background: var(--fs-surface);
  border: 1px solid var(--fs-border);
  border-radius: 1.25rem;
}
/* Gradient text utility (Nexli blue -> cyan by default; sites may override the stops). */
.fs-gradient-text {
  background-image: linear-gradient(90deg, var(--fs-gradient-from, #60a5fa), var(--fs-gradient-to, #22d3ee));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}

/* Theme toggle (mounted by FirmNav when the config has darkColors). */
.fs-theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  border: 1px solid var(--fs-toggle-border, var(--fs-border));
  background: var(--fs-toggle-bg, transparent);
  color: inherit;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}
.fs-theme-toggle:hover { background: rgba(var(--fs-accent-rgb), 0.14); border-color: var(--fs-accent); }
.fs-theme-toggle:active { transform: scale(0.94); }
.fs-theme-toggle .fs-icon-sun, .fs-theme-toggle .fs-icon-moon { display: none; }
.firm-site[data-theme="dark"] .fs-theme-toggle .fs-icon-sun { display: block; }
.firm-site[data-theme="light"] .fs-theme-toggle .fs-icon-moon { display: block; }

/* ------------------------------------------------------------------------
 * style: "glass" — the Nexli marketing look. Canvas hero with an ambient
 * glow, translucent blurred cards, shimmer-pill eyebrows, heavy tight display
 * headings. Everything keys off the --fs-* vars so it works in both themes.
 * ---------------------------------------------------------------------- */
.firm-site[data-style="glass"] h1,
.firm-site[data-style="glass"] h2,
.firm-site[data-style="glass"] h3 {
  font-weight: 800;
  letter-spacing: -0.03em;
}
.firm-site[data-style="glass"] .fs-card {
  background: var(--fs-surface);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
}
.firm-site[data-style="glass"] .fs-btn-primary,
.firm-site[data-style="glass"] .fs-btn-accent {
  font-weight: 700;
  box-shadow: 0 10px 30px -10px rgba(var(--fs-primary-rgb), 0.55);
}
/* Hero on the canvas (Hero.tsx reads these with gradient fallbacks). */
.firm-site[data-style="glass"] #top {
  --fs-hero-bg: var(--fs-bg);
  --fs-hero-text: var(--fs-text);
  --fs-hero-muted: var(--fs-text-muted);
  --fs-hero-faint: rgba(var(--fs-text-rgb), 0.55);
  --fs-hero-card-bg: var(--fs-surface);
  --fs-hero-card-border: var(--fs-border);
  --fs-hero-rule: var(--fs-border);
  --fs-hero-grid: rgba(var(--fs-text-rgb), 0.5);
}
.firm-site[data-style="glass"] #top::before {
  content: "";
  position: absolute;
  left: 50%;
  top: -10%;
  width: min(1100px, 120vw);
  height: 70%;
  transform: translateX(-50%);
  background: radial-gradient(ellipse at center, var(--fs-glow) 0%, rgba(var(--fs-primary-rgb), 0.08) 35%, transparent 70%);
  filter: blur(120px);
  pointer-events: none;
  z-index: 0;
}
.firm-site[data-style="glass"] #top .fs-btn-outline-light {
  background: rgba(var(--fs-text-rgb), 0.04);
  color: var(--fs-text);
  border-color: var(--fs-border);
}
.firm-site[data-style="glass"] #top .fs-btn-outline-light:hover {
  background: rgba(var(--fs-text-rgb), 0.08);
  border-color: rgba(var(--fs-text-rgb), 0.3);
}
/* Eyebrow -> shimmer pill (rotating conic border, canvas-coloured inner pill). */
.firm-site[data-style="glass"] .fs-eyebrow {
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  overflow: hidden;
  font-size: 0.6875rem;
  font-weight: 900;
  letter-spacing: 0.2em;
  color: var(--fs-text);
}
.firm-site[data-style="glass"] .fs-eyebrow::before {
  content: "";
  position: absolute;
  /* A square larger than the pill's diagonal, so the rotating gradient never leaves gaps on wide pills. */
  left: 50%;
  top: 50%;
  width: 220%;
  aspect-ratio: 1 / 1;
  z-index: -2;
  background: conic-gradient(from 90deg at 50% 50%, var(--fs-primary) 0%, var(--fs-accent) 25%, var(--fs-primary) 50%, var(--fs-accent) 75%, var(--fs-primary) 100%);
  animation: fs-shimmer 3s linear infinite;
}
.firm-site[data-style="glass"] .fs-eyebrow::after {
  content: "";
  position: absolute;
  inset: 1.5px;
  z-index: -1;
  border-radius: 999px;
  background: var(--fs-pill-bg);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}
@keyframes fs-shimmer {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
/* ------------------------------------------------------------------------
 * style: "solid" — the editorial/private-client look. Serif display, deep
 * primary hero and footer, hairline rules, gold used as a precious accent.
 * ---------------------------------------------------------------------- */
.firm-site[data-style="solid"] h1,
.firm-site[data-style="solid"] h2,
.firm-site[data-style="solid"] h3 {
  font-weight: 500;
  letter-spacing: -0.012em;
}
.firm-site[data-style="solid"] h1 { line-height: 1.06; }
.firm-site[data-style="solid"] h2 { line-height: 1.14; }
.firm-site[data-style="solid"] .fs-eyebrow {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.22em;
}
/* Hairline rules, less shadow. */
.firm-site[data-style="solid"] .fs-card {
  border-radius: 0.75rem;
  border-color: var(--fs-border);
  box-shadow: none;
}
.firm-site[data-style="solid"] .fs-btn { border-radius: 2px; padding: 0.9375rem 1.75rem; font-weight: 600; }
.firm-site[data-style="solid"] .fs-btn:hover { transform: none; }
.firm-site[data-style="solid"] .fs-btn-accent { box-shadow: none; }
.firm-site[data-style="solid"] .fs-btn-accent:hover { background: var(--fs-accent); filter: brightness(1.06); box-shadow: none; }
/* The nav and footer always sit on the primary; force on-primary ink there
   so the theme toggle does not go near-black on deep green in light mode. */
/* Stat numerals: the deep primary is too dim on the dark canvas (~3.7:1).
   Gold is on-brand and far more legible. Light keeps the green — gold on the
   warm off-white would be ~2.4:1. */
.firm-site[data-style="solid"][data-theme="dark"] { --fs-stat-ink: var(--fs-accent); }
.firm-site[data-style="solid"] header .fs-theme-toggle {
  color: var(--fs-on-primary);
  --fs-toggle-border: rgba(255, 255, 255, 0.22);
}
.firm-site[data-style="solid"] header .fs-theme-toggle:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.45);
}
/*
 * The root layout renders Nexli's <ConditionalNavbar/> and <Footer/> as
 * siblings after the page. Those hide themselves by pathname under /sites, but
 * when middleware rewrites a custom domain (firm.com/ -> /sites/<slug>) the
 * browser pathname is "/" and they would render. .firm-site is a direct child
 * of the root wrapper, so hide every later sibling. Server-rendered, no flash.
 */
.firm-site ~ * { display: none !important; }
/*
 * Logos pulled from a firm's current site: dark artwork disappears on the dark
 * theme and light artwork on the light theme, so give it a contrasting backing.
 */
.fs-logo { display: block; object-fit: contain; }
.firm-site[data-theme="dark"] .fs-logo--dark-ink {
  background: #ffffff;
  border-radius: 0.5rem;
  padding: 0.25rem 0.5rem;
  box-sizing: content-box;
}
.firm-site[data-theme="light"] .fs-logo--light-ink {
  background: #0f172a;
  border-radius: 0.5rem;
  padding: 0.25rem 0.5rem;
  box-sizing: content-box;
}
@media (prefers-reduced-motion: reduce) {
  .firm-site * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
`;

interface FirmSiteShellProps {
  cfg: FirmSiteConfig;
  children: React.ReactNode;
}

export default function FirmSiteShell({ cfg, children }: FirmSiteShellProps) {
  const fontsHref = googleFontsHref(cfg.fonts);
  const theme = resolveDefaultTheme(cfg);

  return (
    <div
      className="firm-site"
      data-firm-site={cfg.slug}
      data-theme={theme}
      data-style={cfg.style}
      data-themed={cfg.darkColors ? 'true' : undefined}
    >
      {fontsHref && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={fontsHref} />
        </>
      )}
      <style dangerouslySetInnerHTML={{ __html: themeCss(cfg) + BASE_CSS }} />
      {children}
    </div>
  );
}
