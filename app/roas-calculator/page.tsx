// ---------------------------------------------------------------------------
// /roas-calculator — a free tool and lead magnet for firm owners.
//
// A copy of the ROAS calculator spreadsheet Marcel was given (B2C, B2B and
// its Benchmarks tab), in Nexli's visual language. The math lives in
// lib/roas-calc.ts and follows the sheet, not Nexli's own benchmarks.
//
// Public and indexed, unlike /tax-planning-tool: it is meant to be found.
// The site navbar and footer are suppressed in ConditionalNavbar and Footer,
// same as /revenuecalc: one page, one job.
// ---------------------------------------------------------------------------
import type { Metadata, Viewport } from 'next';
import { socialMeta } from '@/lib/seo';
import RoasCalculator from './roas-client';

const TITLE = 'Free ROAS Calculator for B2B and B2C Ads | Nexli';
const DESCRIPTION =
  'See where your ad numbers need to be. Enter your daily budget and offer price, adjust cost per lead, cost per booked call, show-up and close rates, and compare best, average and worst case ROAS against benchmarks.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/roas-calculator' },
  ...socialMeta({ title: TITLE, description: DESCRIPTION, path: '/roas-calculator' }),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#020617',
};

export default function RoasCalculatorPage() {
  return <RoasCalculator />;
}
