"use client";

import React from "react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";

export default function BuildTxButton() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = React.useState(false);
  const [ok, setOk] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function buildTx() {
    setErr(null);
    setOk(false);
    try {
      if (!isConnected || !address) throw new Error("Connect wallet first");

      const input = document.getElementById("pay") as HTMLInputElement | null;
      if (!input) throw new Error("Amount input not found");
      const amountStr = (input.value || "").trim();
      if (!amountStr) throw new Error("Enter amount");
      const amountWei = parseEther(amountStr).toString();

      const url = `/api/oneinch-build-swap?amountWei=${encodeURIComponent(
        amountWei
      )}&from=${encodeURIComponent(address)}`;

      setLoading(true);
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
      const tx = json?.tx ?? json;

      (window as any).__lastBuiltTx = tx;
      setOk(true);
      // Auto-clear the checkmark after 1.5s
      setTimeout(() => setOk(false), 1500);
    } catch (e: any) {
      setErr(e?.message || "Failed to build");
    } finally {
      setLoading(false);
    }
  }

  const btnClass =
    "rounded-xl px-3 py-2 backdrop-blur border border-white/10 hover:border-white/20 transition text-xs";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={buildTx}
        disabled={loading}
        className={btnClass}
        title="Build swap transaction (no send)"
      >
        {loading ? "Building…" : ok ? "✓ Built" : "Build tx"}
      </button>
      {/* Only show errors; no extra 'Built!' text in the row */}
      {err && (
        <span className="text-xs text-red-400" role="alert">
          {err}
        </span>
      )}
    </div>
  );
}
