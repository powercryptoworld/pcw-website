import { NextResponse } from "next/server";
import { fetchSolMintMeta } from "@/lib/solanaOnchain";

function cors(json: any, init?: number | ResponseInit) {
  const res = NextResponse.json(json, init);
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.headers.set("Cache-Control", "no-store");
  return res;
}
export function OPTIONS() { return cors({}, { status: 204 }); }

function clean(s: string) {
  return (s || "")
    .replace(/\u200B|\u200C|\u200D/g, "") // zero-width
    .replace(/\u2026/g, "")               // ellipsis …
    .trim();
}

function looksLikeBase58Addr(s: string) {
  const x = clean(s);
  return /^[1-9A-HJ-NP-Za-km-z]{32,100}$/.test(x);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const qRaw = searchParams.get("q") || "";
    const q = clean(qRaw);
    if (!q) return cors([], { status: 200 });

    // If user pasted a mint or token-account address, go on-chain.
    if (looksLikeBase58Addr(q)) {
      const meta = await fetchSolMintMeta(q);
      if (!meta) return cors([], { status: 200 });
      // Normalize to the shape the client expects
      return cors([{
        mint: meta.mint,
        symbol: meta.symbol,
        name: meta.name,
        decimals: meta.decimals,
        logoURI: meta.logoURI,
      }], { status: 200 });
    }

    // Name/symbol search not implemented yet here; return empty for now.
    return cors([], { status: 200 });
  } catch (e: any) {
    return cors({ error: e?.message || "failed" }, { status: 500 });
  }
}
