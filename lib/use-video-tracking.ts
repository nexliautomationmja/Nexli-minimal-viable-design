'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Mux player tracking hook. Mirrors the inline handlers in VslFunnel.tsx and
 * posts play / pause / progress / milestone / complete events to /api/vsl/track.
 */
export function useVideoTracking(storageKey: string, sessionPrefix: string, email?: string) {
  const videoRef = useRef<any>(null);
  const [sessionId, setSessionId] = useState('');
  const lastTrackedTime = useRef(0);
  const milestonesTracked = useRef<Set<number>>(new Set());

  useEffect(() => {
    let id: string | null = null;
    try {
      id = localStorage.getItem(storageKey);
      if (!id) {
        id = `${sessionPrefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
        localStorage.setItem(storageKey, id);
      }
    } catch {
      id = `${sessionPrefix}_${Date.now()}`;
    }
    setSessionId(id);
    if (videoRef.current) videoRef.current.currentTime = 0;
  }, [storageKey, sessionPrefix]);

  const track = useCallback(
    async (eventType: string, data: Record<string, unknown> = {}) => {
      if (!sessionId) return;
      try {
        await fetch('/api/vsl/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            event_type: eventType,
            video_position: videoRef.current?.currentTime || 0,
            video_duration: videoRef.current?.duration || 0,
            email: email || undefined,
            ...data,
          }),
        });
      } catch (err) {
        console.error('Failed to track video event:', err);
      }
    },
    [sessionId, email]
  );

  const onPlay = useCallback(() => {
    track('play');
  }, [track]);

  const onPause = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    track('pause', { completion_percentage: (v.currentTime / v.duration) * 100 });
  }, [track]);

  const onTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || !sessionId || !v.duration) return;
    const pct = (v.currentTime / v.duration) * 100;

    if (v.currentTime - lastTrackedTime.current >= 10) {
      track('progress', { completion_percentage: pct });
      lastTrackedTime.current = v.currentTime;
    }

    for (const milestone of [25, 50, 75, 100]) {
      if (pct >= milestone && !milestonesTracked.current.has(milestone)) {
        milestonesTracked.current.add(milestone);
        track('milestone', { milestone, completion_percentage: pct });
      }
    }
  }, [track, sessionId]);

  const onEnded = useCallback(() => {
    track('complete', { completion_percentage: 100 });
  }, [track]);

  return { videoRef, handlers: { onPlay, onPause, onTimeUpdate, onEnded } };
}
