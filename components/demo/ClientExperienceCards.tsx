'use client';

import React from 'react';
import { FileSignature, FolderUp, Receipt } from 'lucide-react';
import TransformationCards, { type TransformationCard } from '@/components/TransformationCards';

// ---------------------------------------------------------------------------
// The "what a client actually experiences" cards on /demo-opt-in.
//
// This lives in its own client component for one specific reason: the card
// data carries `Icon` values, which are functions. /demo-opt-in is a server
// component (it exports `metadata`), and functions cannot cross the
// server/client boundary as props — passing this array from the page threw
// "Functions cannot be passed directly to Client Components" at runtime.
// Defining it on the client side of the boundary keeps the page a server
// component and the icons where they can be serialised.
// ---------------------------------------------------------------------------

// The three moments a client actually lives through, in the same interactive
// treatment as the Digital Rainmaker cards on /demo/call — glow tile, shimmer
// badge, tap to expand. One Rainmaker colour each.
const EXPERIENCE: TransformationCard[] = [
  {
    Icon: Receipt,
    accent: '#60a5fa',
    tileBg: '#0a1628',
    glowRgba: 'rgba(96, 165, 250, 0.5)',
    conicStops: '#60a5fa, #3b82f6, #60a5fa',
    starClass: 'text-blue-400 fill-blue-400',
    labelClass: 'text-blue-300',
    badge: 'Paid in a click',
    title: 'They pay you without being chased',
    body: 'An invoice lands, opens on their phone and gets paid from the portal. No posted cheque, no third reminder email from your admin.',
    details: [
      'Card and bank payment inside the portal',
      'Every invoice shows sent, opened or paid',
      'Reminders go out on their own',
    ],
  },
  {
    Icon: FileSignature,
    accent: '#06B6D4',
    tileBg: '#0a2832',
    glowRgba: 'rgba(6, 182, 212, 0.5)',
    conicStops: '#06B6D4, #3B82F6, #8B5CF6, #06B6D4',
    starClass: 'text-cyan-400 fill-cyan-400',
    labelClass: 'text-cyan-300',
    badge: 'Signed same day',
    title: 'The engagement letter comes back signed',
    body: 'Scope, terms and fee in one document they sign on their phone. The work starts the day they say yes, not the week after.',
    details: [
      'E-signature, no printing or scanning',
      'Draft, sent and signed tracked in one list',
      'Countersigned copy filed automatically',
    ],
  },
  {
    Icon: FolderUp,
    accent: '#a78bfa',
    tileBg: '#1a0a28',
    glowRgba: 'rgba(167, 139, 250, 0.5)',
    conicStops: '#a78bfa, #8b5cf6, #a78bfa',
    starClass: 'text-purple-400 fill-purple-400',
    labelClass: 'text-purple-300',
    badge: 'Nothing chased twice',
    title: 'Their documents arrive without the email thread',
    body: 'A request list with a status on every line. They see what is outstanding, you see what has landed, and nothing lives in an inbox.',
    details: [
      'Each request marked outstanding or received',
      'Secure upload from any device',
      'Your team stops re-asking for the same file',
    ],
  },
];

const ClientExperienceCards: React.FC = () => (
  <TransformationCards cards={EXPERIENCE} expandable columns={3} />
);

export default ClientExperienceCards;
