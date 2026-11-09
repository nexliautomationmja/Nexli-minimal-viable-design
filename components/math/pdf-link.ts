'use client';

// The PDF this visitor's download buttons hand out: the phone version on a
// phone, the 16:9 slides anywhere else (isPhone in lib/device).
//
// Decided after mount, because the server cannot know: the first render is
// the slides for everyone, so hydration is unchanged, and a phone switches
// to its file a moment later, long before anyone taps.
import { useEffect, useState } from 'react';
import { isPhone } from '@/lib/device';
import { PDF_HREF, PDF_PHONE_HREF } from './pdf';

export function usePdfHref(): string {
  const [href, setHref] = useState(PDF_HREF);
  useEffect(() => {
    const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } };
    const phone = isPhone({ userAgent: nav.userAgent, mobileHint: nav.userAgentData?.mobile ?? null });
    setHref(phone ? PDF_PHONE_HREF : PDF_HREF);
  }, []);
  return href;
}
