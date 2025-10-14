"use client";

import { useState } from "react";

const TOKENS = ["BNB", "USDC", "USDT", "ETH", "SOL"];
const TABS = ["Swap", "Buy PCW", "NFTs", "Giveaway", "Token Burning"];

export default function SwapCard() {
  const [pay, setPay] = useState("BNB");
  const [receive, setReceive] = useState("USDC");
  const [slip, setSlip] = useState<"slow" | "mkt" | "fast">("mkt");

  return (
    <div className="p-6">
      {/* Tabs + Connect */}
      <div className="mb-4" aria-label="Sections">
        <div className="tabs">
          {TABS.map((x) => (
            <button key={x} className={`pill ${x === "Swap" ? "pill-active" : ""}`} role="tab">
              {x}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <button className="pill">Connect</button>
        </div>
      </div>

      {/* Network */}
      <div className="row">
        <span className="label">Network: <strong>BNB</strong></span>
        <div className="input" aria-label="Selected network">
          <span className="amount">BNB</span>
          <span className="sub">Smart Chain</span>
        </div>
      </div>

      {/* You pay */}
      <label className="label">You pay</label>
      <div className="mb-4" style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "12px" }}>
        <select className="input" value={pay} onChange={(e) => setPay(e.target.value)}>
          {TOKENS.map((t) => (<option key={t}>{t}</option>))}
        </select>
        <input className="input" placeholder="0.0" />
      </div>

      {/* Flip */}
      <div className="mb-4" style={{ display: "flex", justifyContent: "center" }}>
        <div className="pill" aria-hidden>↑</div>
      </div>

      {/* You receive */}
      <label className="label">You receive</label>
      <div className="mb-6" style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "12px" }}>
        <select className="input" value={receive} onChange={(e) => setReceive(e.target.value)}>
          {TOKENS.map((t) => (<option key={t}>{t}</option>))}
        </select>
        <input className="input" placeholder="0.0" />
      </div>

      {/* Slippage + fee */}
      <div className="mb-6" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="label" style={{ marginRight: 4 }}>Slippage</span>
          <button onClick={() => setSlip("slow")} className={`pill ${slip === "slow" ? "pill-active" : ""}`}>Slow</button>
          <button onClick={() => setSlip("mkt")}  className={`pill ${slip === "mkt"  ? "pill-active" : ""}`}>Market</button>
          <button onClick={() => setSlip("fast")} className={`pill ${slip === "fast" ? "pill-active" : ""}`}>Fast</button>
        </div>
        <div className="text-xs text-muted">0.25%</div>
      </div>

      {/* Swap */}
      <button className="btn btn--swap">Swap</button>
    </div>
  );
}
