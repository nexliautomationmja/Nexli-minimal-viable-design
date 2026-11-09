import React from 'react';

/**
 * Minimal layout for Firm Foundation client sites.
 *
 * Nexli's marketing chrome is suppressed for this route tree:
 * components/ConditionalNavbar.tsx, components/Footer.tsx and
 * components/NexliEntitySchema.tsx all return null when the rendered route is
 * under /sites — by route segment (lib/use-is-firm-site.ts), not pathname,
 * because on a firm's own domain the pathname is "/". The root layout (fonts, theme provider, pixel
 * scripts) still wraps this tree because Next.js does not allow opting out of
 * the root layout without a route-group restructure. Each firm site sets its
 * own background, colours and fonts on its wrapper, so the Nexli theme
 * variables never show through.
 */
export default function FirmSiteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
