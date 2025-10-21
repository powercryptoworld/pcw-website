import { NextResponse } from "next/server";
import { fetchSolanaTokenMeta } from "@/lib/solanaMeta";

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
      "user-agent": "pcw-sol-meta/1.0",
    },
  });
  if (!r.ok) throw new Error(`upstream ${r.status}`);
  return r.json();
}

// DexScreener helper: prefer exact baseToken.address === mint; else first pair
function fromDexScreener(ds: any, mint: string) {
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
  } as Partial<Meta>;
}

// Accept ?mint=... (preferred) or ?addr=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mint = (searchParams.get("mint") || searchParams.get("addr") || "").trim();
    if (!mint) return NextResponse.json({ ok: false, error: "no mint" }, { status: 400 });

    // 1) Existing cached/registry meta
    const baseMeta = (await fetchSolanaTokenMeta(mint)) as Meta;

    // 2) If UNKNOWN/Unknown, auto-enrich via DexScreener (same as clicking Enrich)
    const looksUnknown =
      !baseMeta?.symbol || baseMeta.symbol === "UNKNOWN" ||
      !baseMeta?.name || /Unknown/i.test(String(baseMeta.name));

    let out: Meta = { ...baseMeta };

    if (looksUnknown) {
      try {
        const ds = await fetchJSON(`https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(mint)}`, 8000);
        const add = fromDexScreener(ds, mint);
        if (add && (add.symbol || add.name || add.logoURI)) {
          out = {
            ...out,
            symbol: add.symbol ?? out.symbol ?? "UNKNOWN",
            name:   add.name   ?? out.name   ?? "Token",
            logoURI: add.logoURI ?? out.logoURI ?? null,
            source: add.source ?? out.source ?? "fallback",
          };
        } else {
          // Search fallback (some new tokens surface only via /search)
          const ds2 = await fetchJSON(`https://api.dexscreener.com/latest/dex/search/?q=${encodeURIComponent(mint)}`, 8000);
          const pairs2 = Array.isArray(ds2?.pairs) ? ds2.pairs : [];
          const hit = pairs2.find((p: any) => p?.baseToken?.address === mint) || pairs2[0];
          if (hit?.baseToken) {
            out = {
              ...out,
              symbol: hit.baseToken.symbol || out.symbol || "UNKNOWN",
              name: hit.baseToken.name || out.name || "Token",
              source: "dexscreener",
            };
          }
        }
      } catch {
        // swallow DS errors; leave out as baseMeta
      }
    }

    return NextResponse.json({ ok: true, meta: out }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "failed" }, { status: 200 });
  }
}
