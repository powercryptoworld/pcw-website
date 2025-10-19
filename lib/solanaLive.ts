export type LiveSolMeta = {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string | null;
  source: "jup" | "dex" | "fallback";
};

const FALLBACK = (mint: string): LiveSolMeta => ({
  mint,
  symbol: "UNKNOWN",
  name: "Unknown Solana Token",
  decimals: 9,
  logoURI: null,
  source: "fallback",
});

async function tryJson(url: string, timeoutMs = 1200): Promise<any | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, { cache: "no-store", signal: ctrl.signal as any });
    clearTimeout(t);
    const ct = res.headers.get("content-type") || "";
    if (!res.ok || !ct.includes("application/json")) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function liveSolanaMeta(mintRaw: string): Promise<LiveSolMeta> {
  const mint = (mintRaw || "").trim();
  if (!mint) return FALLBACK("");

  // 1) Jupiter (object endpoints then cached list)
  {
    const urls = [
      `https://token.jup.ag/token/${encodeURIComponent(mint)}`,
      `https://tokens.jup.ag/token/${encodeURIComponent(mint)}`,
    ];
    for (const u of urls) {
      const j = await tryJson(u, 1200);
      if (j && (j.address || j.mint)) {
        const isMe = String(j.address || j.mint || "").toLowerCase() === mint.toLowerCase();
        if (isMe) {
          return {
            mint,
            symbol: typeof j.symbol === "string" && j.symbol.trim() ? j.symbol : "UNKNOWN",
            name:   typeof j.name   === "string" && j.name.trim()   ? j.name   : "Unknown Solana Token",
            decimals: typeof j.decimals === "number" ? j.decimals : 9,
            logoURI: typeof j.logoURI === "string" && j.logoURI.trim() ? j.logoURI : null,
            source: "jup",
          };
        }
      }
    }
    // cached array
    const list = await tryJson(`https://cache.jup.ag/tokens`, 1200);
    if (Array.isArray(list)) {
      const m = mint.toLowerCase();
      const row = list.find((t: any) =>
        (typeof t?.address === "string" && t.address.toLowerCase() === m) ||
        (typeof t?.mint    === "string" && t.mint.toLowerCase()    === m)
      );
      if (row) {
        return {
          mint,
          symbol: typeof row.symbol === "string" && row.symbol.trim() ? row.symbol : "UNKNOWN",
          name:   typeof row.name   === "string" && row.name.trim()   ? row.name   : "Unknown Solana Token",
          decimals: typeof row.decimals === "number" ? row.decimals : 9,
          logoURI: typeof row.logoURI === "string" && row.logoURI.trim() ? row.logoURI : null,
          source: "jup",
        };
      }
    }
  }

  // 2) Dexscreener (tokens → search) — both time-boxed
  {
    const toks = await tryJson(`https://api.dexscreener.com/latest/dex/tokens/solana/${encodeURIComponent(mint)}`, 1200);
    if (toks && Array.isArray(toks.pairs)) {
      const m = mint.toLowerCase();
      for (const p of toks.pairs) {
        const bt = p?.baseToken || {};
        const qt = p?.quoteToken || {};
        if (String(bt.address || "").toLowerCase() === m) {
          return { mint, symbol: bt.symbol || "UNKNOWN", name: bt.name || "Unknown Solana Token", decimals: 9, logoURI: null, source: "dex" };
        }
        if (String(qt.address || "").toLowerCase() === m) {
          return { mint, symbol: qt.symbol || "UNKNOWN", name: qt.name || "Unknown Solana Token", decimals: 9, logoURI: null, source: "dex" };
        }
      }
    }
    const srch = await tryJson(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(mint)}`, 1200);
    if (srch && Array.isArray(srch.pairs)) {
      const m = mint.toLowerCase();
      for (const p of srch.pairs) {
        if (String(p?.chainId || "").toLowerCase() !== "solana") continue;
        const bt = p?.baseToken || {};
        const qt = p?.quoteToken || {};
        if (String(bt.address || "").toLowerCase() === m) {
          return { mint, symbol: bt.symbol || "UNKNOWN", name: bt.name || "Unknown Solana Token", decimals: 9, logoURI: null, source: "dex" };
        }
        if (String(qt.address || "").toLowerCase() === m) {
          return { mint, symbol: qt.symbol || "UNKNOWN", name: qt.name || "Unknown Solana Token", decimals: 9, logoURI: null, source: "dex" };
        }
      }
    }
  }

  return FALLBACK(mint);
}
