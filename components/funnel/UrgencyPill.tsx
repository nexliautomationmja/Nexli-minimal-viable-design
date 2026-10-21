'use client';

// ---------------------------------------------------------------------------
// The capacity badge, pinned top-right.
//
// Lifted out of VslFunnel, where it was a private component with the number
// written into the JSX. A second page needs it now (/accelerator/next), and
// the alternatives were both bad: importing it from VslFunnel drags a
// 1,900-line module into that page's bundle for one pill, and copying it
// leaves two scarcity claims that drift the moment one is edited.
//
// Behaviour is unchanged from the original: three seconds before it appears,
// then a slow opacity breath. The delay is the point — it arrives after the
// page has been read rather than greeting someone who has not yet been told
// what the offer is.
//
// The number lives in lib/agency-offer, with a note about keeping it true.
// ---------------------------------------------------------------------------

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AGENCY_FIRM_SPOTS } from '@/lib/agency-offer';

export interface UrgencyPillProps {
  /**
   * Drop it below a DeadlineBanner. The banner is a full-width in-flow bar
   * at the top of the page, so anything fixed at top-6 lands on top of it.
   * The matching logo offset is the same pair of values.
   */
  belowBanner?: boolean;
  /** Defaults to AGENCY_FIRM_SPOTS. Pass only to say something different. */
  spots?: number;
}

const UrgencyPill: React.FC<UrgencyPillProps> = ({
  belowBanner = false,
  spots = AGENCY_FIRM_SPOTS,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className={`fixed right-6 md:right-8 z-[110] ${
            belowBanner ? 'top-[4.5rem] md:top-[5.25rem]' : 'top-6 md:top-8'
          }`}
        >
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full border backdrop-blur-md shadow-lg"
            style={{
              backgroundColor: 'rgba(239,68,68,0.12)',
              borderColor: 'rgba(239,68,68,0.3)',
              boxShadow: '0 4px 20px rgba(239,68,68,0.15)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-bold text-red-400 tracking-wide uppercase">
              {spots} firm spot{spots === 1 ? '' : 's'} left
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UrgencyPill;
