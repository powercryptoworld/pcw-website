import { NextResponse } from "next/server";
import { findKnownByAddress, findKnownByQuery } from "./known";

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

// ---------- Public RPCs with quick retries (for on-chain fallback) ----------
const PUBLIC_RPCS: Record<number, string[]> = {
  1:   ["https://ethereum-rpc.publicnode.com", "https://rpc.ankr.com/eth"],
  56:  ["https://bsc-dataseed.binance.org", "https://bsc.publicnode.com", "https://rpc.ankr.com/bsc", "https://bsc-mainnet.public.blastapi.io"],
  137: ["https://polygon-rpc.com", "https://rpc.ankr.com/polygon"],
  8453:["https://mainnet.base.org"],
  42161:["https://arb1.arbitrum.io/rpc", "https://rpc.ankr.com/arbitrum"],
  10:  ["https://mainnet.optimism.io", "https://rpc.ankr.com/optimism"],
  43114:["https://api.avax.network/ext/bc/C/rpc", "https://rpc.ankr.com/avalanche"],
  250: ["https://rpc.ftm.tools", "https://rpc.ankr.com/fantom"],
  100: ["https://rpc.gnosis.gateway.fm", "https://rpc.ankr.com/gnosis"],
  42220:["https://forno.celo.org", "https://rpc.ankr.com/celo"],
  1284:["https://rpc.api.moonbeam.network"],
  5000:["https://rpc.mantle.xyz"],
  81457:["https://rpc.blast.io"],
  7777777:["https://rpc.zora.energy"],
  2222:["https://evm.kava.io"],
  1101:["https://zkevm-rpc.com"],
  1313161554:["https://mainnet.aurora.dev"],
  42170:["https://nova.arbitrum.io/rpc"],
  324:["https://mainnet.era.zksync.io"],
  59144:["https://rpc.linea.build"],
  534352:["https://rpc.scroll.io"]
};

type RpcResp = { jsonrpc: string; id: number; result?: string };
async function jsonRpcWithRetry(chainId: number, data: any, perTryMs = 2000): Promise<RpcResp | null> {
  const urls = PUBLIC_RPCS[chainId] || [];
  for (const url of urls) {
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), perTryMs);
      const r = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, ...data }),
        signal: ctrl.signal
      });
      clearTimeout(to);
      if (!r.ok) continue;
      const j = await r.json();
      if (j && j.result) return j as RpcResp;
    } catch {
      // try next URL
    }
  }
  return null;
}

// ---------- Minimal ABI decoding for ERC-20 name/symbol/decimals ----------
function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2) return new Uint8Array([]);
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return out;
}
function bytes32ToAscii(hex: string): string {
  const b = hexToBytes(hex);
  return new TextDecoder().decode(b).replace(/\u0000+$/g, "").trim();
}
function decodeString(ret: string | undefined): string | null {
  if (!ret || ret === "0x") return null;
  const clean = ret.slice(2);
  if (clean.length >= (64 * 3)) {
    try {
      const lenHex = clean.slice(64 * 2, 64 * 3);
      const len = parseInt(lenHex, 16);
      const data = clean.slice(64 * 3, 64 * 3 + len * 2);
      const buf = hexToBytes(data);
      return new TextDecoder().decode(buf).trim() || null;
    } catch { /* ignore */ }
  }
  const tail = clean.slice(-64);
  return bytes32ToAscii(tail) || null;
}
function decodeUint(ret: string | undefined): number | null {
  if (!ret || ret === "0x") return null;
  const clean = ret.slice(2);
  const tail = clean.slice(-64);
  try { return parseInt(tail, 16); } catch { return null; }
}

