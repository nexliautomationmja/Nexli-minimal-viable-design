'use client';
import React from 'react';
import type { FirmSiteConfig } from '../../lib/firm-sites/types';
import FirmSiteShell from './FirmSiteShell';
import FirmNav from './FirmNav';
import Hero from './Hero';
import Stats from './Stats';
import Services from './Services';
import PortalPreview from './PortalPreview';
import About from './About';
import Testimonials from './Testimonials';
import CTA from './CTA';
import Footer from './Footer';

/**
 * Full Firm Foundation site, composed from a single FirmSiteConfig.
 * Section order mirrors the portfolio demos: Hero, trust bar, services,
 * portal preview, about, testimonials, CTA, footer.
 */
export default function FirmSitePage({ cfg }: { cfg: FirmSiteConfig }) {
  return (
    <FirmSiteShell cfg={cfg}>
      <FirmNav cfg={cfg} />
      <main>
        <Hero cfg={cfg} />
        <Stats cfg={cfg} />
        <Services cfg={cfg} />
        <PortalPreview cfg={cfg} />
        <About cfg={cfg} />
        <Testimonials cfg={cfg} />
        <CTA cfg={cfg} />
      </main>
      <Footer cfg={cfg} />
    </FirmSiteShell>
  );
}
