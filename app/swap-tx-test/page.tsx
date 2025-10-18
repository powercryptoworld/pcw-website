"use client";
import React from "react";

export default function SwapTxTest() {
  const [from, setFrom] = React.useState("");
  const [amountWei, setAmountWei] = React.useState("10000000000000000"); // 0.01 BNB
  const [slippage, setSlippage] = React.useState("0.5");
  const [out, setOut] = React.useState<any>(null);
  const [err, setErr] = React.useState<string>("");

  async function build() {
    setErr(""); setOut(null);
    try {
      const url = `/api/oneinch-build-swap?from=${encodeURIComponent(from)}&amountWei=${encodeURIComponent(amountWei)}&slippage=${encodeURIComponent(slippage)}`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || data?.error) setErr(data?.error || "Failed");
      else setOut(data);
    } catch (e:any) { setErr(e?.message || "Network error"); }
  }

  return (
    <section className="container mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Build Swap Tx (BNB → USDC on BSC)</h1>

      <label className="text-sm">Your wallet (BSC)</label>
      <input value={from} onChange={(e)=>setFrom(e.target.value)}
        placeholder="0xYourAddress" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 mb-3" />

      <label className="text-sm">Amount (wei of BNB)</label>
      <input value={amountWei} onChange={(e)=>setAmountWei(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 mb-3" />

      <label className="text-sm">Slippage (%)</label>
      <input value={slippage} onChange={(e)=>setSlippage(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 mb-4" />

      <button onClick={build} disabled={!from}
        className="rounded-lg px-4 py-2 border border-white/10 bg-white/10 hover:bg-white/20">
        Build swap tx
      </button>

      {err && <p className="mt-4 text-red-400 text-sm">Error: {err}</p>}
      {out && (
        <pre className="mt-4 whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-black/40 p-3 text-sm">
{JSON.stringify(out, null, 2)}
        </pre>
      )}
    </section>
  );
}
