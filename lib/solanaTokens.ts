type JupiterToken = {
  address: string;     // mint
  chainId?: number;    // sometimes present
  decimals: number;
  name: string;
  symbol: string;
  logoURI?: string;
  tags?: string[];
};

export type SolanaToken = {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string | null;
};

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
  if (!res.ok) {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j?.error || j?.message || `HTTP ${res.status}`);
    } else {
      const t = await res.text().catch(() => "");
      throw new Error(t?.slice(0, 200) || `HTTP ${res.status}`);
    }
  }
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const t = await res.text().catch(() => "");
    throw new Error(t?.slice(0, 200) || "Response was not JSON");
  }
  return res.json();
}

/**
 * Fetch Solana tokens from Jupiter. We try verified-quality lists first,
 * then fall back to broader lists to increase coverage.
 */
export async function fetchJupiterTokens(): Promise<SolanaToken[]> {
  // Preferred, curated list:
  const urls = [
    "https://tokens.jup.ag/tokens?tags=verified,community",
    "https://tokens.jup.ag/tokens",          // broader
    "https://token.jup.ag/all",               // legacy fallback
  ];

  let lastErr: any = null;
  for (const u of urls) {
    try {
      const raw = await fetchJson(u);
      const arr: JupiterToken[] = Array.isArray(raw) ? raw : raw?.tokens || [];
      if (!Array.isArray(arr)) continue;

      // Map & dedupe by mint address
      const seen = new Set<string>();
      const mapped: SolanaToken[] = [];
      for (const t of arr) {
        const mint = (t as any).address || (t as any).mint || "";
        if (!mint) continue;
        if (seen.has(mint)) continue;
        seen.add(mint);
        mapped.push({
          mint,
          symbol: t.symbol,
          name: t.name,
          decimals: Number(t.decimals ?? 9),
          logoURI: t.logoURI || null,
        });
      }
      if (mapped.length > 0) return mapped;
    } catch (e: any) {
      lastErr = e;
      continue;
    }
  }
  throw new Error(lastErr?.message || "Failed to fetch Jupiter token list");
}
