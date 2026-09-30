// ---------------------------------------------------------------------------
// Shared dark canvas for every page of the demo funnel (/demo and its
// children). Deliberately generic — each page owns its own chrome.
// ---------------------------------------------------------------------------
import type { ReactNode } from 'react';

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-white" style={{ background: '#0a0f1c' }}>
      {children}
    </div>
  );
}
