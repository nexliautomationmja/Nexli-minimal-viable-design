'use client';
import React from 'react';
import { Lock, RotateCw } from 'lucide-react';

export type BrowserDevice = 'desktop' | 'phone';

interface BrowserFrameProps {
  src: string;
  title: string;
  device?: BrowserDevice;
  /** Viewport height of the framed page in px. */
  height?: number;
  /** Shown in the address bar, e.g. the firm's future domain. */
  address?: string;
  iframeRef?: React.Ref<HTMLIFrameElement>;
  onLoad?: () => void;
  className?: string;
}

const PHONE_WIDTH = 390;

/**
 * Browser-chrome wrapper around an iframe: traffic-light dots and an address
 * bar on desktop, a rounded 390px handset on phone. Purely presentational.
 */
export default function BrowserFrame({
  src,
  title,
  device = 'desktop',
  height = 720,
  address = 'yourfirm.com',
  iframeRef,
  onLoad,
  className = '',
}: BrowserFrameProps) {
  const isPhone = device === 'phone';

  if (isPhone) {
    return (
      <div className={`flex justify-center ${className}`}>
        <div
          className="relative overflow-hidden"
          style={{
            width: PHONE_WIDTH + 24,
            maxWidth: '100%',
            borderRadius: 44,
            padding: 12,
            background: 'linear-gradient(180deg, #1f2937 0%, #0b1220 100%)',
            boxShadow: '0 40px 100px -30px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.08)',
          }}
        >
          {/* Notch */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 -translate-x-1/2 z-10"
            style={{ top: 20, width: 110, height: 26, borderRadius: 999, background: '#000' }}
          />
          <div
            className="overflow-hidden bg-white"
            style={{ borderRadius: 34, height, width: '100%' }}
          >
            <iframe
              ref={iframeRef}
              src={src}
              title={title}
              onLoad={onLoad}
              className="block border-0"
              style={{ width: '100%', height: '100%' }}
              loading="eager"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl ${className}`}
      style={{
        background: '#0f172a',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 40px 100px -40px rgba(0,0,0,0.8)',
      }}
    >
      {/* Chrome */}
      <div
        className="flex items-center gap-3 px-4"
        style={{ height: 44, background: '#111827', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
          <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
          <span className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
          <span className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
        </div>
        <div
          className="flex-1 flex items-center gap-2 px-3 mx-auto text-xs truncate"
          style={{
            maxWidth: 520,
            height: 28,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.7)',
            fontFamily: "'Outfit', system-ui, sans-serif",
          }}
        >
          <Lock size={11} aria-hidden="true" style={{ color: '#34d399' }} />
          <span className="truncate">
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>https://</span>
            {address}
          </span>
        </div>
        <RotateCw size={13} aria-hidden="true" style={{ color: 'rgba(255,255,255,0.35)' }} className="shrink-0" />
      </div>
      <div className="bg-white" style={{ height }}>
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          onLoad={onLoad}
          className="block border-0"
          style={{ width: '100%', height: '100%' }}
          loading="eager"
        />
      </div>
    </div>
  );
}
