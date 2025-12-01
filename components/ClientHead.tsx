'use client';

import { PerformanceHints, CriticalStyles } from './ResourcePreloader';

export default function ClientHead() {
  return (
    <>
      <PerformanceHints />
      <CriticalStyles />
    </>
  );
}