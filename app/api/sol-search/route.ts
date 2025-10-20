import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

/**
 * Strategy:
 * 1) Try Jupiter Ultra (if reachable).
 * 2) Fallback: download Solana tokenlist from GitHub raw (once) and cache to /tmp,
 *    then full-text search by symbol/name/mint. This works in Codespaces reliably.
 */

type T = {
  address?: string; // mint
  mint?: string;
  symbol?: string;
  name?: string;
  decimals?: number | null;
  logoURI?: string | null;
  chainId?: number | null;
};

function normalize(list: T[] = []) {
  return list
    .map((t) => ({
      mint: t.address || t.mint || "",
      symbol: t.symbol || "UNKNOWN",
      name: t.name || "Token",
      decimals: typeof t.decimals === "number" ? t.decimals : null,
      logoURI: t.logoURI || null,
      chainId: typeof t.chainId === "number" ? t.chainId : null,
    }))
    .filter((x) => x.mint);
}

function takeArrayShape(payload: any): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload?.data && Array.isArray(payload.data)) return payload.data as T[];
  if (payload?.items && Array.isArray(payload.items)) return payload.items as T[];
  return [];
}

async function fetchJSON(url: string) {
  const r = await fetch(url, {
    cache: "no-store",
    redirect: "follow",
    headers: {
      "accept": "application/json",
      "user-agent": "pcw-sol-search/1.0",
    },
  });
  if (!r.ok) throw new Error(`upstream ${r.status}`);
  return r.json();
}

async function tryJupiterUltra(qRaw: string) {
  try {
    const base = (process.env.NEXT_PUBLIC_JUPITER_LITE || "https://lite-api.jup.ag").replace(/\/+$/, "");
    const payload = await fetchJSON(`${base}/ultra/v1/search?query=${encodeURIComponent(qRaw)}`);
    const items = normalize(takeArrayShape(payload)).slice(0, 50);
    return items;
  } catch {
    return [];
  }
}

const CACHE_FILE = path.join("/tmp", "pcw-solana-tokenlist.json");
// GitHub raw token list (periodically updated upstream)
const TOKENLIST_URL =
  "https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json";

type TokenListShape = { tokens?: T[] } | { data?: T[] } | T[];

async function loadCachedTokenlist(): Promise<T[] | null> {
  try {
    const buf = await fs.readFile(CACHE_FILE, "utf8");
    const json = JSON.parse(buf) as TokenListShape;
    const arr =
      Array.isArray(json)
        ? json as T[]
        : Array.isArray((json as any).tokens)
          ? (json as any).tokens as T[]
          : Array.isArray((json as any).data)
            ? (json as any).data as T[]
            : [];
    if (arr.length > 0) return arr;
    return null;
  } catch {
    return null;
  }
}

async function refreshTokenlist(): Promise<T[] | null> {
  try {
    const json = await fetchJSON(TOKENLIST_URL) as any;
    const arr =
      Array.isArray(json?.tokens) ? json.tokens as T[]
      : Array.isArray(json?.data) ? json.data as T[]
      : Array.isArray(json) ? json as T[]
      : [];
    if (arr.length > 0) {
      // Write-through cache
      await fs.writeFile(CACHE_FILE, JSON.stringify(arr), "utf8");
      return arr;
    }
    return null;
  } catch {
    return null;
  }
}

function searchTokenlist(all: T[], qRaw: string) {
  const q = qRaw.toLowerCase();
  // Only Solana mainnet (101) if present
  const filtered = all.filter((t) => (t as any).chainId === 101 || (t as any).chainId == null);
  // Rank by simple heuristics: startsWith > includes; symbol > name > mint
  const scored = filtered.map((t) => {
    const symbol = (t.symbol || "").toLowerCase();
    const name = (t.name || "").toLowerCase();
    const mint = (t.address || t.mint || "").toLowerCase();
    let score = 0;
    if (symbol === q) score += 1000;
    if (name === q) score += 900;
    if (mint === q) score += 800;
    if (symbol.startsWith(q)) score += 500;
    if (name.startsWith(q)) score += 400;
    if (mint.startsWith(q)) score += 300;
    if (symbol.includes(q)) score += 200;
    if (name.includes(q)) score += 100;
    if (mint.includes(q)) score += 50;
    return { t, score };
  }).filter((x) => x.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return normalize(scored.map((x) => x.t)).slice(0, 100);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const qRaw = (searchParams.get("q") || "").trim();
    if (!qRaw) return NextResponse.json({ items: [] }, { status: 200 });

    // 1) Jupiter Ultra (fast path if reachable)
    let items = await tryJupiterUltra(qRaw);

    // 2) GitHub raw tokenlist (cached locally)
    if (items.length === 0) {
      let list = await loadCachedTokenlist();
      if (!list) {
        list = await refreshTokenlist();
      }
      if (list && list.length > 0) {
        items = searchTokenlist(list, qRaw);
      }
    }

    // 3) If still nothing, return minimal SOL/USDC to avoid empty UI
    if (items.length === 0) {
      items = normalize([
        {
          address: "So11111111111111111111111111111111111111112",
          symbol: "SOL",
          name: "Wrapped SOL",
          decimals: 9,
          logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
          chainId: 101
        },
        {
          address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          symbol: "USDC",
          name: "USD Coin",
          decimals: 6,
          logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
          chainId: 101
        }
      ]);
    }

    return NextResponse.json(
      { items },
      { status: 200, headers: { "Cache-Control": "public, max-age=300" } }
    );
  } catch (e: any) {
    return NextResponse.json({ items: [], error: e?.message || "error" }, { status: 200 });
  }
}
