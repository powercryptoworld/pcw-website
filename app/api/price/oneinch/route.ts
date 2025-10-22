import { NextResponse } from "next/server";

type P = { chainId: number; token: string; decimals: number };

const USDC_BY_CHAIN: Record<number, { address: `0x${string}`, decimals: number }> = {
  1:   { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
  56:  { address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", decimals: 18 },
  137: { address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", decimals: 6 },
  42161:{ address: "0xFF970A61A04b1cA14834A43f5de4533eBDDB5CC8", decimals: 6 },
  10:  { address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", decimals: 6 },
  8453:{ address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6 },
  43114:{ address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", decimals: 6 },
};

function jsonError(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}
function isStable(chainId: number, addr: string): boolean {
  const stables: Record<number, string[]> = {
    1: [
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "0xdac17f958d2ee523a2206206994597c13d831ec7",
      "0x6b175474e89094c44da98b954eedeac495271d0f",
    ],
    56: [
      "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
      "0x55d398326f99059ff775485246999027b3197955",
      "0x1af3f329e8bedcddf7e3c08f3c62177cdcaaefbf",
    ],
    137: [
      "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
      "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
      "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    ],
  };
  return (stables[chainId] || []).includes(addr.toLowerCase());
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chainId = Number(searchParams.get("chainId") || "");
  const token = String(searchParams.get("token") || "").toLowerCase();
  const decimals = Number(searchParams.get("decimals") || "");
  if (!Number.isInteger(chainId) || !token || !Number.isInteger(decimals)) {
    return jsonError("Missing or invalid chainId/token/decimals", 400);
  }
  const USDC = USDC_BY_CHAIN[chainId];
  if (!USDC) return jsonError("USDC not configured for this chain", 422);

  const key = process.env.ONEINCH_API_KEY;
  if (!key) return jsonError("Server missing ONEINCH_API_KEY", 500);

  const amount = BigInt(10) ** BigInt(Math.max(0, Math.min(36, decimals)));

  // 1) 1inch quote: 1 token -> USDC
  const url = new URL(`https://api.1inch.dev/swap/v6.0/${chainId}/quote`);
  url.searchParams.set("src", token);
  url.searchParams.set("dst", USDC.address);
  url.searchParams.set("amount", amount.toString());

  let priceUsd: number | undefined;
  let source: string | undefined;

  try {
    const r = await fetch(url, {
      headers: { "Authorization": `Bearer ${key}`, "X-API-KEY": key },
      cache: "no-store",
    });
    if (r.ok) {
      const q = await r.json();
      const dstAmount = BigInt(q?.dstAmount ?? 0n);
      if (dstAmount > 0n) {
        priceUsd = Number(dstAmount) / (10 ** USDC.decimals);
        source = "1inch";
      }
    }
  } catch {}

  // 2) Stable clamp near $1
  if ((!priceUsd || priceUsd <= 0) && isStable(chainId, token)) {
    priceUsd = 1;
    source = source ?? "stable";
  }

  // 3) DexScreener fallback
  if (!priceUsd || priceUsd <= 0) {
    try {
      const r = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token}`, { cache: "no-store" });
      if (r.ok) {
        const j = await r.json();
        const pairs: any[] = Array.isArray(j?.pairs) ? j.pairs : [];
        const candidates = pairs
          .map((p:any) => ({
            pu: p?.priceUsd != null ? Number(p.priceUsd) : NaN,
            liq: p?.liquidity?.usd != null ? Number(p.liquidity.usd) : (p?.liquidityUsd ?? 0),
          }))
          .filter(x => Number.isFinite(x.pu) && x.pu > 0);
        if (candidates.length) {
          candidates.sort((a,b)=> (b.liq - a.liq));
          priceUsd = candidates[0].pu;
          source = source ?? "dexscreener";
        }
      }
    } catch {}
  }

  return NextResponse.json({ priceUsd, source }, { status: 200 });
}
