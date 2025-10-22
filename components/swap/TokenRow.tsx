"use client";
import { useEffect, useMemo, useState } from "react";
import type { Address } from "viem";
import { formatUnits } from "viem";
import { useEvmBalances, type EvmToken } from "@/hooks/useEvmBalances";
import { useUsdQuote } from "@/hooks/useUsdQuote";

export type RowToken = EvmToken & {
  logoURI?: string;
  symbol: string;
  decimals: number;
};

type Props = {
  title: "You pay" | "You receive";
  account?: Address;
  token: RowToken;
  amount: string;
  onAmount: (v: string)=>void;
  onMax?: ()=>void;
  readOnlyAmount?: boolean;
};

export default function TokenRow({ title, token, amount, onAmount, onMax, readOnlyAmount }: Props) {
  const { address, native, erc20Balance } = useEvmBalances(token);
  const [bal, setBal] = useState<string>("—");
  const [decimals, setDecimals] = useState<number>(token.decimals ?? 18);

  // fetch ERC-20 balance if needed
  useEffect(() => {
    let mounted = true;
    async function go() {
      if (!token.address) {
        // native
        if (native.data?.value != null) {
          const v = formatUnits(native.data.value, native.data.decimals);
          if (mounted) {
            setDecimals(native.data.decimals);
            setBal(v);
          }
        }
        return;
      }
      const erc = await erc20Balance();
      if (!mounted || !erc) return;
      if (erc.balance != null) setBal(formatUnits(erc.balance, erc.decimals ?? token.decimals ?? 18));
      if (erc.decimals != null) setDecimals(erc.decimals);
    }
    go();
    return ()=>{ mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token.address, token.chainId, native.data?.value]);

  const usd = useUsdQuote(token.chainId, token.address as Address|undefined);

  const usdLine = useMemo(() => {
    if (!amount) return "";
    const amt = Number(amount);
    if (!Number.isFinite(amt)) return "";
    if (!usd.priceUsd) return "≈ $—";
    return `≈ $${(amt * usd.priceUsd).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }, [amount, usd.priceUsd]);

  return (
    <div className="rounded-2xl p-4 bg-black/20 border border-white/10 shadow-sm">
      <div className="flex items-center justify-between text-sm opacity-80">
        <span>{title}</span>
        <span>Balance: {bal}</span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        {/* minimal amount input; your token picker can slot in here later */}
        <input
          value={amount}
          onChange={(e)=> onAmount(e.target.value)}
          disabled={!!readOnlyAmount}
          inputMode="decimal"
          placeholder="0.0"
          className="w-full bg-transparent text-2xl outline-none"
        />
        <div className="shrink-0 px-2 py-1 rounded-lg bg-white/10">{token.symbol}</div>
        {onMax && (
          <button onClick={onMax} className="ml-2 text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20">MAX</button>
        )}
      </div>
      <div className="mt-1 text-xs opacity-70">{usdLine}</div>
    </div>
  );
}
