import { NextResponse } from "next/server";
import { fetchOneInchTokenMap } from "@/lib/oneinchTokens";
import { fetchErc20Meta } from "@/lib/erc20";

const ALLOWED_CHAIN_IDS = new Set<number>([
  1,      // Ethereum
  56,     // BSC
  137,    // Polygon
  10,     // Optimism
  42161,  // Arbitrum One
  8453,   // Base
  43114,  // Avalanche
  250,    // Fantom
]);

function isAddress(q: string): q is `0x${string}` {
  return /^0x[a-fA-F0-9]{40}$/.test(q.trim());
}
function norm(s: string) { return s.toLowerCase(); }

function cors(json: any, init?: number | ResponseInit) {
  const res = NextResponse.json(json, init);
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.headers.set("Cache-Control", "no-store");
  return res;
}
export function OPTIONS() { return cors({}, { status: 204 }); }

// Minimal curated fallbacks for chains where 1inch list is unavailable.
// (Logos from trustwallet assets where possible.)
const FALLBACKS: Record<number, Array<{
  address: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string | null;
}>> = {
  250: [
    {
      address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", // USDC.e
      symbol: "USDC",
      name: "USD Coin (bridged)",
      decimals: 6,
      logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/fantom/assets/0x04068DA6C83AFCFA0e13ba15A6696662335D5B75/logo.png",
    },
    {
      address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", // WFTM
      symbol: "WFTM",
      name: "Wrapped Fantom",
      decimals: 18,
      logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/fantom/info/logo.png",
    },
    {
      address: "0x049d68029688eABF473097a2fC38ef61633A3C7A", // USDT
      symbol: "USDT",
      name: "Tether USD (bridged)",
      decimals: 6,
      logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/fantom/assets/0x049d68029688eABF473097a2fC38ef61633A3C7A/logo.png",
    },
    {
      address: "0x8D11ec38a3EB5E956B052f67Da8Bdc9bef8Abf3E", // DAI
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
      logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/fantom/assets/0x8D11ec38a3EB5E956B052f67Da8Bdc9bef8Abf3E/logo.png",
    },
  ],
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawChain = searchParams.get("chainId") || "56";
    const chainId = Number(rawChain);
    const qRaw = (searchParams.get("q") || "").trim();

    if (!Number.isFinite(chainId) || !ALLOWED_CHAIN_IDS.has(chainId)) {
      return cors({ error: `Unsupported chainId: ${rawChain}` }, { status: 400 });
    }
    if (!qRaw) return cors([], { status: 200 });

    // ADDRESS → on-chain (works for newborn tokens)
    if (isAddress(qRaw)) {
      const meta = await fetchErc20Meta(chainId, qRaw as `0x${string}`);
      return cors([meta], { status: 200 });
    }

    // TEXT → Try 1inch list first
    try {
      const tokens = await fetchOneInchTokenMap(chainId);
      const q = norm(qRaw);
      const results = Object.values(tokens)
        .filter(t => {
          const n = norm(t.name || "");
          const s = norm(t.symbol || "");
          const a = norm(t.address);
          return n.includes(q) || s.includes(q) || a.includes(q);
        })
        .slice(0, 50)
        .map(t => ({
          address: t.address as `0x${string}`,
          symbol: t.symbol,
          name: t.name,
          decimals: t.decimals,
          logoURI: t.logoURI || null,
          chainId,
        }));
      return cors(results, { status: 200 });
    } catch {
      // If 1inch fails / not supported, use curated fallback for that chain (if any)
      const list = FALLBACKS[chainId] || [];
      if (list.length) {
        const q = norm(qRaw);
        const filtered = list.filter(t =>
          norm(t.name).includes(q) || norm(t.symbol).includes(q) || norm(t.address).includes(q)
        ).slice(0, 50).map(t => ({ ...t, chainId }));
        return cors(filtered, { status: 200 });
      }
      return cors([], { status: 200 });
    }
  } catch (e: any) {
    return cors({ error: e?.message || "Failed" }, { status: 500 });
  }
}
