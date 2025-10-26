"use client";
import { useEffect, useMemo, useState } from "react";
import type { Address } from "viem";
import { formatUnits } from "viem";
import { useEvmBalances, type EvmToken } from "@/hooks/useEvmBalances";
import { useUsdQuote } from "@/hooks/useUsdQuote";
import { toBufferWei } from "@/hooks/useGasBuffer";
import { wrappedAddressFor } from "@/hooks/useWrappedMap";
import { isKnownStable } from "@/hooks/useStableMap";
import { TokenAvatar } from "@/components/TokenAvatar";

export type RowToken = EvmToken & {
  logoURI?: string;
  symbol: string;
  decimals: number;
};

type Props = {
  title: "You pay" | "You receive";
  token: RowToken;
  amount: string;
  onAmount: (v: string)=>void;
  onComputedBalance?: (v: number)=>void;
  readOnlyAmount?: boolean;
  showMax?: boolean;
};

/** In-memory logo cache for the session: key = `${chainId}:${address||native}` */
const logoCache = new Map<string, string | null>();

/** Map EVM chainId -> TrustWallet chain folder */
function trustWalletChainFolder(chainId: number): string | null {
  switch (chainId) {
    case 1: return "ethereum";
    case 56: return "smartchain";
    case 137: return "polygon";
    case 10: return "optimism";
    case 42161: return "arbitrum";
    case 8453: return "base";
    default: return null;
  }
}

