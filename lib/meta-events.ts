'use client';

import { getAttribution, type AttributionData } from './attribution';

// ---------------------------------------------------------------------------
// Event ID generation for deduplication between browser Pixel and server CAPI
// ---------------------------------------------------------------------------
export function generateEventId(): string {
  return `${Date.now()}.${Math.random().toString(36).substring(2, 11)}`;
}

// ---------------------------------------------------------------------------
// Meta standard events — use fbq('track', ...) for these
// Custom events must use fbq('trackCustom', ...)
// ---------------------------------------------------------------------------
const STANDARD_EVENTS = new Set([
  'AddPaymentInfo', 'AddToCart', 'AddToWishlist', 'CompleteRegistration',
  'Contact', 'CustomizeProduct', 'Donate', 'FindLocation', 'InitiateCheckout',
  'Lead', 'Purchase', 'Schedule', 'Search', 'StartTrial', 'SubmitApplication',
  'Subscribe', 'ViewContent',
]);

// ---------------------------------------------------------------------------
// Fire a Meta Pixel event with event_id for deduplication
// ---------------------------------------------------------------------------
export function trackMetaEvent(
  eventName: string,
  params: Record<string, unknown> = {},
  eventId?: string
): string {
  const id = eventId || generateEventId();

  if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
    const method = STANDARD_EVENTS.has(eventName) ? 'track' : 'trackCustom';
    (window as any).fbq(method, eventName, params, { eventID: id });

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Meta Pixel] ${method}('${eventName}') — eventID: ${id}`);
    }
  } else if (process.env.NODE_ENV === 'development') {
    console.warn(`[Meta Pixel] fbq not available — skipped ${eventName}`);
  }

  return id;
}

// ---------------------------------------------------------------------------
// Convenience: fire Lead event and return eventId + attribution for server
// ---------------------------------------------------------------------------
export function trackLeadEvent(contentName: string): {
  eventId: string;
  attribution: AttributionData | null;
} {
  const eventId = generateEventId();
  const attribution = getAttribution();

  trackMetaEvent(
    'Lead',
    {
      content_name: contentName,
      content_category: 'Lead',
    },
    eventId
  );

  return { eventId, attribution };
}
