"use client";

import React from "react";
import EstimateFeeButton from "@/components/EstimateFeeButton";
import { parseEther } from "viem";
import { useAccount } from "wagmi";

type BuiltTx = any;

export default function FeeEstimateTestPage() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = React.useState("0.01"); // BNB amount as decimal
  const [builtTx, setBuiltTx] = React.useState<BuiltTx | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function buildTx() {
    try {
      setError(null);
      setBuiltTx(null);

      if (!isConnected || !address) {
        throw new Error("Connect wallet first");
      }

      setLoading(true);

      // Convert decimal BNB -> wei for the API (?amountWei=)
      let amountWei: string;
      try {
        amountWei = parseEther(amount).toString();
      } catch {
        throw new Error("Invalid BNB amount");
      }

      const url = `/api/oneinch-build-swap?amountWei=${encodeURIComponent(
        amountWei
      )}&from=${encodeURIComponent(address)}`;

      const res = await fetch(url, {
        method: "GET",
        headers: { accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Build failed (${res.status}): ${t}`);
      }
      const json = await res.json();
      // Some implementations return { tx: {...} }. Use tx if present, else the root.
      setBuiltTx(json?.tx ?? json);
    } catch (e: any) {
      setError(e?.message || "Failed to build tx");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container max-w-2xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Fee Estimate Test — BNB→USDC (BSC)</h1>

      <div className="rounded-2xl p-4 border border-white/10 bg-white/5 backdrop-blur space-y-3">
        <label className="block text-sm opacity-90">Amount (BNB)</label>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          placeholder="0.00"
          className="w-full rounded-xl px-3 py-2 bg-black/30 border border-white/10 outline-none"
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={buildTx}
            disabled={loading}
            className="rounded-xl px-3 py-2 backdrop-blur border border-white/10 hover:border-white/20 transition"
          >
            {loading ? "Building…" : "Build swap tx"}
          </button>

          {/* Once built, you can estimate fee with the wallet even if 1inch gas=0 */}
          <EstimateFeeButton builtTx={builtTx} symbol="BNB" compact />
        </div>

        {!isConnected && (
          <div className="text-sm text-yellow-300/90">
            Connect your wallet to build the swap.
          </div>
        )}
        {error && <div className="text-sm text-red-400" role="alert">{error}</div>}
      </div>

      <div className="rounded-2xl p-4 border border-white/10 bg-white/5 backdrop-blur">
        <div className="text-sm opacity-80 mb-2">Built tx JSON</div>
        <pre className="text-xs whitespace-pre-wrap break-all">
{builtTx ? JSON.stringify(builtTx, null, 2) : "—"}
        </pre>
      </div>
    </main>
  );
}
