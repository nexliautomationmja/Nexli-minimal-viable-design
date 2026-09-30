'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Don't show navbar on funnel pages (covers all /vslfunnel* variants
  // and the whole /demo-opt-in -> /demo demo funnel)
  if (
    pathname === '/revenuecalc' ||
    pathname === '/booking-confirmed' ||
    pathname === '/qualify' ||
    pathname === '/thank-you' ||
    pathname === '/profit-calculator' ||
    pathname === '/demo-opt-in' ||
    pathname.startsWith('/vslfunnel') ||
    pathname.startsWith('/sites') ||
    // The demo funnel: /demo itself and every step under it. Written as an
    // exact match plus a '/demo/' prefix so a future route that merely starts
    // with the letters (e.g. /demo-reel) keeps its navbar.
    pathname === '/demo' ||
    pathname.startsWith('/demo/')
  ) {
    return null;
  }

  return <Navbar />;
}
