'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Don't show navbar on funnel pages
  if (pathname === '/revenuecalc' || pathname === '/booking-confirmed' || pathname === '/vslfunnel' || pathname === '/vslfunnel-ads' || pathname === '/vslfunnel-techstack' || pathname === '/vslfunnel-admin' || pathname === '/qualify' || pathname === '/thank-you') {
    return null;
  }

  return <Navbar />;
}
