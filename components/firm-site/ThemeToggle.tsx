'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export type FirmSiteTheme = 'dark' | 'light';

/** Messages exchanged with a parent window when the site is iframed (same origin). */
export const THEME_MESSAGE_OUT = 'firm-site-theme'; // iframe -> parent: { type, theme }
export const THEME_MESSAGE_IN = 'set-firm-site-theme'; // parent -> iframe: { type, theme }

export function isFirmSiteTheme(v: unknown): v is FirmSiteTheme {
  return v === 'dark' || v === 'light';
}

function storageKey(slug: string): string {
  return `firm-site-theme:${slug}`;
}

function findRoot(from: HTMLElement | null): HTMLElement | null {
  return (from?.closest('.firm-site') as HTMLElement | null) ?? (document.querySelector('.firm-site') as HTMLElement | null);
}

function inIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function notifyParent(theme: FirmSiteTheme) {
  if (!inIframe()) return;
  try {
    window.parent.postMessage({ type: THEME_MESSAGE_OUT, theme }, window.location.origin);
  } catch {
    /* cross-origin parent: nothing to do */
  }
}

/**
 * Sun/moon button that flips `data-theme` on the nearest `.firm-site`.
 * Resolution order on first load: `?theme=` in the URL, then the value saved
 * in localStorage, then whatever the server rendered. Inside an iframe it
 * reports every change to the parent and accepts `set-firm-site-theme`
 * messages so the Firm Foundation preview page can drive it without reload.
 */
export default function ThemeToggle({ slug, className = '' }: { slug: string; className?: string }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [theme, setThemeState] = useState<FirmSiteTheme | null>(null);

  const apply = useCallback(
    (next: FirmSiteTheme, opts: { persist?: boolean } = {}) => {
      const root = findRoot(btnRef.current);
      if (root) root.setAttribute('data-theme', next);
      setThemeState(next);
      if (opts.persist !== false) {
        try {
          window.localStorage.setItem(storageKey(slug), next);
        } catch {
          /* private mode / blocked storage */
        }
      }
      notifyParent(next);
    },
    [slug],
  );

  // First load: URL param > stored preference > server default.
  useEffect(() => {
    const root = findRoot(btnRef.current);
    const current = root?.getAttribute('data-theme');
    let next: FirmSiteTheme | null = null;

    try {
      const fromUrl = new URLSearchParams(window.location.search).get('theme');
      if (isFirmSiteTheme(fromUrl)) next = fromUrl;
    } catch {
      /* ignore */
    }
    if (!next) {
      try {
        const stored = window.localStorage.getItem(storageKey(slug));
        if (isFirmSiteTheme(stored)) next = stored;
      } catch {
        /* ignore */
      }
    }

    if (next && next !== current) {
      apply(next, { persist: false });
    } else {
      const resolved = isFirmSiteTheme(current) ? current : 'light';
      setThemeState(resolved);
      notifyParent(resolved);
    }
  }, [slug, apply]);

  // Parent window can switch the theme (preview page segmented control).
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; theme?: unknown } | null;
      if (!data || data.type !== THEME_MESSAGE_IN || !isFirmSiteTheme(data.theme)) return;
      apply(data.theme);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [apply]);

  const toggle = () => {
    const root = findRoot(btnRef.current);
    const current = root?.getAttribute('data-theme');
    apply(current === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={toggle}
      className={`fs-theme-toggle ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      aria-pressed={isDark}
    >
      {/* Both icons render; CSS shows the one matching .firm-site[data-theme] so there is no hydration flash. */}
      <Sun size={16} aria-hidden="true" className="fs-icon-sun" />
      <Moon size={16} aria-hidden="true" className="fs-icon-moon" />
    </button>
  );
}
