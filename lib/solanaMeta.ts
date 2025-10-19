type SolMeta = {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string | null;
  source?: "known" | "cached" | "fallback";
};

const FALLBACK_BASE = {
  symbol: "UNKNOWN",
  name: "Unknown Solana Token",
  decimals: 9,
  logoURI: null as string | null,
};

const WELL_KNOWN: Record<string, Omit<SolMeta, "source">> = {
  "so11111111111111111111111111111111111111112": {
    mint: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Wrapped SOL",
    decimals: 9,
    logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
  },
  "epjfwdd5aufqssqem2qn1xzybapc8g4weggkzwdt1v": {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  },
};

// ultra-light in-memory cache (no network population here)
const CACHE = new Map<string, { meta: SolMeta; exp: number }>();
const TTL_MS = 5 * 60 * 1000;

// Primary function used by our API routes
export async function fetchSolanaTokenMeta(mint: string): Promise<SolMeta> {
  const key = (mint || "").trim();
  if (!key) {
    return { mint: "", ...FALLBACK_BASE, source: "fallback" };
  }

  // Known-good fast path
  const lower = key.toLowerCase();
  if (WELL_KNOWN[lower]) {
    return { ...WELL_KNOWN[lower], source: "known" };
  }

  // Cached fast path
  const now = Date.now();
  const hit = CACHE.get(key);
  if (hit && hit.exp > now) {
    return { ...hit.meta, source: "cached" };
  }

  // NEW: No network calls for stability. Return instant fallback.
  const meta: SolMeta = { mint: key, ...FALLBACK_BASE, source: "fallback" };

  // cache fallback so repeated queries stay instant
  CACHE.set(key, { meta, exp: now + TTL_MS });

  return meta;
}
