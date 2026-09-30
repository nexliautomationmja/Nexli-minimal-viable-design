'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { cn } from '../lib/utils';
import { formatCurrency } from '../lib/profit-calc';

// ---------------------------------------------------------------------------
// Animated number: tweens from the currently displayed value to each new target.
//
// Lifted out of ProfitCalculator.tsx, which still uses it — one copy, two
// callers. The only addition is the optional viewport gate below.
// ---------------------------------------------------------------------------

export function useAnimatedValue(target: number, duration = 600): number {
  const [value, setValue] = useState(0);
  const displayed = useRef(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    const from = displayed.current;
    const delta = target - from;
    if (delta === 0) return;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      displayed.current = from + delta * eased;
      setValue(displayed.current);
      if (progress < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        displayed.current = target;
        setValue(target);
        raf.current = null;
      }
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration]);

  return value;
}

export interface AnimatedNumberProps {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  /**
   * Hold at 0 until the number is actually on screen, then count up.
   *
   * The hook starts from 0 on mount with no viewport check of its own, so a
   * counter placed below the fold finishes animating before anyone scrolls to
   * it and reads as a plain static number. Every counter outside the first
   * screen wants this; ProfitCalculator's own tiles are above the fold and
   * respond to user input, so they leave it off.
   */
  animateOnView?: boolean;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  format = formatCurrency,
  duration,
  className,
  style,
  animateOnView = false,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const target = animateOnView && !inView ? 0 : value;
  const v = useAnimatedValue(target, duration);
  return (
    <span ref={ref} className={cn('tabular-nums', className)} style={style}>
      {format(v)}
    </span>
  );
};

export default AnimatedNumber;
