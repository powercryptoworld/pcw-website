import { useEffect, useMemo, useState } from "react";
import type { Address } from "viem";

type PriceState = { priceUsd?: number; loading: boolean; source?: string };
const cache = new Map<string, { t: number; v: PriceState }>();
const TTL_MS = 20000; // 20s

export function useUsdQuote(chainId: number, tokenAddress?: Address, tokenDecimals?: number) {
  const key = useMemo(
    () => `${chainId}:${(tokenAddress||"native").toLowerCase()}:${tokenDecimals ?? "nd"}:v1`,
    [chainId, tokenAddress, tokenDecimals]
  );
  const [state, setState] = useState<PriceState>(() => {
    const c = cache.get(key);
    if (c && (Date.now() - c.t) < TTL_MS) return c.v;
    return { loading: !!tokenAddress, priceUsd: undefined };
  });

  useEffect(() => {
    let aborted = false;
    async function run() {
      if (!tokenAddress || tokenDecimals == null) { setState({ loading:false }); return; }
      const c = cache.get(key);
      if (c && (Date.now()-c.t) < TTL_MS) { setState(c.v); return; }
      setState({ loading:true });

      try {
        const u = new URL("/api/price/oneinch", window.location.origin);
        u.searchParams.set("chainId", String(chainId));
        u.searchParams.set("token", tokenAddress);
        u.searchParams.set("decimals", String(tokenDecimals));
        const r = await fetch(u.toString(), { cache: "no-store" });
        const j = r.ok ? await r.json() : {};
        const v = { loading:false, priceUsd: j?.priceUsd, source: j?.source ?? (r.ok ? "proxy" : "error") } as PriceState;
        cache.set(key, { t: Date.now(), v });
        if (!aborted) setState(v);
      } catch {
        if (!aborted) setState({ loading:false, priceUsd: undefined, source: "error" });
      }
    }
    run();
    return ()=>{ aborted = true; };
  }, [key, chainId, tokenAddress, tokenDecimals]);

  return state;
}
