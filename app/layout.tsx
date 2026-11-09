import type { Metadata } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import ThemeProvider from '../components/ThemeProvider';
import QualificationProvider from '../components/QualificationProvider';
import ConditionalNavbar from '../components/ConditionalNavbar';
import Footer from '../components/Footer';
import AttributionCapture from '../components/AttributionCapture';
import NexliEntitySchema from '../components/NexliEntitySchema';
import { SITE_NAME, SITE_URL, TWITTER_HANDLE } from '../lib/site';
import { CLIENT_VALUE_LINE } from '../lib/agency-offer';
import { OG_IMAGE } from '../lib/seo';
import './globals.css';

// Brand first: "Nexli" alone collides with Nexl (nexl.cloud) and Nexli
// (nexli.io) in search, and the full name is what tells them apart.
const DEFAULT_TITLE = 'Nexli Automation | CPA Firm Growth Agency for Tax Planning Clients';
const DEFAULT_DESCRIPTION = `Nexli Automation is a CPA firm growth agency. We build the Digital Rainmaker System and run ads to it, bringing established CPA firms ${CLIENT_VALUE_LINE}.`;

const gscToken = process.env.NEXT_PUBLIC_GSC_VERIFICATION;
// Bing Webmaster Tools ownership token for www.nexli.net (added 2026-11-09).
// Public by design: it is printed in the page source for Bing to read. The
// env var still wins if it is ever set; the default is here so verification
// does not depend on a Vercel setting. Do not remove it: Bing re-checks the
// tag, and the property drops out of Webmaster Tools if it disappears.
const bingToken = process.env.NEXT_PUBLIC_BING_VERIFICATION || 'B3E4428DBCFB8811B1CEFA37463A2C89';

export const metadata: Metadata = {
  title: {
    default: DEFAULT_TITLE,
    template: '%s',
  },
  description: DEFAULT_DESCRIPTION,
  keywords:
    'CPA firm growth agency, CPA firm marketing, accounting firm lead generation, tax advisory clients, CPA website design, AI automation for CPAs, Google reviews for accountants, Digital Rainmaker System',
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: 'index, follow',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  // No og:url here on purpose. A root og:url is inherited by every page
  // that sets no openGraph of its own, which made /portfolio samples of
  // fictional firms claim to be the homepage. The homepage sets its own via
  // socialMeta (lib/seo.ts); pages without one fall back to their canonical.
  openGraph: {
    type: 'website',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE],
    siteName: SITE_NAME,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE.url],
    site: TWITTER_HANDLE,
  },
  icons: {
    icon: '/logos/nexli-icon-gradient.png',
    apple: '/logos/nexli-icon-gradient.png',
  },
  ...(gscToken || bingToken
    ? {
        verification: {
          ...(gscToken ? { google: gscToken } : {}),
          ...(bingToken ? { other: { 'msvalidate.01': bingToken } } : {}),
        },
      }
    : {}),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Site-wide entity schema only. Page-specific schema (Service, Article, FAQPage) lives on each page.
            Omitted on client firm websites, which this app serves under their
            own domains and which must not claim to be Nexli. */}
        <NexliEntitySchema />
      </head>
      <body>
        {/* Meta Pixel */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID || '910151701422761'}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>

        <ThemeProvider>
          <QualificationProvider>
            <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
              {children}
              <ConditionalNavbar />
              <Footer />
            </div>
          </QualificationProvider>
        </ThemeProvider>

        <SpeedInsights />
        <Analytics />
        <AttributionCapture />

        {/* Meta Pixel Script — beforeInteractive so fbq stub is available for useEffect calls */}
        <Script id="meta-pixel" strategy="beforeInteractive">
          {`!function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID || '910151701422761'}');
          fbq('track', 'PageView');`}
        </Script>

        {/* Nexli Analytics */}
        <Script
          src="https://portal.nexli.net/t.js"
          data-client-id="481a4b0a-f225-46d8-b96f-537b0528533f"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
