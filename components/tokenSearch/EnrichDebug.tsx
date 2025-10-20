"use client";
import React, { useEffect, useRef, useState } from "react";

type LogItem = {
  ts: number;
  url: string;
  ok: boolean;
  status: number;
  body?: any;
};

export default function EnrichDebug() {
  // Only enable when URL has ?debug=1
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const installed = useRef(false);

  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      setEnabled(p.get("debug") === "1");
    } catch {}
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (installed.current) return;
    installed.current = true;

    const originalFetch = window.fetch;
    async function wrappedFetch(input: RequestInfo | URL, init?: RequestInit) {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : String(input);
      const isEnrich = url.includes("/api/sol-meta-live?mint=");
      const res = await originalFetch(input as any, init as any);
      if (isEnrich) {
        let body: any = undefined;
        try { body = await res.clone().json(); } catch {}
        setLogs((prev) => [
          { ts: Date.now(), url, ok: res.ok, status: res.status, body },
          ...prev,
        ].slice(0, 10));
      }
      return res;
    }

    (window as any).fetch = wrappedFetch;
    return () => { (window as any).fetch = originalFetch; };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 z-[200] rounded-xl border border-white/20 bg-zinc-900/80 px-3 py-2 text-xs text-white"
        title="Toggle Enrich debug overlay"
      >
        {open ? "Hide Enrich Debug" : "Show Enrich Debug"}
      </button>
      {open && (
        <div className="fixed bottom-16 right-4 z-[200] max-h-[50vh] w-[360px] overflow-auto rounded-2xl border border-white/20 bg-black/70 p-3 text-xs text-white">
          <div className="mb-2 font-semibold">Last Enrich calls</div>
          {logs.length === 0 && <div className="text-white/70">No calls yet.</div>}
          {logs.map((l, i) => (
            <div key={i} className="mb-3 rounded-lg border border-white/10 bg-white/5 p-2">
              <div className="mb-1 text-[11px] text-white/70">{new Date(l.ts).toLocaleTimeString()}</div>
              <div className="mb-1 break-all">{l.url}</div>
              <div className="mb-1">status: {l.status} {l.ok ? "(ok)" : "(error)"}</div>
              <pre className="whitespace-pre-wrap break-words text-[11px]">
{JSON.stringify(l.body, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
