"use client";
import { useAccount } from "wagmi";
import { useMemo, useState } from "react";
import type { Address } from "viem";
import TokenRow, { type RowToken } from "./TokenRow";

function eth(chainId:number): RowToken {
  return { chainId, isNative:true, symbol:"ETH", decimals:18, name:"Ether" };
}

export default function SwapPanel() {
  const { address } = useAccount();

  // TEMP defaults (Mainnet ETH <> USDC)
  const [pay, setPay] = useState<RowToken>(() => ({
    chainId: 1,
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address, // USDC
    symbol: "USDC",
    decimals: 6,
    name: "USD Coin",
  }));
  const [recv, setRecv] = useState<RowToken>(() => eth(1));

  const [payAmt, setPayAmt] = useState<string>("");
  const [recvAmt, setRecvAmt] = useState<string>("");

  const [payBal, setPayBal] = useState<number>(0);

  const canSwap = useMemo(() => {
    const a = Number(payAmt || "0");
    if (!Number.isFinite(a) || a <= 0) return false;
    if (a > payBal) return false;
    return true;
  }, [payAmt, payBal]);

  function flip() {
    const tp = pay; const tr = recv;
    setPay(tr); setRecv(tp);
    setPayAmt(recvAmt); setRecvAmt(payAmt);
    // payBal will recompute when the top row re-fetches its balance
  }

  return (
    <div className="max-w-xl mx-auto space-y-3">
      <TokenRow
        title="You pay"
        token={pay}
        amount={payAmt}
        onAmount={setPayAmt}
        onComputedBalance={setPayBal}
        showMax
      />
      <div className="flex justify-center">
        <button onClick={flip} className="rounded-full px-3 py-1 bg-white/10 hover:bg-white/20 text-sm">↕ Flip</button>
      </div>
      <TokenRow
        title="You receive"
        token={recv}
        amount={recvAmt}
        onAmount={setRecvAmt}
        readOnlyAmount
      />
      <button
        className="mt-3 w-full rounded-2xl py-3 bg-white/15 hover:bg-white/25 disabled:opacity-50"
        disabled={!canSwap}
      >
        Swap (preview only)
      </button>
      <div className="text-xs opacity-60">
        <div>• MAX enabled (ERC-20 = full; native reserves a gas buffer). Balance guards on “You pay”.</div>
        <div>• Next: price impact & est. gas (1inch quote), slippage, route preview.</div>
      </div>
    </div>
  );
}
