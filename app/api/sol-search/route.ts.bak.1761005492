import { NextResponse } from "next/server";

/** Tiny in-memory cache so we don't hammer the endpoint */
type Row = { address?: string; mint?: string; symbol?: string; name?: string; decimals?: number; logoURI?: string };
let CACHED_LIST: Row[] | null = null;
let CACHE_EXP = 0;
const TTL_MS = 5 * 60 * 1000;

async function fetchJupiterList(): Promise<Row[] | null> {
  // Serve cache if fresh
  const now = Date.now();
  if (CACHED_LIST && CACHE_EXP > now) return CACHED_LIST;

  // Time-boxed fetch (1.5s)
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 1500);
    const res = await fetch("https://cache.jup.ag/tokens", { cache: "no-store", signal: ctrl.signal as any });
    clearTimeout(timer);
    const ct = res.headers.get("content-type") || "";
    if (!res.ok || !ct.includes("application/json")) return null;
    const json = (await res.json()) as any[];
    if (!Array.isArray(json)) return null;
    CACHED_LIST = json;
    CACHE_EXP = now + TTL_MS;
    return CACHED_LIST;
  } catch {
    return null;
  }
}

const norm = (s: string) => s.toLowerCase();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const qRaw = (searchParams.get("q") || "").trim();
    if (!qRaw) return NextResponse.json([], { status: 200 });

    const list = await fetchJupiterList();
    if (!list) return NextResponse.json([], { status: 200 });

    const q = norm(qRaw);
    const out = list
      .filter((t) => {
        const addr = norm(String(t.address || t.mint || ""));
        const sym  = norm(String(t.symbol || ""));
        const name = norm(String(t.name || ""));
        return addr.includes(q) || sym.includes(q) || name.includes(q);
      })
      .slice(0, 50)
      .map((t) => ({
        mint: String(t.address || t.mint || ""),
        symbol: t.symbol || "UNKNOWN",
        name: t.name || "Unknown Solana Token",
        decimals: typeof t.decimals === "number" ? t.decimals : 9,
        logoURI: typeof t.logoURI === "string" && t.logoURI.trim() ? t.logoURI : null,
        source: "jup",
      }))
      .filter((t) => t.mint);

    return NextResponse.json(out, { status: 200 });
  } catch {
    // Always succeed safely
    return NextResponse.json([], { status: 200 });
  }
}
