'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import RoadmapOffer from '../../components/RoadmapOffer';

function RoadmapWithParams() {
  const params = useSearchParams();
  const cancelled = params.get('checkout') === 'cancelled';
  return <RoadmapOffer cancelled={cancelled} />;
}

export default function RoadmapClient() {
  return (
    <Suspense fallback={<RoadmapOffer />}>
      <RoadmapWithParams />
    </Suspense>
  );
}
