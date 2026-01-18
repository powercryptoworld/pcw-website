"use client";
import React from "react";
import EstimateFeeButton from "@/components/EstimateFeeButton";
import ClearFeeOnAmountChange from "@/components/ClearFeeOnAmountChange";

// components/SwapCard.tsx
export default function SwapCard() {
  // --- Local state for amounts ---
  const [pay, setPay] = React.useState<string>("");
  const [receive, setReceive] = React.useState<string>("");

  // TEMP conversion (1:1). Later we’ll replace with real quotes.
  const rate = 1;

  const toNum = (v: string) => {
    if (!v) return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const fmt = (n: number) => {
    // keep simple; avoid scientific notation on small numbers
    return Number.isFinite(n) ? (n === 0 ? "" : String(n)) : "";
  };

  // typing in "You pay" updates "You receive"
  const onPayChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const v = e.target.value;
    setPay(v);
    const n = toNum(v);
    setReceive(fmt(n * rate));
  };

  // typing in "You receive" updates "You pay"
  const onReceiveChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const v = e.target.value;
    setReceive(v);
    const n = toNum(v);
    setPay(fmt(rate === 0 ? 0 : n / rate));
  };

  return (
    <section className="container pt-12 pb-28">
      <div
        className="glass"
        style={{
          width: "min(520px, 92vw)", // Shiba-like proportion
          margin: "0 auto",
          padding: 20,
        }}
      >
        {/* Network / small label */}
        <p className="label mb-4">
          Network: <strong>BNB</strong>
        </p>

        {/* You pay */}
        <div className="row">
          <label className="label" htmlFor="pay">
            You pay
          </label>
          <div className="input">
            <span style={{ marginRight: 12 }}>BNB</span>
            <input
              id="pay"
              type="number"
              inputMode="decimal"
              placeholder="0.0"
              value={pay}
              onChange={onPayChange}
              style={{
                background: "transparent",
                border: 0,
                outline: "none",
                color: "white",
                width: "100%",
              }}
            />
            <ClearFeeOnAmountChange targetId="pay" />
          </div>
        </div>

        {/* Switch */}
        <div style={{ display: "grid", placeItems: "center", margin: "10px 0" }}>
          <button
            aria-label="Flip tokens"
            className="pill"
            style={{ width: 36, height: 36, display: "grid", placeItems: "center" }}
          >
            ↑
          </button>
        </div>

        {/* You receive */}
        <div className="row">
          <label className="label" htmlFor="receive">
            You receive
          </label>
          <div className="input">
            <span style={{ marginRight: 12 }}>USDC</span>
            <input
              id="receive"
              type="number"
              inputMode="decimal"
              placeholder="0.0"
              value={receive}
              onChange={onReceiveChange}
              style={{
                background: "transparent",
                border: 0,
                outline: "none",
                color: "white",
                width: "100%",
              }}
            />
          </div>
        </div>

        {/* Slippage pills */}
        <div className="mb-4">
          <p className="label mb-2">Slippage</p>
          <p className="label mb-2">Speed</p>
          {/* Network fee row (local wallet estimate) */}
          <div className="flex items-center justify-between text-sm mt-2">
            <div className="opacity-80">Network fee (est., BNB)</div>
            <span id="wallet-fee" className="text-xs opacity-90 ml-2"></span>
            <span id="wallet-fee" className="text-xs opacity-90 ml-2"></span>
            {(() => {
              const pick = (name: string) => {
                try {
                  return eval(`typeof ${name} !== "undefined" ? ${name} : null`);
                } catch {
                  return null;
                }
              };
              const maybeTx =
                pick("builtTx") || pick("builtSwapTx") || pick("swapTx") || pick("tx") || null;
              return <EstimateFeeButton builtTx={maybeTx} symbol="BNB" compact />;
            })()}
          </div>
          <ul className="tabs">
            <li>
              <button className="pill">Slow</button>
            </li>
            <li>
              <button className="pill pill-active">Market</button>
            </li>
            <li>
              <button className="pill">Fast</button>
            </li>
          </ul>
        </div>

        {/* Swap CTA + neon bar */}
        <div className="swap-bar">
          <button className="btn btn--swap" style={{ width: "100%", padding: "14px 16px", fontWeight: 700 }}>
            Swap
          </button>
        </div>
      </div>
    </section>
  );
}
