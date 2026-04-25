'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Don't show navbar on revenue calculator page
  if (pathname === '/revenuecalc') {
    return null;
  }

  return <Navbar />;
}
