'use client';
import React, { useState } from 'react';
import { Dock, DockIcon } from './Dock';
import { EMAIL, SOCIAL_PROFILES, type SOCIAL } from '../lib/site';

// ---------------------------------------------------------------------------
// The footer's social icons. One per profile in lib/site.ts SOCIAL that has
// a URL: Instagram, Facebook and X today, and LinkedIn and YouTube as soon as
// their URLs are filled in there. Every one links rel="me", which is how
// search engines and AI assistants tie a social account to nexli.net. This
// used to show Instagram alone, from a hard-coded URL, with no rel="me".
// ---------------------------------------------------------------------------

type IconProps = React.SVGAttributes<SVGElement>;
type ProfileKey = keyof typeof SOCIAL;

const Icons = {
  instagram: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
        fill="currentColor"
      />
    </svg>
  ),
  facebook: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.4H7.6V14h2.8v8h3.1z"
        fill="currentColor"
      />
    </svg>
  ),
  x: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
        fill="currentColor"
      />
    </svg>
  ),
  linkedin: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"
        fill="currentColor"
      />
    </svg>
  ),
  youtube: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M9 7.2v9.6l8-4.8-8-4.8z" fill="currentColor" />
    </svg>
  ),
  mail: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M22 6l-10 7L2 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  check: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M20 6L9 17L4 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

/** Each network's own colour, as a filled circle behind a white mark. */
const BRAND: Record<ProfileKey, { background: string; glow: string }> = {
  instagram: {
    background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
    glow: 'rgba(214, 36, 159, 0.4)',
  },
  facebook: { background: '#1877F2', glow: 'rgba(24, 119, 242, 0.4)' },
  x: { background: '#0f1419', glow: 'rgba(15, 20, 25, 0.35)' },
  linkedin: { background: '#0A66C2', glow: 'rgba(10, 102, 194, 0.4)' },
  youtube: { background: '#FF0000', glow: 'rgba(255, 0, 0, 0.35)' },
};

const SocialDock: React.FC = () => {
  const [emailCopied, setEmailCopied] = useState(false);

  const handleEmailClick = () => {
    navigator.clipboard.writeText(EMAIL);
    window.location.href = `mailto:${EMAIL}`;
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <Dock iconMagnification={60} iconDistance={100}>
      {SOCIAL_PROFILES.map((p) => {
        const Icon = Icons[p.key];
        const brand = BRAND[p.key];
        return (
          <DockIcon key={p.key} href={p.url} label={`Nexli Automation on ${p.name}`} me>
            <div
              className="w-full h-full rounded-full flex items-center justify-center p-2 relative overflow-hidden"
              style={{
                background: brand.background,
                boxShadow: `0 4px 12px ${brand.glow}, inset 0 1px 1px rgba(255,255,255,0.2)`,
              }}
            >
              <Icon
                className="w-5 h-5 text-white relative z-10"
                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}
                aria-hidden="true"
              />
            </div>
          </DockIcon>
        );
      })}

      {/* Mail - Blue gradient, copies email + opens mailto */}
      <DockIcon onClick={handleEmailClick} label={`Email ${EMAIL}`}>
        <div
          className="w-full h-full rounded-full flex items-center justify-center p-2 relative overflow-hidden transition-all duration-300"
          style={{
            background: emailCopied
              ? 'linear-gradient(135deg, #22c55e, #16a34a)'
              : 'linear-gradient(135deg, #2563EB, #06B6D4)',
            boxShadow: emailCopied
              ? '0 4px 12px rgba(34,197,94,0.4), inset 0 1px 1px rgba(255,255,255,0.2)'
              : '0 4px 12px rgba(37,99,235,0.4), inset 0 1px 1px rgba(255,255,255,0.2)'
          }}
        >
          {emailCopied
            ? <Icons.check className="w-5 h-5 text-white relative z-10" aria-hidden="true" />
            : <Icons.mail className="w-5 h-5 text-white relative z-10" aria-hidden="true" />
          }
        </div>
      </DockIcon>
    </Dock>
  );
};

export default SocialDock;
