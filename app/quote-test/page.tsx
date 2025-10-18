"use client";
import React from "react";

export default function QuoteTestPage() {
  const [amount, setAmount] = React.useState("0.1");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function getQuote() {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`/api/quote-1inch?amount=${encodeURIComponent(amount)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) setError(data?.error || "Quote failed");
      else setResult(data);
    } catch (e: any) {
      setError(e?.message || "Network error");
    } finally { setLoading(false); }
  }

  return (
    <section className="container mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold mb-4">1inch Quote Test (BSC BNB → USDC)</h1>
      <label className="block mb-2">BNB amount</label>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.1"
        className="w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur px-3 py-2 mb-4"
      />
      <button onClick={getQuote} disabled={loading}
        className="rounded-lg px-4 py-2 border border-white/10 bg-white/10 hover:bg-white/20">
        {loading ? "Loading..." : "Get quote"}
      </button>
      {error && <p className="mt-4 text-red-400">Error: {error}</p>}
      {result && (
        <pre className="mt-4 whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-black/40 p-3 text-sm">
{JSON.stringify(result, null, 2)}
        </pre>
      )}
    </section>
  );
}