/** Try to resolve a logo URL with a few read-only sources, in order. */
async function resolveLogoAuto(token: RowToken): Promise<string | null> {
  const key = `${token.chainId}:${token.address ?? "native"}`;

  if (logoCache.has(key)) return logoCache.get(key) ?? null;

  // 1) If token already has logoURI, prefer it.
  if (token.logoURI && typeof token.logoURI === "string") {
    logoCache.set(key, token.logoURI);
    return token.logoURI;
  }

  // Helper to test if an image actually loads (no CORS issues for <img>)
  const imageLoads = (url: string) =>
    new Promise<boolean>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });

  // 2) Query our existing stable search endpoints (read-only) to fetch logoURI
  try {
    if (token.address) {
      // EVM search by address
      const u = new URL("/api/evm-search", window.location.origin);
      u.searchParams.set("q", token.address as string);
      u.searchParams.set("chainId", String(token.chainId));
      const r = await fetch(u.toString(), { cache: "no-store" });
      const j = await r.json().catch(() => null);
      const fromApi = j?.items?.[0]?.logoURI as string | undefined;
      if (fromApi && await imageLoads(fromApi)) {
        logoCache.set(key, fromApi);
        return fromApi;
      }
    } else {
      // Native coins: try chain logo via TrustWallet "info/logo.png"
      const folder = trustWalletChainFolder(token.chainId);
      if (folder) {
        const nativeUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${folder}/info/logo.png`;
        if (await imageLoads(nativeUrl)) {
          logoCache.set(key, nativeUrl);
          return nativeUrl;
        }
      }
    }
  } catch {
    // ignore network errors and continue to next fallbacks
  }

  // 3) TrustWallet assets path for ERC-20 tokens (may 404 if not listed)
  try {
    if (token.address) {
      const folder = trustWalletChainFolder(token.chainId);
      if (folder) {
        // TrustWallet repo expects checksum-case; lowercase sometimes works, try both
        const addrLower = (token.address as string).toLowerCase();
        const cand = [
          `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${folder}/assets/${addrLower}/logo.png`,
          `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${folder}/assets/${token.address}/logo.png`,
        ];
        for (const url of cand) {
          if (await imageLoads(url)) {
            logoCache.set(key, url);
            return url;
          }
        }
      }
    }
  } catch { /* noop */ }

  // 4) Last resort: no logo
  logoCache.set(key, null);
  return null;
}

export default function TokenRow({
  title, token, amount, onAmount, onComputedBalance, readOnlyAmount, showMax
}: Props) {
  const { native, erc20Balance } = useEvmBalances(token);

  const [balStr, setBalStr] = useState<string>("—");
  const [balNum, setBalNum] = useState<number>(0);
  const [runtimeDecimals, setRuntimeDecimals] = useState<number>(token.decimals ?? 18);
  const [err, setErr] = useState<string>("");

  // Auto logo state
  const [logo, setLogo] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const l = await resolveLogoAuto(token);
        if (alive) setLogo(l);
      } catch {
        if (alive) setLogo(null);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token.address, token.chainId, token.logoURI, token.symbol]);

  // fetch balance + authoritative decimals
  useEffect(() => {
    let mounted = true;
    async function go() {
      if (!token.address) {
        if (native.data?.value != null) {
          const v = native.data.value;
          const dec = native.data.decimals;
          const str = formatUnits(v, dec);
          if (!mounted) return;
          setRuntimeDecimals(dec);
          setBalStr(str);
          const asNum = Number(str);
          const n = Number.isFinite(asNum) ? asNum : 0;
          setBalNum(n);
          onComputedBalance?.(n);
        }
        return;
      }
      const erc = await erc20Balance();
      if (!mounted || !erc) return;
      const dec = erc.decimals ?? token.decimals ?? 18;
      const str = erc.balance != null ? formatUnits(erc.balance, dec) : "0";
      setRuntimeDecimals(dec);
      setBalStr(str);
      const asNum = Number(str);
      const n = Number.isFinite(asNum) ? asNum : 0;
      setBalNum(n);
      onComputedBalance?.(n);
    }
    go();
    return ()=>{ mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token.address, token.chainId, native.data?.value]);

  // Price source: token address OR wrapped-native (for native coins)
  const priceAddr = (token.address as Address|undefined) ?? wrappedAddressFor(token.chainId);
  // IMPORTANT: pass runtimeDecimals (authoritative) not the static token.decimals
  const usd = useUsdQuote(token.chainId, priceAddr, runtimeDecimals);
  const stableHere = isKnownStable(token.chainId, token.address as any);

  // USD display (with $1 stable fallback)
  const usdLine = useMemo(() => {
    if (!amount) return "";
    const amt = Number(amount);
    if (!Number.isFinite(amt)) return "";
    const p = (usd.priceUsd && usd.priceUsd > 0)
      ? usd.priceUsd
      : (stableHere ? 1 : undefined);
    if (!p) return "≈ $—";
    return `≈ $${(amt * p).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }, [amount, usd.priceUsd, stableHere]);

  // simple validation: amount <= balance (only meaningful when editable)
  useEffect(() => {
    const a = Number(amount || "0");
    if (a > balNum) setErr("Amount exceeds balance");
    else setErr("");
  }, [amount, balNum]);

  function onMaxClick() {
    // ERC-20: full balance; Native: subtract gas buffer
    if (!token.address) {
      const v = native.data?.value;
      const dec = native.data?.decimals ?? runtimeDecimals;
      if (!v) return;
      const buf = toBufferWei(token.chainId, dec);
      const spendable = v > buf ? v - buf : 0n;
      const str = formatUnits(spendable, dec);
      onAmount(str);
      return;
    }
    onAmount(balStr === "—" ? "" : balStr);
  }

  return (
    <div className="rounded-2xl p-4 bg-black/20 border border-white/10 shadow-sm">
      <div className="flex items-center justify-between text-sm opacity-80">
        <span>{title}</span>
        <span>Balance: {balStr}</span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <input
          value={amount}
          onChange={(e)=> onAmount(e.target.value)}
          disabled={!!readOnlyAmount}
          inputMode="decimal"
          placeholder="0.0"
          className={`w-full bg-transparent text-2xl outline-none ${(!readOnlyAmount && err) ? "text-red-400" : ""}`}
        />
        <div className="shrink-0 px-2 py-1 rounded-lg bg-white/10 flex items-center gap-2">
          <TokenAvatar size={18} symbol={token.symbol} name={token.symbol} logoURI={logo ?? undefined} />
          <span>{token.symbol}</span>
        </div>
        {showMax && (
          <button
            onClick={onMaxClick}
            disabled={!!readOnlyAmount || balStr === "—" || balNum <= 0}
            title={(balStr==="—") ? "Connect wallet to use MAX" : (balNum<=0 ? "No balance" : "Set maximum")}
            className="ml-2 text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10 disabled:cursor-not-allowed"
          >
            MAX
          </button>
        )}
      </div>

      <div className="mt-1 text-xs opacity-70">{usdLine}</div>

      {/* DEBUG — hidden by default; show only if NEXT_PUBLIC_LAB_DEBUG="1" */}
      {process.env.NEXT_PUBLIC_LAB_DEBUG === "1" && (
        <div className="mt-1 text-[11px] opacity-70">
          priceDbg • chain:{token.chainId} • addr:{String(priceAddr||"native")}
          {' '}• price:{usd.priceUsd ?? "n/a"} • source:{usd.source ?? "n/a"}
          {' '}• runtimeDecimals:{runtimeDecimals} • stable:{stableHere ? "yes" : "no"}
        </div>
      )}

      {(!readOnlyAmount && err) && <div className="mt-1 text-xs text-red-400">{err}</div>}
    </div>
  );
}
