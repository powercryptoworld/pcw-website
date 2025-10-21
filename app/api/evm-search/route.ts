export const runtime = 'nodejs';
import { NextRequest } from "next/server";

let localIndex: Record<number, any[]> = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const local = require("@/lib/oneinchTokens");
  localIndex = local?.default || local || {};
} catch {}

export const dynamic = "force-dynamic";

function tokenListUrls(chainId: number): string[] {
  return [
    `https://token-list.1inch.io/v6.0/${chainId}`,
    `https://token-list.1inch.io/v5.0/${chainId}`,
    `https://tokens.1inch.io/v1.2/${chainId}`,
  ];
}

type Token = {
  address: string;
  symbol: string;
  name: string;
  decimals?: number;
  logoURI?: string;
  chainId?: number;
};

function pick(tokens: Token[], q: string) {
  const qq = q.toLowerCase();
  return tokens.filter(t => {
    const sym = (t.symbol || "").toLowerCase();
    const nm = (t.name || "").toLowerCase();
    return sym.includes(qq) || nm.includes(qq);
  });
}

async function fetchOneInchList(chainId: number): Promise<Token[]> {
  const urls = tokenListUrls(chainId);
  for (const url of urls) {
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) continue;
      const j = await r.json();
      const arr: any[] = Array.isArray(j) ? j : (Array.isArray(j?.tokens) ? j.tokens : []);
      if (arr.length) {
        return arr.map((t: any) => ({
          address: t.address || t.tokenAddress || "",
          symbol: t.symbol || "",
          name: t.name || "",
          decimals: t.decimals ?? null,
          logoURI: t.logoURI || t.logoUri || t.logo || null,
          chainId: t.chainId || chainId,
        })).filter(x => x.address);
      }
    } catch {}
  }
  return [];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const chainIdStr = searchParams.get("chainId");
    const chainId = chainIdStr ? Number(chainIdStr) : undefined;

    if (!q) {
      return new Response(JSON.stringify({ items: [] }), { status: 200, headers: { "content-type": "application/json" } });
    }

    if (/^0x[a-fA-F0-9]{40}$/.test(q)) {
      const item: Token = { address: q, symbol: "", name: "", decimals: null as any, logoURI: null as any, chainId: chainId as any };
      return new Response(JSON.stringify({ items: [item] }), { status: 200, headers: { "content-type": "application/json" } });
    }

    let results: Token[] = [];

    // local first
    if (chainId && Array.isArray(localIndex[chainId])) {
      results = pick(localIndex[chainId], q);
    } else if (!chainId) {
      for (const cidStr of Object.keys(localIndex)) {
        const cid = Number(cidStr);
        results.push(...pick(localIndex[cid], q).map(t => ({ ...t, chainId: cid })));
      }
    }

    // 1inch fallback
    if (results.length === 0) {
      if (chainId) {
        const fromRemote = await fetchOneInchList(chainId);
        if (fromRemote.length) results = pick(fromRemote, q);
      } else {
        const commonChains = [1, 56, 137, 42161, 10, 8453];
        for (const cid of commonChains) {
          const arr = await fetchOneInchList(cid);
          if (arr.length) {
            results.push(...pick(arr, q).map(t => ({ ...t, chainId: t.chainId || cid })));
          }
        }
      }
    }

    const items = results.map(t => ({
      chainId: t.chainId ?? (chainId ?? 1),
      address: t.address,
      symbol: t.symbol,
      name: t.name,
      decimals: typeof t.decimals === "number" ? t.decimals : null,
      logoURI: t.logoURI ?? null,
    }));

    return new Response(JSON.stringify({ items }), {
      status: 200,
      headers: { "content-type": "application/json", "cache-control": "public, max-age=120" },
    });
  } catch {
    return new Response(JSON.stringify({ items: [] }), { status: 200, headers: { "content-type": "application/json" } });
  }
}
