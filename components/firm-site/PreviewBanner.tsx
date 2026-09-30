import React from 'react';

const BANNER_HEIGHT = '2rem';

export type PreviewBannerVariant = 'draft' | 'preview';

const VARIANTS: Record<PreviewBannerVariant, { text: string; background: string; color: string; border: string }> = {
  // Dashboard draft of a real client site, opened with ?preview=<token>.
  draft: {
    text: 'Draft preview — not public. Changes you see here are not live.',
    background: 'rgba(245, 158, 11, 0.92)',
    color: '#1f1300',
    border: '1px solid rgba(120, 53, 15, 0.35)',
  },
  // Firm Foundation prospect preview at /sites/preview/<token>.
  preview: {
    text: 'Preview of your new website — not live yet',
    background: 'rgba(37, 99, 235, 0.94)',
    color: '#ffffff',
    border: '1px solid rgba(30, 64, 175, 0.5)',
  },
};

/**
 * Strip shown above a firm site that is not (yet) public. The firm nav is
 * `position: fixed; top: 0`, so the banner claims the top 2rem and nudges the
 * nav (and the page content, which already reserves room for the nav) down by
 * the same amount.
 */
export default function PreviewBanner({ variant = 'draft' }: { variant?: PreviewBannerVariant }) {
  const v = VARIANTS[variant];
  return (
    <>
      <style>{`
        .firm-site { padding-top: ${BANNER_HEIGHT}; }
        .firm-site header { top: ${BANNER_HEIGHT}; }
      `}</style>
      <div
        role="status"
        className="fixed top-0 left-0 right-0 z-[120] flex items-center justify-center px-4 text-center"
        style={{
          height: BANNER_HEIGHT,
          background: v.background,
          color: v.color,
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.01em',
          borderBottom: v.border,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {v.text}
      </div>
    </>
  );
}
