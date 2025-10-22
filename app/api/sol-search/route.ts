import { NextResponse } from "next/server";

type SolItem = {
  mint: string;
  symbol: string;
  name: string;
  decimals: number | null;
  logoURI?: string | null;
  source?: string;
};

function isBase58Mint(q: string): boolean {
  const s = (q || "").trim();
  // Basic base58 check (no 0,O,I,l)
  return /^[1-9A-HJ-NP-Za-km-z]{32,48}$/.test(s);
}

function normalizeJupToken(t: any): SolItem | null {
  if (!t?.address) return null;
  return {
    mint: String(t.address),
    symbol: String(t.symbol || ""),
    name: String(t.name || ""),
    decimals: Number.isFinite(t.decimals) ? t.decimals : null,
    logoURI: t.logoURI || t.logoUrl || t.logo || null,
    source: "jup"
  };
}

function normalizeDexPairToken(token: any): { mint: string; symbol: string; name: string; logoURI?: string | null } | null {
  if (!token?.address) return null;
  return {
    mint: String(token.address),
    symbol: String(token.symbol || ""),
    name: String(token.name || ""),
    logoURI: token.logoURI || token.logo || null
  };
}

async function jupByAddresses(mints: string[]): Promise<SolItem[]> {
  if (!mints.length) return [];
  try {
    const u = new URL("https://lite-api.jup.ag/v1/tokens");
    for (const m of mints) u.searchParams.append("addresses[]", m);
    const r = await fetch(u, { cache: "no-store" });
    if (!r.ok) return [];
    const j = await r.json();
    const arr: any[] = Array.isArray(j) ? j : j?.data || j?.tokens || [];
    return arr.map(normalizeJupToken).filter(Boolean) as SolItem[];
  } catch { return []; }
}

async function jupSearch(q: string): Promise<SolItem[]> {
  try {
    const r = await fetch(`https://lite-api.jup.ag/v1/tokens?search=${encodeURIComponent(q)}`, { cache: "no-store" });
    if (!r.ok) return [];
    const j = await r.json();
    const arr: any[] = Array.isArray(j) ? j : j?.data || j?.tokens || [];
    return arr.map(normalizeJupToken).filter(Boolean) as SolItem[];
  } catch { return []; }
}

async function dsByMint(mint: string): Promise<SolItem[]> {
  try {
    const r = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`, { cache: "no-store" });
    if (!r.ok) return [];
    const j = await r.json();
    const pairs: any[] = j?.pairs || [];
    const out: SolItem[] = [];
    for (const p of pairs) {
      // Solana only
      const chain = p?.chainId || p?.chain || "";
      if (String(chain).toLowerCase() !== "solana") continue;
      const t0 = normalizeDexPairToken(p?.baseToken || p?.token0);
      const t1 = normalizeDexPairToken(p?.quoteToken || p?.token1);
      const cands = [t0, t1].filter(Boolean) as any[];
      for (const c of cands) {
        if (String(c.mint) === String(mint)) {
          out.push({ mint: c.mint, symbol: c.symbol, name: c.name, decimals: null, logoURI: c.logoURI || null, source: "dexscreener" });
        }
      }
    }
    // dedupe by mint
    const seen = new Set<string>();
    return out.filter(i => !seen.has(i.mint) && seen.add(i.mint));
  } catch { return []; }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  if (!q) return NextResponse.json({ items: [] }, { status: 200 });

  let items: SolItem[] = [];

  if (isBase58Mint(q)) {
    // Address path: Jupiter by address → Dexscreener fallback
    const j = await jupByAddresses([q]);
    if (j.length) items = j;
    if (!items.length) items = await dsByMint(q);
    return NextResponse.json({ items }, { status: 200 });
  }

  // Name/symbol path: Jupiter search (optionally merge Dexscreener)
  items = await jupSearch(q);

  // (Optional) merge Dexscreener name search for Solana only
  // NOTE: Dexscreener name search can be noisy; include if you want newborns-by-name.
  // try {
  //   const r = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q)}`, { cache: "no-store" });
  //   if (r.ok) {
  //     const j = await r.json();
  //     const pairs: any[] = j?.pairs || [];
  //     const extra: SolItem[] = [];
  //     for (const p of pairs) {
  //       const chain = p?.chainId || p?.chain || "";
  //       if (String(chain).toLowerCase() !== "solana") continue;
  //       const t0 = normalizeDexPairToken(p?.baseToken || p?.token0);
  //       const t1 = normalizeDexPairToken(p?.quoteToken || p?.token1);
  //       for (const c of [t0, t1]) {
  //         if (c) extra.push({ mint: c.mint, symbol: c.symbol, name: c.name, decimals: null, logoURI: c.logoURI || null, source: "dexscreener" });
  //       }
  //     }
  //     // merge + dedupe by mint
  //     const map = new Map<string, SolItem>();
  //     for (const it of [...items, ...extra]) if (!map.has(it.mint)) map.set(it.mint, it);
  //     items = Array.from(map.values());
  //   }
  // } catch {}

  return NextResponse.json({ items }, { status: 200 });
}
