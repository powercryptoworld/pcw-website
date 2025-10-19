"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useCooldown
 * Keeps per-key cooldowns. Example:
 *   const { isCooling, start, remainingMs } = useCooldown(10_000)
 *   if (!isCooling(key)) { start(key) }
 */
export function useCooldown(defaultMs = 10_000) {
  const expiriesRef = useRef<Map<string, number>>(new Map());
  const [, setTick] = useState(0); // just to trigger re-renders

  // Re-render ~4x/sec while any cooldowns are active
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 250);
    return () => clearInterval(i);
  }, []);

  const now = () => Date.now();

  const isCooling = useCallback((key: string) => {
    const exp = expiriesRef.current.get(key) ?? 0;
    return exp > now();
  }, []);

  const remainingMs = useCallback((key: string) => {
    const exp = expiriesRef.current.get(key) ?? 0;
    return Math.max(0, exp - now());
  }, []);

  const start = useCallback((key: string, ms?: number) => {
    const dur = ms ?? defaultMs;
    expiriesRef.current.set(key, now() + dur);
    setTick((t) => t + 1);
  }, [defaultMs]);

  const clear = useCallback((key: string) => {
    expiriesRef.current.delete(key);
    setTick((t) => t + 1);
  }, []);

  return { isCooling, remainingMs, start, clear };
}
