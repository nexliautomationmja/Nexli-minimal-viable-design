import type { Metadata } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import ThemeProvider from '../components/ThemeProvider';
import QualificationProvider from '../components/QualificationProvider';
import ConditionalNavbar from '../components/ConditionalNavbar';
import Footer from '../components/Footer';
import AttributionCapture from '../components/AttributionCapture';
import JsonLd from '../components/JsonLd';
import { organizationSchema, websiteSchema } from '../lib/schema';
import { SITE_NAME, SITE_URL, TWITTER_HANDLE } from '../lib/site';
import './globals.css';

const DEFAULT_TITLE = 'CPA Firm Growth Agency | Digital Rainmaker System | Nexli';
const DEFAULT_DESCRIPTION =
  'Nexli is a CPA firm growth agency. We build the Digital Rainmaker System and run ads to it so established CPA firms land high-value tax advisory clients.';

const gscToken = process.env.NEXT_PUBLIC_GSC_VERIFICATION;
const bingToken = process.env.NEXT_PUBLIC_BING_VERIFICATION;

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
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/`,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: '/og-image.png' }],
    siteName: SITE_NAME,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ['/og-image.png'],
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
        {/* Site-wide entity schema only. Page-specific schema (Service, Article, FAQPage) lives on each page. */}
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
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
