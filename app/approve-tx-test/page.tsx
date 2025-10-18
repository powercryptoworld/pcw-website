"use client";
import React from "react";

const BSC_USDC = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";

export default function ApproveTxTest() {
  const [token, setToken] = React.useState(BSC_USDC);
  const [amount, setAmount] = React.useState("0"); // 0 = unlimited
  const [loading, setLoading] = React.useState(false);
  const [out, setOut] = React.useState<any>(null);
  const [err, setErr] = React.useState<string>("");

  async function build() {
    setLoading(true); setErr(""); setOut(null);
    try {
      const url = `/api/oneinch-approve-tx?token=${encodeURIComponent(token)}&amount=${encodeURIComponent(amount)}`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || data?.error) setErr(data?.error || "Failed");
      else setOut(data);
    } catch (e:any) { setErr(e?.message || "Network error"); }
    finally { setLoading(false); }
  }

  return (
    <section className="container mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Approve Tx Test (BSC)</h1>
      <div className="grid gap-3">
        <label className="text-sm">Token (ERC-20)</label>
        <input value={token} onChange={(e)=>setToken(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2" />
        <label className="text-sm">Amount (wei, 0 = unlimited)</label>
        <input value={amount} onChange={(e)=>setAmount(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2" />
        <button onClick={build} disabled={loading}
          className="rounded-lg px-4 py-2 border border-white/10 bg-white/10 hover:bg-white/20">
          {loading ? "Building..." : "Build approve tx"}
        </button>
      </div>
      {err && <p className="mt-4 text-red-400 text-sm">Error: {err}</p>}
      {out && (
        <pre className="mt-4 whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-black/40 p-3 text-sm">
{JSON.stringify(out, null, 2)}
        </pre>
      )}
    </section>
  );
}
