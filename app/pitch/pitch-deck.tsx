'use client';

// ---------------------------------------------------------------------------
// /pitch — the Agency Pitch Deck (Marcel, 2026-11-19).
//
// The deck Marcel screen-shares on a sales call: what Nexli builds and runs,
// in the order a tax-planning client meets it. Same shell as /math
// (components/deck/DeckShell), so it presents the same way: snapping, arrow
// keys, F for fullscreen, the dot nav. No booking buttons (he is already on
// the call) and no PDF.
// ---------------------------------------------------------------------------
import React from 'react';
import DeckShell from '@/components/deck/DeckShell';
import { PITCH_SLIDES } from '@/components/pitch/slides';

export default function PitchDeck() {
  return <DeckShell slides={PITCH_SLIDES} label="Agency pitch deck" />;
}
