"use client";

import { useState } from "react";

const TOKENS = ["BNB", "USDC", "USDT", "ETH", "SOL"];

export default function SwapCard() {
  const [pay, setPay] = useState("BNB");
  const [receive, setReceive] = useState("USDC");
  const [slip, setSlip] = useState<"slow" | "mkt" | "fast">("mkt");

  return (
    <div style={{ padding: 18 }}>
      {/* top row */}
      <div
        className="mb-5"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div className="text-sm" style={{ color: "#b7c5e3" }}>
          <span style={{ color: "#9fb0cc" }}>Network: </span>
          <span style={{ color: "#ffffff", fontWeight: 600 }}>BNB</span>
        </div>

        {/* local tabs (visual only) */}
        <nav
          aria-label="Swap tabs"
          className="tabs"
          style={{ display: "flex", gap: 8 }}
        >
          {["Swap", "Buy PCW", "NFTs", "Giveaway", "Token Burning"].map(
            (x) => (
              <span
                key={x}
                className={`pill ${x === "Swap" ? "pill-active" : ""}`}
                aria-current={x === "Swap" ? "page" : undefined}
              >
                {x}
              </span>
            )
          )}
        </nav>
      </div>

      {/* You pay */}
      <div className="row" role="group" aria-labelledby="label-pay">
        <label id="label-pay" className="label">
          You pay
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "140px 1fr",
            gap: 12,
          }}
        >
          <select
            className="input"
            value={pay}
            onChange={(e) => setPay(e.target.value)}
            aria-label="Select pay token"
          >
            {TOKENS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <input
            className="input"
            inputMode="decimal"
            placeholder="0.0"
            aria-label="Pay amount"
          />
        </div>
      </div>

      {/* flip */}
      <div className="mb-4" style={{ display: "flex", justifyContent: "center" }}>
        <div className="pill" aria-hidden>
          ↑
        </div>
      </div>

      {/* You receive */}
      <div className="row" role="group" aria-labelledby="label-receive">
        <label id="label-receive" className="label">
          You receive
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "140px 1fr",
            gap: 12,
          }}
        >
          <select
            className="input"
            value={receive}
            onChange={(e) => setReceive(e.target.value)}
            aria-label="Select receive token"
          >
            {TOKENS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <input
            className="input"
            inputMode="decimal"
            placeholder="0.0"
            aria-label="Receive amount"
          />
        </div>
      </div>

      {/* slippage + fee */}
      <div
        className="mb-5"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="text-xs" style={{ color: "#a8c3ff", marginRight: 4 }}>
            Slippage
          </span>
          <button
            onClick={() => setSlip("slow")}
            className={`pill ${slip === "slow" ? "pill-active" : ""}`}
            aria-pressed={slip === "slow"}
          >
            Slow
          </button>
          <button
            onClick={() => setSlip("mkt")}
            className={`pill ${slip === "mkt" ? "pill-active" : ""}`}
            aria-pressed={slip === "mkt"}
          >
            Market
          </button>
          <button
            onClick={() => setSlip("fast")}
            className={`pill ${slip === "fast" ? "pill-active" : ""}`}
            aria-pressed={slip === "fast"}
          >
            Fast
          </button>
        </div>
        <div className="text-xs" style={{ color: "#9fb8ff", opacity: 0.9 }}>
          0.25%
        </div>
      </div>

      {/* swap */}
      <div className="swap-bar">
        <button className="btn btn--swap" aria-label="Execute swap">
          Swap
        </button>
      </div>
    </div>
  );
}
