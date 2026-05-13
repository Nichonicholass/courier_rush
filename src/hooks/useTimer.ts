import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimer() {
  const [elapsed, setElapsed] = useState(0); // ms
  const [running, setRunning] = useState(false);
  const startRef = useRef<number | null>(null);
  const pausedRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    if (startRef.current !== null) {
      setElapsed(pausedRef.current + (Date.now() - startRef.current));
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (running) {
      startRef.current = Date.now();
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (startRef.current !== null) {
        pausedRef.current += Date.now() - startRef.current;
        startRef.current = null;
      }
    }
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [running, tick]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
    pausedRef.current = 0;
    startRef.current = null;
  }, []);

  const formatTime = (ms: number): string => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };

  return { elapsed, running, start, pause, reset, formatTime };
}
