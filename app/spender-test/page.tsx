"use client";
import React from "react";

export default function SpenderTest() {
  const [addr, setAddr] = React.useState<string>("");
  const [err, setErr] = React.useState<string>("");

  async function load() {
    setErr(""); setAddr("");
    try {
      const res = await fetch("/api/oneinch-spender", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || data?.error) setErr(data?.error || "Failed");
      else setAddr(data.address || "");
    } catch (e:any) { setErr(e?.message || "Network error"); }
  }

  return (
    <section className="container mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold mb-4">1inch Spender (BSC)</h1>
      <button onClick={load} className="rounded-lg px-4 py-2 border border-white/10 bg-white/10 hover:bg-white/20">
        Get spender
      </button>
      {addr && <p className="mt-4 text-green-400 text-sm">Spender: {addr}</p>}
      {err && <p className="mt-4 text-red-400 text-sm">Error: {err}</p>}
    </section>
  );
}
