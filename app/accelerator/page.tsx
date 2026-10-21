// ---------------------------------------------------------------------------
// The Accelerator funnel, page 1 — the free offer. This is the ad
// destination.
//
// CRAWLABLE, unlike every other page in this funnel. It is a legitimate
// free-resource page for a CPA firm and there is no reason to hide it from
// search; the three pages behind it are in robots.ts DISALLOW.
//
// THIS FILE IS THE SERVER SHELL AND NOTHING ELSE. `export const metadata`
// needs a server component and framer-motion needs a client one, so the
// markup, the copy and the motion all live in ./landing-body. The hedges on
// the $60,000 are documented there, where the copy is.
//
// NOTHING HERE DESCRIBES THE METHOD — not the copy, and not the description
// below. That line is what Google and the AI answer engines quote, so a meta
// description naming the guide's steps republishes the product in the search
// results. It states the promise; the method is behind the download.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import { ACCELERATOR_TARGET } from '@/lib/advisory-config';
import { SITE_URL } from '@/lib/site';
import AcceleratorLandingBody from './landing-body';

const usd = (n: number) => `$${n.toLocaleString('en-US')}`;

export const metadata: Metadata = {
  title: 'The Book of Business Accelerator | Free for CPA firms | Nexli',
  description: `A free playbook for CPA firms: how to pull up to ${usd(
    ACCELERATOR_TARGET,
  )} out of the book of business you already have. No ads, no funnel, no system to buy.`,
  alternates: { canonical: `${SITE_URL}/accelerator` },
};

export default function AcceleratorLandingPage() {
  return <AcceleratorLandingBody />;
}
