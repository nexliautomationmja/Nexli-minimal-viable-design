'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Don't show navbar on funnel pages (covers all /vslfunnel* variants)
  if (
    pathname === '/revenuecalc' ||
    pathname === '/booking-confirmed' ||
    pathname === '/qualify' ||
    pathname === '/thank-you' ||
    pathname.startsWith('/vslfunnel')
  ) {
    return null;
  }

  return <Navbar />;
}
