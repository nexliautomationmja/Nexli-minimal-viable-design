// ---------------------------------------------------------------------------
// /qualify — a permanent redirect to the advisory funnel's qualifier.
//
// This used to be a shell page whose only job was to pop the site-wide
// qualification modal from a useEffect. With openBooking now routing to
// /advisory-pricing/qualify, that shell would have rendered a logo and a
// loading pulse purely to bounce the visitor one tick later. A server
// redirect does the same thing before anything paints.
//
// Kept rather than deleted because the path is in the wild — nurture
// emails, ad destinations and anything already linking to /qualify.
// ---------------------------------------------------------------------------
import { redirect } from 'next/navigation';
import { ADVISORY_QUALIFY_PATH } from '@/lib/advisory-config';

export default function QualifyPage() {
  redirect(ADVISORY_QUALIFY_PATH);
}
