"use client";

// Home (/): render the exact working swap composition from Swap Lab,
// without creating or touching any other files.
// Background + neon overlay preserved from your current page.tsx.

import React, { useEffect, useMemo, useState } from "react";
import TokenRow from "@/components/swap/TokenRow";
import QuotePanel from "@/components/swap/QuotePanel";
import type { Address } from "viem";

// === Minimal EVM-only initial tokens (same as swap-lab) ===
type Addr = `0x${string}`;
type TokenRef = { chainId: number; address: Addr; decimals: number; symbol?: string; name?: string; logoURI?: string };

const USDC_BY_CHAIN: Record<number, TokenRef> = {
  1:   { chainId: 1, address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6,  symbol: "USDC", name: "USD Coin" },
  56:  { chainId: 56, address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18, symbol: "USDC", name: "USD Coin" },
  137: { chainId: 137, address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", decimals: 6,  symbol: "USDC", name: "USD Coin" },
  8453:{ chainId: 8453,address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6,  symbol: "USDC", name: "USD Coin" },
  42161:{ chainId: 42161,address: "0xaf88d065e77c8C2239327C5EDb3A432268e5831", decimals: 6, symbol: "USDC", name: "USD Coin" },
  10:  { chainId: 10, address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", decimals: 6,  symbol: "USDC", name: "USD Coin" },
};

const WETH_MAINNET: TokenRef = {
  chainId: 1,
  address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  decimals: 18,
  symbol: "WETH",
  name: "Wrapped Ether",
};

// Debounce helper (identical behavior to swap-lab)
function useDebounced<T>(value: T, ms = 180) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function Page() {
  // Keep the fixed hero background & neon overlay exactly as your current page:
  const HeroBg = (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -6,
        backgroundImage: "url(/swap-hero.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center 55%",
        backgroundRepeat: "no-repeat",
        filter: "saturate(115%) brightness(0.95)",
        pointerEvents: "none",
      }}
    />
  );

  const NeonOverlay = <div className="swap-vfx" aria-hidden />;

  // === Minimal EVM-only wiring (same as swap-lab) ===
  const [chainId] = useState<number>(1); // keep mainnet for STEP 3A (chain switching later)
  const [payToken, setPayToken] = useState<TokenRef>(WETH_MAINNET);
  const [receiveToken, setReceiveToken] = useState<TokenRef>(USDC_BY_CHAIN[1]);

  const [payAmount, setPayAmount] = useState<string>("0.00");
  const [receiveAmount, setReceiveAmount] = useState<string>("");

  const [mode, setMode] = useState<"pay" | "receive">("pay");

  const debouncedPay = useDebounced(payAmount);
  const debouncedReceive = useDebounced(receiveAmount);

  const src = mode === "pay" ? payToken : receiveToken;
  const dst = mode === "pay" ? receiveToken : payToken;
  const humanAmount = mode === "pay" ? debouncedPay : debouncedReceive;

  // derive opposite field (mirrors swap-lab logic) via a tiny bridge
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<any>).detail;
      if (!detail) return;
      const { dstAmount, dstDecimals } = detail as { dstAmount?: string; dstDecimals?: number };
      if (!dstAmount || !dstDecimals) return;
      const human = Number(dstAmount) / 10 ** (dstDecimals ?? 18);
      let out = human
        .toLocaleString(undefined, { maximumFractionDigits: Math.min(8, dstDecimals ?? 8) })
        .replace(/,/g, "");
      out = out.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "").replace(/\.$/, "");
      if (mode === "pay") {
        if (out !== receiveAmount) setReceiveAmount(out);
      } else {
        if (out !== payAmount) setPayAmount(out);
      }
    };
    window.addEventListener("pcw:quote:dst", handler as EventListener);
    return () => window.removeEventListener("pcw:quote:dst", handler as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, dst.decimals]);

  const flip = () => {
    setPayToken(receiveToken);
    setReceiveToken(payToken);
    setPayAmount(receiveAmount || "");
    setReceiveAmount(payAmount || "");
  };

  const topRow = (
    <TokenRow
      title="You pay"
      token={{ ...payToken, chainId: payToken.chainId, symbol: payToken.symbol ?? "SRC" } as any}
      amount={payAmount}
      onAmount={(v: string) => { setMode("pay"); setPayAmount(v); }}
      onComputedBalance={() => {}}
      showMax
    />
  );

  const bottomRow = (
    <TokenRow
      title="You receive"
      token={{ ...receiveToken, chainId: receiveToken.chainId, symbol: receiveToken.symbol ?? "DST" } as any}
      amount={receiveAmount}
      onAmount={(v: string) => { setMode("receive"); setReceiveAmount(v); }}
      onComputedBalance={() => {}}
      showMax
    />
  );

  return (
    <>
      {HeroBg}
      {NeonOverlay}

      <div className="mx-auto max-w-xl p-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4">
          {topRow}

          <div className="flex items-center justify-between my-2">
            <button
              onClick={flip}
              className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20"
              title="Flip tokens and amounts"
            >
              Flip
            </button>

            <button
              onClick={() => setMode((m) => (m === "pay" ? "receive" : "pay"))}
              className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20"
              title={mode === "pay" ? "Switch: set output" : "Switch: set input"}
            >
              {mode === "pay" ? "⇄ Set output" : "⇄ Set input"}
            </button>
          </div>

          {bottomRow}

          <QuotePanel
            chainId={chainId}
            src={payToken as any}
            dst={receiveToken as any}
            amount={mode === "pay" ? payAmount : receiveAmount}
            defaultSlippageBps={50}
          />

          <QuoteEventBridge chainId={chainId} src={payToken} dst={receiveToken} amount={mode === "pay" ? payAmount : receiveAmount} />
        </div>
      </div>
    </>
  );
}

/**
 * QuoteEventBridge:
 * Minimal, non-invasive placeholder so STEP 3A stays single-file.
 * You can remove later when we wire direct state.
 */
function QuoteEventBridge(props: { chainId: number; src: TokenRef; dst: TokenRef; amount: string }) {
  useEffect(() => {
    const el = document.getElementById("wallet-fee");
    if (!el) return;
    const obs = new MutationObserver(() => {});
    obs.observe(el, { childList: true, subtree: true, characterData: true });
    return () => obs.disconnect();
  }, [props.chainId, props.src?.address, props.dst?.address, props.amount]);

  return null;
}
