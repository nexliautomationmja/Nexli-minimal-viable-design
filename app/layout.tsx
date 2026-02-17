import type { Metadata } from 'next';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import ThemeProvider from '../components/ThemeProvider';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'CPA Website Design & Automation | Nexli | Premium Websites for CPAs, RIAs & Financial Advisors',
    template: '%s',
  },
  description: 'Premium website design and AI automation for CPAs, accounting firms, RIAs, and financial advisors. We build high-converting websites that attract high-net-worth clients and automate your practice.',
  keywords: 'CPA website design, accounting firm website, CPA marketing, financial advisor website, RIA website design, CPA lead generation, accounting firm marketing, tax professional website, CPA automation, wealth management website',
  authors: [{ name: 'Nexli Automation' }],
  robots: 'index, follow',
  metadataBase: new URL('https://www.nexli.net'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.nexli.net/',
    title: 'CPA Website Design & Automation | Nexli | Premium Websites for CPAs & Financial Advisors',
    description: 'Premium website design and AI automation for CPAs, accounting firms, RIAs, and financial advisors. High-converting websites that attract high-net-worth clients.',
    images: [{ url: '/og-image.png' }],
    siteName: 'Nexli Automation',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CPA Website Design & Automation | Nexli | Premium Websites for CPAs & Financial Advisors',
    description: 'Premium website design and AI automation for CPAs, accounting firms, RIAs, and financial advisors. High-converting websites that attract high-net-worth clients.',
    images: ['/og-image.png'],
    site: '@nexliautomation',
  },
  icons: {
    icon: '/logos/nexli-icon-gradient.png',
    apple: '/logos/nexli-icon-gradient.png',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.nexli.net/#organization',
      name: 'Nexli Automation',
      url: 'https://www.nexli.net',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.nexli.net/logos/nexli-icon-gradient.png',
      },
      description: 'Premium website design and AI automation for CPAs, accounting firms, RIAs, and financial advisors.',
      email: 'mail@nexli.net',
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.nexli.net/#website',
      url: 'https://www.nexli.net',
      name: 'Nexli Automation',
      publisher: { '@id': 'https://www.nexli.net/#organization' },
      description: 'Premium website design and AI automation for CPAs, accounting firms, RIAs, and financial advisors.',
    },
    {
      '@type': 'ProfessionalService',
      '@id': 'https://www.nexli.net/#service',
      name: 'Nexli Automation',
      url: 'https://www.nexli.net',
      logo: 'https://www.nexli.net/logos/nexli-icon-gradient.png',
      image: 'https://www.nexli.net/og-image.png',
      description: 'We build premium websites and AI automation systems for CPAs, accounting firms, RIAs, and financial advisors that attract high-net-worth clients.',
      priceRange: '$$$',
      serviceType: [
        'CPA Website Design',
        'Accounting Firm Website Development',
        'Financial Advisor Website Design',
        'RIA Website Development',
        'AI Automation for CPAs',
        'Lead Generation for Accounting Firms',
        'CPA Marketing Services',
        'Tax Professional Website Design',
      ],
      areaServed: { '@type': 'Country', name: 'United States' },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Digital Rainmaker System',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Premium Website Design',
              description: 'Custom, conversion-optimized websites for CPAs and financial advisors that build trust and generate leads.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'AI Automation Layer',
              description: '24/7 lead capture, automated booking, missed-call text-back, and intelligent nurture sequences.',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Google Review Amplification',
              description: 'Systematically request and route reviews to build your online reputation.',
            },
          },
        ],
      },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://www.nexli.net/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What makes a good CPA website?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A good CPA website builds trust quickly through professional design, clear value propositions, social proof from client testimonials, mobile-responsive layouts, and strategic calls-to-action that convert visitors into consultations.',
          },
        },
        {
          '@type': 'Question',
          name: 'How can CPAs generate more leads online?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'CPAs can generate more leads through a combination of SEO-optimized websites, local search optimization, Google Business Profile management, content marketing, automated lead capture systems, and strategic review management.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the Digital Rainmaker System?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The Digital Rainmaker System is a three-part solution that combines a premium website, AI automation layer for 24/7 lead capture and follow-up, and a Google review amplification engine to systematically grow your CPA or financial advisory practice.',
          },
        },
      ],
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {/* Meta Pixel */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=910151701422761&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        <ThemeProvider>
          <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
            {children}
            <Navbar />
            <Footer />
          </div>
        </ThemeProvider>

        <SpeedInsights />
        <Analytics />

        {/* Meta Pixel Script */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '910151701422761');
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
