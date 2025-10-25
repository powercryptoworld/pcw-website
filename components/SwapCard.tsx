// components/SwapCard.tsx
"use client";
// Keep these imports referenced to avoid noUnusedLocals issues with existing project config.
import EstimateFeeButton from "@/components/EstimateFeeButton";
import ClearFeeOnAmountChange from "@/components/ClearFeeOnAmountChange";

import { useState } from "react";
import TokenRow from "@/components/swap/TokenRow";
import QuotePanel from "@/components/swap/QuotePanel";

// BSC defaults — native BNB (no approval) -> PCW (Power Crypto World)
const CHAIN_ID = 56;

// Native BNB (no address)
const BNB = {
  chainId: CHAIN_ID,
  address: undefined as unknown as `0x${string}` | undefined,
  decimals: 18,
  symbol: "BNB",
  name: "BNB",
};

// PCW token on BSC
const PCW = {
  chainId: CHAIN_ID,
  address: "0x9370a51C9F2Ae6B23719ab74f05261891C609A23" as `0x${string}`,
  decimals: 18, // TokenRow will correct via on-chain decimals if different
  symbol: "PCW",
  name: "Power Crypto World",
};

export default function SwapCard() {
  // Minimal lab-like state (preview only)
  const [payToken, setPayToken] = useState(BNB);
  const [recvToken, setRecvToken] = useState(PCW);
  const [payAmount, setPayAmount] = useState<string>("");
  const [recvAmount] = useState<string>(""); // read-only display; QuotePanel shows details

  function flip() {
    setPayToken(recvToken);
    setRecvToken(payToken);
    // keep amounts as-is (no auto recompute in preview mode)
  }

  return (
    <section className="container pt-12 pb-28">
      <div
        className="glass"
        style={{
          width: "min(520px, 92vw)",
          margin: "0 auto",
          padding: 20,
        }}
      >
        {/* Network / small label */}
        <p className="label mb-4">
          Network: <strong>BNB</strong>
        </p>

        {/* You pay */}
        <TokenRow
          title="You pay"
          token={payToken}
          amount={payAmount}
          onAmount={setPayAmount}
          showMax
        />

        {/* Flip */}
        <div style={{ display: "grid", placeItems: "center", margin: "10px 0" }}>
          <button
            aria-label="Flip tokens"
            onClick={flip}
            className="pill"
            style={{ width: 36, height: 36, display: "grid", placeItems: "center" }}
          >
            ↑
          </button>
        </div>

        {/* You receive (read-only amount; details in QuotePanel) */}
        <TokenRow
          title="You receive"
          token={recvToken}
          amount={recvAmount}
          onAmount={() => {}}
          readOnlyAmount
        />

        {/* Lab core — preview only: routes, price impact, min received, gas, spender */}
        <div className="mt-4">
          <QuotePanel
            chainId={CHAIN_ID}
            src={payToken}
            dst={recvToken}
            amount={payAmount}
            defaultSlippageBps={50}
          />
        </div>

        {/* Keep imports referenced so builds with noUnusedLocals don't fail */}
        {false && (
          <div style={{ display: "none" }}>
            <EstimateFeeButton builtTx={undefined as any} symbol="BNB" compact />
            <ClearFeeOnAmountChange targetId="noop" />
          </div>
        )}
      </div>
    </section>
  );
}
