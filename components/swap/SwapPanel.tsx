"use client";
import { useAccount } from "wagmi";
import { useState } from "react";
import type { Address } from "viem";
import TokenRow, { type RowToken } from "./TokenRow";

function eth(chainId:number): RowToken {
  // lightweight defaults; symbol/decimals can be refined per chain later
  return { chainId, isNative:true, symbol:"ETH", decimals:18, name:"Ether" };
}

export default function SwapPanel() {
  const { address } = useAccount();

  // TEMP defaults for testing (Ethereum mainnet ETH <> USDC)
  const [pay, setPay] = useState<RowToken>(() => eth(1));
  const [recv, setRecv] = useState<RowToken>(() => ({
    chainId: 1,
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address, // USDC
    symbol: "USDC",
    decimals: 6,
    name: "USD Coin",
  }));

  const [payAmt, setPayAmt] = useState<string>("");
  const [recvAmt, setRecvAmt] = useState<string>("");

  function flip() {
    const tp = pay; const tr = recv;
    setPay(tr); setRecv(tp);
    setPayAmt(recvAmt); setRecvAmt(payAmt);
  }

  return (
    <div className="max-w-xl mx-auto space-y-3">
      <TokenRow title="You pay" token={pay} amount={payAmt} onAmount={setPayAmt} onMax={()=>{/* wired in Step 2 */}} />
      <div className="flex justify-center">
        <button onClick={flip} className="rounded-full px-3 py-1 bg-white/10 hover:bg-white/20 text-sm">↕ Flip</button>
      </div>
      <TokenRow title="You receive" token={recv} amount={recvAmt} onAmount={setRecvAmt} readOnlyAmount />
      <button className="mt-3 w-full rounded-2xl py-3 bg-white/15 hover:bg-white/25 disabled:opacity-50">
        Swap (preview only)
      </button>
      <div className="text-xs opacity-60">
        <div>• Balances + USD estimate (DexScreener). No quotes/fees yet.</div>
        <div>• Next: MAX, guards, price impact & gas (1inch), slippage.</div>
      </div>
    </div>
  );
}
