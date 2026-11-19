'use client';

// ---------------------------------------------------------------------------
// /math — the "See the Math" deck.
//
// The deck itself (snapping, keys, fullscreen, the dot nav, the reading bar)
// is components/deck/DeckShell, shared with /pitch since 2026-11-19. This
// file is only what is /math's own: its slides, its PDF and the booking
// buttons (Rebook call, the pill from slide 2, the reading bar's row).
//
// The PDF (app/math/print) renders SLIDES directly and never mounts this,
// so nothing here can change the PDFs.
// ---------------------------------------------------------------------------
import React, { useMemo } from 'react';
import DeckShell from '@/components/deck/DeckShell';
import { SLIDES } from '@/components/math/slides';
import { PDF_NAME } from '@/components/math/pdf';
import { usePdfHref } from '@/components/math/pdf-link';

export default function MathDeck() {
  // The phone PDF on a phone, the slides anywhere else (components/math/pdf).
  const pdfHref = usePdfHref();
  const slides = useMemo(() => SLIDES.map(({ id, title, C }) => ({ id, title, node: <C /> })), []);
  return <DeckShell slides={slides} label="See the math" pdf={{ href: pdfHref, name: PDF_NAME }} booking />;
}