async function readErc20Meta(chainId: number, address: string): Promise<{ symbol?: string; name?: string; decimals?: number } | null> {
  const to = address;
  const nameSel    = "0x06fdde03";
  const symbolSel  = "0x95d89b41";
  const decimalsSel= "0x313ce567";
  try {
    const [nameR, symR, decR] = await Promise.all([
      jsonRpcWithRetry(chainId, { method: "eth_call", params: [{ to, data: nameSel }, "latest"] }),
      jsonRpcWithRetry(chainId, { method: "eth_call", params: [{ to, data: symbolSel }, "latest"] }),
      jsonRpcWithRetry(chainId, { method: "eth_call", params: [{ to, data: decimalsSel }, "latest"] })
    ]);
    const name = decodeString(nameR?.result || "");
    const symbol = decodeString(symR?.result || "");
    const decimals = decodeUint(decR?.result || "");
    if (!name && !symbol && (decimals == null)) return null;
    return { name: name ?? undefined, symbol: symbol ?? undefined, decimals: decimals ?? undefined };
  } catch {
    return null;
  }
}

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
    // 0) local known token (exact address)
    const knownHit = findKnownByAddress(q, chainId);
    if (knownHit) {
      items.push({
        chainId: knownHit.chainId,
        address: normAddr(knownHit.address),
        symbol: knownHit.symbol || "",
        name: knownHit.name || "",
        decimals: (typeof knownHit.decimals === "number" ? knownHit.decimals : null),
        logoURI: knownHit.logoURI ?? null
      });
    }

    // 1) 1inch list for selected chain
    if (chainId) {
      const list = await fetchOneInchTokens(chainId);
      const hit = list.find(t => normAddr(t.address) === normAddr(q));
      if (hit) items.push(hit);
    }

    // 2) if still empty, check a few common chains’ 1inch lists (convenience)
    if (items.length === 0) {
      const common = chainId ? [chainId] : [1,56,137,8453,42161,10,43114,250,100,42220,1284,5000,81457,7777777,2222,1101,1313161554,42170,324,59144,534352];
      for (const cid of common) {
        const list = await fetchOneInchTokens(cid);
        const hit = list.find(t => normAddr(t.address) === normAddr(q));
        if (hit) items.push(hit);
      }
    }

    // 3) Dexscreener by address — BUT filter to selected chain if provided
    if (items.length === 0) {
      const ds = await fetchDexscreenerByAddress(q);
      items = chainId ? ds.filter(t => t.chainId === chainId) : ds;
    }

    // 4) On-chain fallback: if still nothing and we have a chainId, read ERC-20 metadata
    if (items.length === 0 && chainId) {
      const meta = await readErc20Meta(chainId, q.toLowerCase());
      if (meta) {
        items.push({
          chainId,
          address: q.toLowerCase(),
          symbol: meta.symbol || "",
          name: meta.name || "",
          decimals: (typeof meta.decimals === "number" ? meta.decimals : null),
          logoURI: null
        });
      }
    }

    return NextResponse.json({ items }, { status: 200 });
  }

  // NAME/SYMBOL PATH
  if (chainId) {
    // 0) local known tokens for this chain
    const known = findKnownByQuery(q, chainId).map(k => ({
      chainId: k.chainId,
      address: normAddr(k.address),
      symbol: k.symbol || "",
      name: k.name || "",
      decimals: (typeof k.decimals === "number" ? k.decimals : null),
      logoURI: k.logoURI ?? null
    }));
    items.push(...known);

    // 1) chain-scoped 1inch list filter
    const list = await fetchOneInchTokens(chainId);
    const ql = q.toLowerCase();
    items = [
      ...items,
      ...list.filter(t =>
        (t.symbol || "").toLowerCase().includes(ql) ||
        (t.name || "").toLowerCase().includes(ql)
      )
    ];

    // 2) if empty, try Dexscreener search (then filter to this chain)
    if (items.length === 0) {
      const ds = await fetchDexscreenerSearch(q);
      items = [...items, ...ds.filter(t => t.chainId === chainId)];
    }
  } else {
    const common = [1,56,137,8453,42161,10];
    const ql = q.toLowerCase();
    const fromLists: Item[] = [];
    for (const cid of common) {
      const list = await fetchOneInchTokens(cid);
      fromLists.push(
        ...list.filter(t =>
          (t.symbol || "").toLowerCase().includes(ql) ||
          (t.name || "").toLowerCase().includes(ql)
        )
      );
    }
    const ds = await fetchDexscreenerSearch(q);
    // local known tokens across chains (no chain filter)
    const localKnown = findKnownByQuery(q).map(k => ({
      chainId: k.chainId,
      address: normAddr(k.address),
      symbol: k.symbol || "",
      name: k.name || "",
      decimals: (typeof k.decimals === "number" ? k.decimals : null),
      logoURI: k.logoURI ?? null
    }));
    items = [...localKnown, ...fromLists, ...ds];
  }

  // final de-dupe + cap to 30
  const seen = new Set<string>();
  const deduped = items.filter(i => {
    const k = `${i.chainId}:${normAddr(i.address)}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 30);

  return NextResponse.json({ items: deduped }, { status: 200 });
}
