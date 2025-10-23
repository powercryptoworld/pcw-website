"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useUsdQuote } from "./useUsdQuote";

export type Addr = `0x${string}`;
export type GasSpeed = "standard" | "fast" | "instant";

export type UseEvmQuoteArgs = {
  chainId: number;
  src: { address: Addr; decimals: number; symbol?: string };
  dst: { address: Addr; decimals: number; symbol?: string };
  amount: string; // human amount, e.g. "0.123"
  slippageBps?: number; // 50 = 0.50%
  includeProtocols?: boolean;
  gasSpeed?: GasSpeed; // used only when 1inch quote lacks gasPrice
};

export type UseEvmQuoteResult = {
  loading: boolean;
  error?: string;
  data?: {
    dstAmount: string | null;      // base units (string)
    gas?: number | null;           // units
    gasPrice?: string | null;      // wei (string) if present
    routeSummary?: string | null;  // "UNISWAP_V3 → CURVE" etc.
    priceImpactPct?: number | null;
    gasUsd?: number | null;
  };
  raw?: any; // full upstream passthrough (for debug)
};

const WRAPPED_NATIVE: Record<number, { address: Addr; decimals: number; symbol: string }> = {
  1:   { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18, symbol: "WETH" },
  56:  { address: "0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", decimals: 18, symbol: "WBNB" },
  137: { address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", decimals: 18, symbol: "WMATIC" },
  43114:{ address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", decimals: 18, symbol: "WAVAX" },
  250: { address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", decimals: 18, symbol: "WFTM" },
  100: { address: "0x6a023CCd1ff6F2045C3309768eAd9E68F978f6e1", decimals: 18, symbol: "WXDAI" },
  42220:{ address: "0x471EcE3750Da237f93B8E339c536989b8978a438", decimals: 18, symbol: "CELO" },
  1313161554:{ address: "0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB", decimals: 18, symbol: "WETH" },
  42161:{ address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", decimals: 18, symbol: "WETH" },
  42170:{ address: "0x722E8BdD2ce80A4422E880164f2079488e115365", decimals: 18, symbol: "WETH" },
  10:  { address: "0x4200000000000000000000000000000000000006", decimals: 18, symbol: "WETH" },
  8453:{ address: "0x4200000000000000000000000000000000000006", decimals: 18, symbol: "WETH" },
  324: { address: "0x5AEa5775959fBC2557Cc8789bF57aD66f5e2b9f0", decimals: 18, symbol: "WETH" },
  59144:{ address: "0xE5D7C2a44FfDDf6b295A15a180fB4bA3a5F0F2F0", decimals: 18, symbol: "WETH" },
  534352:{ address: "0x5300000000000000000000000000000000000004", decimals: 18, symbol: "WETH" },
  1101:{ address: "0x4200000000000000000000000000000000000006", decimals: 18, symbol: "WETH" },
  5000:{ address: "0x78cA7aCeB7C47c02bC7F2e6B58a38B8C8b1d9D8C", decimals: 18, symbol: "WETH" },
  81457:{ address: "0x4300000000000000000000000000000000000004", decimals: 18, symbol: "WETH" },
  7777777:{ address: "0x4200000000000000000000000000000000000006", decimals: 18, symbol: "WETH" },
  2222:{ address: "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D", decimals: 18, symbol: "WKAVA" },
  1284:{ address: "0xAcc15dC74880C9944775448304B263D191c6077F", decimals: 18, symbol: "WGLMR" },
};

function formatPct(n: number): number {
  return Math.round(n * 100) / 100;
}

export function useEvmQuote(args: UseEvmQuoteArgs): UseEvmQuoteResult {
  const { chainId, src, dst, amount, slippageBps = 50, includeProtocols = true, gasSpeed = "fast" } = args;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [payload, setPayload] = useState<any>(undefined);
  const [gasUsdOverride, setGasUsdOverride] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // USD references for price impact + gas$
  const { usd: srcUsd } = useUsdQuote({ chainId, token: src.address, decimals: src.decimals });
  const { usd: dstUsd } = useUsdQuote({ chainId, token: dst.address, decimals: dst.decimals });

  // Native token USD for gas fee estimation
  const wrapped = WRAPPED_NATIVE[chainId];
  const { usd: nativeUsd } = useUsdQuote(
    wrapped ? { chainId, token: wrapped.address, decimals: wrapped.decimals } : undefined as any
  );

  useEffect(() => { setGasUsdOverride(null); }, [chainId, src?.address, dst?.address, amount, slippageBps, gasSpeed]);

  useEffect(() => {
    if (!chainId || !src?.address || !dst?.address || !amount || Number(amount) <= 0) {
      setPayload(undefined);
      setError(undefined);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(undefined);

    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const u = new URL("/api/quote/oneinch", window.location.origin);
    u.searchParams.set("chainId", String(chainId));
    u.searchParams.set("src", src.address);
    u.searchParams.set("dst", dst.address);
    u.searchParams.set("amount", amount);
    u.searchParams.set("srcDecimals", String(src.decimals));
    if (includeProtocols) u.searchParams.set("includeProtocols", "1");
    if (slippageBps != null) u.searchParams.set("slippageBps", String(slippageBps));

    fetch(u.toString(), { signal: ac.signal })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok || !j?.ok) throw new Error(j?.error || `HTTP ${r.status}`);
        return j;
      })
      .then((j) => {
        setPayload(j);
        // If quote has gas units but NO gasPrice, fetch a suggested gas price via the lab helper using selected speed.
        const gasUnits: number | null = j?.quote?.gas ?? null;
        const hasGasPrice = !!j?.quote?.gasPrice;
        if (gasUnits && !hasGasPrice && nativeUsd) {
          const g = new URL("/token-search-test/api/gas/oneinch", window.location.origin);
          g.searchParams.set("chainId", String(chainId));
          fetch(g.toString())
            .then((r) => r.json())
            .then((gj) => {
              const weiStr =
                (gasSpeed === "instant" && (gj?.instant ?? gj?.fast ?? gj?.standard)) ??
                (gasSpeed === "fast"    && (gj?.fast ?? gj?.instant ?? gj?.standard)) ??
                (gj?.standard ?? gj?.fast ?? gj?.instant);
              if (!weiStr) return;
              const totalWei = BigInt(gasUnits) * BigInt(String(weiStr));
              const native = Number(totalWei) / 1e18;
              setGasUsdOverride(native * nativeUsd);
            })
            .catch(() => {});
        }
      })
      .catch((e) => {
        if (e?.name === "AbortError") return;
        setError(e?.message || "Failed to fetch quote");
        setPayload(undefined);
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [chainId, src?.address, src?.decimals, dst?.address, dst?.decimals, amount, slippageBps, includeProtocols, nativeUsd, gasSpeed]);

  const data = useMemo<UseEvmQuoteResult["data"]>(() => {
    if (!payload?.ok) return undefined;

    const dstAmountWei: string | null = payload?.quote?.dstAmount ?? null;
    const gasUnits: number | null = payload?.quote?.gas ?? null;
    const gasPriceWei: string | null = payload?.quote?.gasPrice ?? null;

    // Price impact (%)
    let priceImpactPct: number | null = null;
    try {
      if (dstAmountWei && srcUsd && dstUsd) {
        const srcUsdPerUnit = srcUsd;
        const dstUsdPerUnit = dstUsd;
        const midPrice = srcUsdPerUnit / dstUsdPerUnit; // dst per 1 src
        const amountSrc = Number(amount);
        const dstUnits = Number(dstAmountWei) / 10 ** dst.decimals;
        if (amountSrc > 0 && dstUnits > 0 && isFinite(midPrice)) {
          const execPrice = dstUnits / amountSrc;
          const impact = (midPrice - execPrice) / midPrice;
          priceImpactPct = formatPct(impact * 100);
        }
      }
    } catch {
      priceImpactPct = null;
    }

    // Gas in USD
    let gasUsd: number | null = null;
    try {
      if (gasUnits && nativeUsd) {
        if (gasPriceWei) {
          const wei = BigInt(gasUnits) * BigInt(gasPriceWei);
          const native = Number(wei) / 1e18;
          gasUsd = native * nativeUsd;
        } else if (gasUsdOverride != null) {
          gasUsd = gasUsdOverride;
        }
      }
    } catch {
      gasUsd = null;
    }

    return {
      dstAmount: dstAmountWei,
      gas: gasUnits,
      gasPrice: gasPriceWei,
      routeSummary: payload?.quote?.routeSummary ?? null,
      priceImpactPct,
      gasUsd,
    };
  }, [payload, amount, srcUsd, dstUsd, nativeUsd, dst.decimals, gasUsdOverride]);

  return { loading, error, data, raw: payload?.raw };
}
