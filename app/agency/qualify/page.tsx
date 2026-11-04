// ---------------------------------------------------------------------------
// agency/qualify — one of four doors into the same step.
//
// Thin by design. The implementation is app/_funnel/qualify-step, shared by all
// four angles; this file exists to own the route and name its angle. Put
// nothing here that is not angle-specific, or the four funnels start to
// drift and the point of sharing is lost.
//
// This door came in on the agency objection.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import QualifyStep, { qualifyMetadata } from '@/app/_funnel/qualify-step';
import { VSL_ANGLE_AGENCY } from '@/lib/advisory-config';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = qualifyMetadata;

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <QualifyStep angle={VSL_ANGLE_AGENCY} searchParams={searchParams} />;
}
