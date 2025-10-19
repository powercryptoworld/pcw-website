"use client";

import React from "react";
import { useWalletClient, usePublicClient, useChainId } from "wagmi";
import { estimateFeeFromBuiltTx } from "@/lib/estimateFee";
import BuildTxButton from "@/components/BuildTxButton";

type Props = {
  builtTx: any | null | undefined;
  symbol?: string;
  onEstimated?(feeEth: string): void;
  compact?: boolean;
};

export default function EstimateFeeButton({
  builtTx,
  symbol = "BNB",
  onEstimated,
  compact = false,
}: Props) {
  const { data: walletClient } = useWalletClient();
  const fallbackChainId = useChainId();
  const publicClient = usePublicClient({
    chainId: walletClient?.chain?.id ?? fallbackChainId,
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [usedFallback, setUsedFallback] = React.useState<boolean>(false);

  async function onClick() {
    setError(null);
    setUsedFallback(false);
    try {
      if (!publicClient) throw new Error("No public client");
      if (!walletClient) throw new Error("Connect wallet first");

      // Use tx from prop or global (set by BuildTxButton)
      const globalTx =
        typeof window !== "undefined" ? (window as any).__lastBuiltTx ?? null : null;
      const effectiveTx = builtTx ?? globalTx;
      if (!effectiveTx?.to || !effectiveTx?.data) throw new Error("Build swap first");

      setLoading(true);
      const res = await estimateFeeFromBuiltTx(publicClient, walletClient, effectiveTx);
      const trimmed = Number(res.feeEth).toFixed(6);

      // Mirror into the label area (left side)
      try {
        const el = document.getElementById("wallet-fee");
        if (el) el.textContent = `~${trimmed} ${symbol}${res.usedFallback ? " (fallback)" : ""}`;
      } catch {}

      setUsedFallback(res.usedFallback === true);
      onEstimated?.(trimmed);
    } catch (e: any) {
      setError(e?.message || "Failed to estimate");
    } finally {
      setLoading(false);
    }
  }

  const btnClass =
    "rounded-xl px-3 py-2 backdrop-blur border border-white/10 hover:border-white/20 transition " +
    (compact ? "text-xs" : "text-sm");

  return (
    <div className="flex items-center gap-3">
      {/* Build the swap tx (no send) */}
      <BuildTxButton />

      {/* Estimate fee using wallet + public client */}
      <button
        type="button"
        className={btnClass}
        onClick={onClick}
        disabled={loading}
        aria-label="Estimate network fee with wallet"
        title="Estimate network fee with wallet"
      >
        {loading ? "Estimating…" : "Estimate fee"}
      </button>

      {/* No inline fee here anymore; value shows next to the label on the left */}
      {error && (
        <span className="text-xs text-red-400" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
