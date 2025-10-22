import { useEffect, useMemo, useState } from "react";
import type { Address } from "viem";

type PriceState = { priceUsd?: number; loading: boolean; source?: string };

// Basic per-session cache
const cache = new Map<string, { t: number; v: PriceState }>();
const TTL_MS = 30_000;

export function useUsdQuote(chainId: number, tokenAddress?: Address) {
  const key = useMemo(() => `${chainId}:${(tokenAddress||"native").toLowerCase()}`, [chainId, tokenAddress]);
  const [state, setState] = useState<PriceState>(() => {
    const c = cache.get(key);
    if (c && (Date.now() - c.t) < TTL_MS) return c.v;
    return { loading: !!tokenAddress, priceUsd: undefined };
  });

  useEffect(() => {
    let aborted = false;
    async function run() {
      if (!tokenAddress) { setState(s=>({...s, loading:false})); return; }
      const c = cache.get(key);
      if (c && (Date.now()-c.t)<TTL_MS) { setState(c.v); return; }
      setState({ loading: true });
      try {
        const r = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`, { cache: "no-store" });
        if (!r.ok) throw new Error("ds bad");
        const j = await r.json();
        const pairs = Array.isArray(j?.pairs) ? j.pairs : [];
        // pick first pair with priceUsd
        const withUsd = pairs.find((p:any)=> p?.priceUsd);
        const priceUsd = withUsd ? Number(withUsd.priceUsd) : undefined;
        const v = { loading:false, priceUsd, source:"dexscreener" as const };
        cache.set(key, { t: Date.now(), v });
        if (!aborted) setState(v);
      } catch {
        if (!aborted) setState({ loading:false, priceUsd: undefined });
      }
    }
    run();
    return ()=>{ aborted = true; };
  }, [key, tokenAddress]);

  return state;
}
