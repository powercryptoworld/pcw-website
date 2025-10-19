"use client";
import React, { useState } from "react";

export default function NetTestPage() {
  const [out, setOut] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setErr(null);
    setOut(null);
    try {
      const res = await fetch("/api/net-test", { method: "GET" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "net test failed");
      setOut(data);
    } catch (e: any) {
      setErr(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full flex items-start justify-center pt-16 px-4">
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h1 className="text-xl font-semibold mb-4">Network Test — Jupiter Hosts</h1>
        <button
          onClick={run}
          disabled={loading}
          className="rounded-xl px-4 py-2 border border-white/15 bg-white/10 hover:bg-white/20 disabled:opacity-50"
        >
          {loading ? "Testing…" : "Run tests"}
        </button>

        {err && (
          <div className="mt-4 text-sm text-red-300">
            Error: <span className="font-mono">{err}</span>
          </div>
        )}

        {out && (
          <pre className="mt-4 max-h-[60vh] overflow-auto rounded-lg bg-black/50 p-3 text-xs">
{JSON.stringify(out, null, 2)}
          </pre>
        )}
      </div>
    </main>
  );
}
