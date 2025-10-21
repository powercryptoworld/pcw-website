import { NextResponse } from "next/server";

// minimal chain map for logos & normalization
const CHAIN_TO_ID: Record<string, number> = {
  ethereum: 1,
  bsc: 56,
  polygon: 137,
  base: 8453,
  arbitrum: 42161,
  optimism: 10,
  avalanche: 43114,
  fantom: 250,
  gnosis: 100,
  celo: 42220,
  moonbeam: 1284,
  mantle: 5000,
  blast: 81457,
  zora: 7777777,
  kava: 2222,
  "polygon-zkevm": 1101,
  aurora: 1313161554,
  "arbitrum-nova": 42170,
  "zksync-era": 324,
  linea: 59144,
  scroll: 534352
};

function isHexAddr(q: string) {
  return /^0x[a-fA-F0-9]{40}$/.test((q || "").trim());
}
function normAddr(a?: string) {
  return (a || "").toLowerCase();
}
type Item = { chainId: number; address: string; symbol: string; name: string; decimals: number | null; logoURI?: string | null };

// 1inch public token list (no API key) per chain
async function fetchOneInchTokens(chainId: number): Promise<Item[]> {
  try {
    const url = `https://tokens.1inch.io/v1.2/${chainId}`;
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return [];
    const j = await r.json();
    const arr: any[] = Array.isArray(j) ? j : Object.values(j);
    return arr.map((t: any) => ({
      chainId,
      address: normAddr(t.address),
      symbol: t.symbol || "",
      name: t.name || "",
      decimals: typeof t.decimals === "number" ? t.decimals : null,
      logoURI: t.logoURI || t.logoUri || null
    }));
  } catch {
    return [];
  }
}

// Dexscreener: search by free text (returns pairs)
async function fetchDexscreenerSearch(q: string): Promise<Item[]> {
  try {
    const r = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q)}`, { cache: "no-store" });
    if (!r.ok) return [];
    const j = await r.json();
    const pairs: any[] = j?.pairs || [];
    const items: Item[] = [];
    for (const p of pairs) {
      const chainKey: string = p?.chainId || p?.chain || "";
      const chainId = CHAIN_TO_ID[chainKey];
      if (!chainId) continue;
      const t0 = p?.baseToken || p?.token0;
      const t1 = p?.quoteToken || p?.token1;
      if (t0?.address) {
        items.push({
          chainId,
          address: normAddr(t0.address),
          symbol: t0.symbol || "",
          name: t0.name || "",
          decimals: null,
          logoURI: t0.logoURI || null
        });
      }
      if (t1?.address) {
        items.push({
          chainId,
          address: normAddr(t1.address),
          symbol: t1.symbol || "",
          name: t1.name || "",
          decimals: null,
          logoURI: t1.logoURI || null
        });
      }
    }
    const seen = new Set<string>();
    return items.filter(i => {
      const k = `${i.chainId}:${i.address}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  } catch {
    return [];
  }
}

// Dexscreener: lookup by token address (returns pairs that reference the token)
async function fetchDexscreenerByAddress(addr: string): Promise<Item[]> {
  try {
    const r = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${addr}`, { cache: "no-store" });
    if (!r.ok) return [];
    const j = await r.json();
    const pairs: any[] = j?.pairs || [];
    const results: Item[] = [];
    for (const p of pairs) {
      const chainKey: string = p?.chainId || p?.chain || "";
      const chainId = CHAIN_TO_ID[chainKey];
      if (!chainId) continue;
      const cand = [p?.baseToken, p?.quoteToken].find((t: any) => normAddr(t?.address) === normAddr(addr));
      if (!cand) continue;
      results.push({
        chainId,
        address: normAddr(cand.address),
        symbol: cand.symbol || "",
        name: cand.name || "",
        decimals: null,
        logoURI: cand.logoURI || null
      });
    }
    const seen = new Set<string>();
    return results.filter(i => {
      const k = `${i.chainId}:${i.address}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const chainIdParam = searchParams.get("chainId");
  const chainId = chainIdParam ? Number(chainIdParam) : undefined;

  if (!q) return NextResponse.json({ items: [] }, { status: 200 });

  let items: Item[] = [];

  // ADDRESS PATH
  if (isHexAddr(q)) {
    if (chainId) {
      const list = await fetchOneInchTokens(chainId);
      const hit = list.find(t => normAddr(t.address) === normAddr(q));
      if (hit) items.push(hit);
    }
    if (items.length === 0) {
      const common = chainId ? [chainId] : [1,56,137,8453,42161,10,43114,250,100,42220,1284,5000,81457,7777777,2222,1101,1313161554,42170,324,59144,534352];
      for (const cid of common) {
        const list = await fetchOneInchTokens(cid);
        const hit = list.find(t => normAddr(t.address) === normAddr(q));
        if (hit) items.push(hit);
      }
    }
    if (items.length === 0) items = await fetchDexscreenerByAddress(q);
    return NextResponse.json({ items }, { status: 200 });
  }

  // NAME/SYMBOL PATH
  if (chainId) {
    const list = await fetchOneInchTokens(chainId);
    const ql = q.toLowerCase();
    items = list.filter(t => (t.symbol||"").toLowerCase().includes(ql) || (t.name||"").toLowerCase().includes(ql));
    if (items.length === 0) {
      const ds = await fetchDexscreenerSearch(q);
      items = ds.filter(t => t.chainId === chainId);
    }
  } else {
    const common = [1,56,137,8453,42161,10];
    const ql = q.toLowerCase();
    const fromLists: Item[] = [];
    for (const cid of common) {
      const list = await fetchOneInchTokens(cid);
      fromLists.push(...list.filter(t => (t.symbol||"").toLowerCase().includes(ql) || (t.name||"").toLowerCase().includes(ql)));
    }
    const ds = await fetchDexscreenerSearch(q);
    items = [...fromLists, ...ds];
  }

  const seen = new Set<string>();
  const deduped = items.filter(i => {
    const k = `${i.chainId}:${normAddr(i.address)}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 30);

  return NextResponse.json({ items: deduped }, { status: 200 });
}
