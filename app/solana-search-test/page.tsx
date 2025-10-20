"use client";
import { useState } from "react";

export default function SolanaSearchTest() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setErr(null);
    setItems([]);
    try {
      const r = await fetch(`/api/sol-search?q=${encodeURIComponent(q)}`, {
        cache: "no-store",
      });
      const j = await r.json();
      setItems(Array.isArray(j?.items) ? j.items : []);
      if ((!j?.items || j.items.length === 0) && j?.error) {
        setErr(String(j.error));
      }
    } catch (e: any) {
      setErr(e?.message || "fetch failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Solana Search — API Probe</h1>
      <div className="flex gap-2 mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try: USDC or SOL"
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={run}
          disabled={loading || !q.trim()}
          className="border rounded px-4 py-2"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {err && (
        <div className="mb-3 text-red-600">
          Error: {err}
        </div>
      )}

      <div className="text-sm text-gray-600 mb-2">
        Showing up to 50 results. Data from /api/sol-search with multi-source + local fallback.
      </div>

      {items.length === 0 ? (
        <div className="text-gray-500">No results.</div>
      ) : (
        <ul className="space-y-2">
          {items.map((t, i) => (
            <li key={t.mint || i} className="border rounded p-2 flex items-center gap-3">
              {t.logoURI ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.logoURI} alt={t.symbol || "logo"} width={24} height={24} />
              ) : (
                <div className="w-6 h-6 rounded bg-gray-200" />
              )}
              <div className="flex-1">
                <div className="font-medium">{t.symbol || "UNKNOWN"} — {t.name || "Token"}</div>
                <div className="text-xs break-all text-gray-600">mint: {t.mint}</div>
              </div>
              <div className="text-xs text-gray-500">
                decimals: {t.decimals ?? "—"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
