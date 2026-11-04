// ---------------------------------------------------------------------------
// systems/next-steps — one of four doors into the same step.
//
// Thin by design. The implementation is app/_funnel/next-steps-step, shared by all
// four angles; this file exists to own the route and name its angle. Put
// nothing here that is not angle-specific, or the four funnels start to
// drift and the point of sharing is lost.
//
// This door came in on the work-harder objection.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import NextStepsStep, { nextStepsMetadata } from '@/app/_funnel/next-steps-step';
import { VSL_ANGLE_SYSTEMS } from '@/lib/advisory-config';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = nextStepsMetadata;

export default function Page() {
  return <NextStepsStep angle={VSL_ANGLE_SYSTEMS} />;
}
