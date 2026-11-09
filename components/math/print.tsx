'use client';

// ---------------------------------------------------------------------------
// Print mode: true inside /math/print, the page the PDF is made from (see
// scripts/build-math-pdf.mjs). The slides are the deck's own components, so
// the PDF matches the deck by construction; this flag only changes what a
// piece of paper cannot do:
//
//   everything is drawn in its final state: no reveals, no bars growing, no
//   two-step chart story (Reveal and useSeen in ./ui, CoverChart)
//   nothing to click: the scenario toggles and the download buttons go, and
//   where a toggle hid a choice, the page shows all of it instead (the
//   year-two slide lists all three scenarios)
//   "How this is figured" on break-even is printed open
// ---------------------------------------------------------------------------
import { createContext, useContext } from 'react';

export const PrintContext = createContext(false);

export const usePrint = () => useContext(PrintContext);
