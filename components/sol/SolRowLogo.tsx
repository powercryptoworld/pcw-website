"use client";
import React from "react";

export function SolRowLogo({ uri, alt, mint, symbol, name }: { uri?: string | null; alt?: string; mint?: string; symbol?: string; name?: string }) {
  const [fallback, setFallback] = React.useState<string>("");

  React.useEffect(() => {
    let dead = false;
    const validUri = !!(uri && typeof uri === "string" && uri.startsWith("http"));

    // If we already have a valid URI, no need to fetch
    if (validUri) return;

    // Try fallback: even without mint, native SOL will be handled server-side via symbol=name
    (async () => {
      try {
        const qs = new URLSearchParams();
        if (mint) qs.set("mint", mint);
        if (symbol) qs.set("symbol", symbol);
        if (name) qs.set("name", name);
        const r = await fetch(`/api/sol-logo?${qs.toString()}`, { cache: "force-cache" });
        if (!dead && r.ok) {
          const j = await r.json();
          if (j?.url) setFallback(j.url);
        }
      } catch {}
    })();

    return () => { dead = true; };
  }, [uri, mint, symbol, name]);

  const src = (uri && typeof uri === "string" && uri.startsWith("http")) ? uri : (fallback || "");

  return (
    <div className="w-8 h-8 rounded overflow-hidden bg-white/10 border border-white/10 shrink-0">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt || "token"} className="w-full h-full object-cover" />
      ) : null}
    </div>
  );
}
