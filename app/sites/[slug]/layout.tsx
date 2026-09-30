import React from 'react';

/**
 * Minimal layout for Firm Foundation client sites.
 *
 * Nexli's marketing chrome is suppressed for this route tree:
 * components/ConditionalNavbar.tsx and components/Footer.tsx both return null
 * for pathnames under /sites. The root layout (fonts, theme provider, pixel
 * scripts) still wraps this tree because Next.js does not allow opting out of
 * the root layout without a route-group restructure. Each firm site sets its
 * own background, colours and fonts on its wrapper, so the Nexli theme
 * variables never show through.
 */
export default function FirmSiteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
