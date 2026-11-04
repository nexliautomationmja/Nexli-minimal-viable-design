// ---------------------------------------------------------------------------
// acquisition/call — one of four doors into the same step.
//
// Thin by design. The implementation is app/_funnel/call-step, shared by all
// four angles; this file exists to own the route and name its angle. Put
// nothing here that is not angle-specific, or the four funnels start to
// drift and the point of sharing is lost.
//
// This door came in on the referrals objection.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import CallStep, { callMetadata } from '@/app/_funnel/call-step';
import { VSL_ANGLE_ACQUISITION } from '@/lib/advisory-config';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = callMetadata;

export default function Page() {
  return <CallStep angle={VSL_ANGLE_ACQUISITION} />;
}
