"use client";
import { useEffect, useMemo, useState } from "react";
import type { Address } from "viem";
import { formatUnits } from "viem";
import { useEvmBalances, type EvmToken } from "@/hooks/useEvmBalances";
import { useUsdQuote } from "@/hooks/useUsdQuote";
import { toBufferWei } from "@/hooks/useGasBuffer";
import { wrappedAddressFor } from "@/hooks/useWrappedMap";
import { isKnownStable } from "@/hooks/useStableMap";

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

export default function TokenRow({
  title, token, amount, onAmount, onComputedBalance, readOnlyAmount, showMax
}: Props) {
  const { native, erc20Balance } = useEvmBalances(token);

  const [balStr, setBalStr] = useState<string>("—");
  const [balNum, setBalNum] = useState<number>(0);
  const [runtimeDecimals, setRuntimeDecimals] = useState<number>(token.decimals ?? 18);
  const [err, setErr] = useState<string>("");

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
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <input
            value={amount}
            onChange={(e)=> onAmount(e.target.value)}
            disabled={!!readOnlyAmount}
            inputMode="decimal"
            placeholder="0.0"
            className={`w-full bg-transparent text-2xl outline-none ${(!readOnlyAmount && err) ? "text-red-400" : ""}`}
          />
          <div className="shrink-0 px-2 py-1 rounded-lg bg-white/10">{token.symbol}</div>
        </div>
          <div className="ml-4 shrink-0 flex items-center gap-2 w-[210px]">
            <span className="text-sm opacity-80 relative top-[1px] tabular-nums font-mono">Balance: {balStr}</span>
            {showMax && (
              <button
                onClick={onMaxClick}
                disabled={!!readOnlyAmount || balStr === "—" || balNum <= 0}
                title={(balStr==="—") ? "Connect wallet to use MAX" : (balNum<=0 ? "No balance" : "Set maximum")}
                className="max-pill text-[10px] px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                MAX
              </button>
            )}
          </div>
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