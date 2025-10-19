type RegItem = {
  address?: string;
  mint?: string;
  symbol?: string;
  name?: string;
  decimals?: number;
  logoURI?: string;
};

let cache: { data: RegItem[]; exp: number } | null = null;
const TTL_MS = 5 * 60 * 1000;

export async function getSolanaRegistry(): Promise<RegItem[]> {
  const now = Date.now();
  if (cache && cache.exp > now) return cache.data;

  // Prefer the cached bulk list (fast, no auth)
  const url = "https://cache.jup.ag/tokens";
  const res = await fetch(url, { cache: "no-store" });
  const ct = res.headers.get("content-type") || "";
  if (!res.ok || !ct.includes("application/json")) return (cache = { data: [], exp: now + 30_000 }).data; // short 30s if bad

  const data = (await res.json()) as RegItem[];
  cache = { data, exp: now + TTL_MS };
  return data;
}
