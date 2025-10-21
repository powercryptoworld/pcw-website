import { NextResponse } from "next/server";
import { liveSolanaMeta } from "@/lib/solanaLive";

type Meta = {
  mint: string;
  symbol: string | null;
  name: string | null;
  decimals: number | null;
  logoURI: string | null;
  source?: string;
};

async function fetchJSON(url: string, timeoutMs = 8000) {
  const r = await fetch(url, {
    cache: "no-store",
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      accept: "application/json",
      "user-agent": "pcw-sol-live/1.0",
    },
  });
  if (!r.ok) throw new Error(`upstream ${r.status}`);
  return r.json();
}

// DexScreener has: { pairs: [...], info?: { imageUrl?: string } }
// We pick the pair whose baseToken.address === mint, or first pair.
function enrichFromDexScreener(ds: any, mint: string) {
  const pairs = Array.isArray(ds?.pairs) ? ds.pairs : [];
  const exact = pairs.find((p: any) => p?.baseToken?.address === mint);
  const src = exact || pairs[0];
  if (!src?.baseToken) return null;
  const base = src.baseToken;
  const imageUrl: string | null =
    typeof ds?.info?.imageUrl === "string" && ds.info.imageUrl.length
      ? ds.info.imageUrl
      : null;
  return {
    symbol: typeof base.symbol === "string" && base.symbol.length ? base.symbol : null,
    name: typeof base.name === "string" && base.name.length ? base.name : null,
    logoURI: imageUrl,
    source: "dexscreener",
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mint = (searchParams.get("mint") || "").trim();
    if (!mint) return NextResponse.json({ ok: false, error: "no mint" }, { status: 400 });

    // Step 1: your existing live resolver
    const meta0 = (await liveSolanaMeta(mint)) as Meta;

    // Step 2: if it returned UNKNOWN, enrich with DexScreener
    const isUnknown =
      !meta0?.symbol || meta0.symbol === "UNKNOWN" ||
      !meta0?.name || /Unknown/i.test(String(meta0.name));

    let out: Meta = { ...meta0 };

    if (isUnknown) {
      try {
        const ds = await fetchJSON(`https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(mint)}`, 8000);
        const add = enrichFromDexScreener(ds, mint);
        if (add) {
          out = {
            ...out,
            symbol: add.symbol ?? out.symbol ?? "UNKNOWN",
            name: add.name ?? out.name ?? "Token",
            logoURI: add.logoURI ?? out.logoURI ?? null,
            source: add.source ?? out.source ?? "fallback",
          } as Meta;
        }
      } catch {
        // swallow DS errors; keep original meta0
      }
    }

    return NextResponse.json({ ok: true, meta: out }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "failed" }, { status: 200 });
  }
}
