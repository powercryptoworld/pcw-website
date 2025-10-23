"use client";

import { useEffect, useRef, useState } from "react";

type UsdState = { priceUsd?: number; source?: string };

// ~20s in-tab cache to avoid hammering the proxy and to keep UI snappy.
const CACHE_TTL_MS = 20_000;
const cache = new Map<string, { ts: number; val: UsdState }>();

/**
 * useUsdQuote(chainId, tokenAddress, decimals)
 * - Returns { priceUsd, source } for the given token on a chain.
 * - Fetches from our lab proxy: /api/price/oneinch?chainId=&token=&decimals=
 * - Stable deps: [chainId, token, decimals]; no loops; aborts in-flight fetches on change.
 * - Idempotent setState: only updates when the value actually changed.
 */
export function useUsdQuote(
  chainId?: number,
  token?: string,
  decimals?: number
): UsdState {
  const [state, setState] = useState<UsdState>({});
  const abortRef = useRef<AbortController | null>(null);

  // Build a stable cache key only when inputs are valid
  const key =
    chainId && token && decimals != null
      ? `${chainId}-${String(token).toLowerCase()}-${decimals}`
      : undefined;

  useEffect(() => {
    // If inputs are incomplete, clear state and bail without fetching
    if (!key || !chainId || !token || decimals == null) {
      setState((prev) => (prev.priceUsd || prev.source ? {} : prev));
      return;
    }

    // Serve from cache if fresh
    const now = Date.now();
    const hit = cache.get(key);
    if (hit && now - hit.ts < CACHE_TTL_MS) {
      const v = hit.val;
      setState((prev) =>
        prev.priceUsd === v.priceUsd && prev.source === v.source ? prev : v
      );
      return;
    }

    // Abort any in-flight fetch tied to the previous inputs
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    (async () => {
      try {
        const url = new URL("/api/price/oneinch", window.location.origin);
        url.searchParams.set("chainId", String(chainId));
        url.searchParams.set("token", String(token));
        url.searchParams.set("decimals", String(decimals));

        const res = await fetch(url.toString(), {
          signal: ac.signal,
          cache: "no-store",
        });
        const j = await res.json().catch(() => ({} as any));

        if (!res.ok || !j?.ok) {
          const next: UsdState = { priceUsd: undefined, source: "error" };
          cache.set(key, { ts: Date.now(), val: next });
          setState((prev) =>
            prev.source === "error" ? prev : next
          );
          return;
        }

        const next: UsdState = { priceUsd: j.usd, source: j.source };
        cache.set(key, { ts: Date.now(), val: next });
        setState((prev) =>
          prev.priceUsd === next.priceUsd && prev.source === next.source
            ? prev
            : next
        );
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        const next: UsdState = { priceUsd: undefined, source: "error" };
        cache.set(key, { ts: Date.now(), val: next });
        setState((prev) =>
          prev.source === "error" ? prev : next
        );
      }
    })();

    return () => {
      ac.abort();
    };
  }, [key, chainId, token, decimals]);

  return state;
}
