type OneInchToken = {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
};

const TOKEN_CACHE = new Map<number, { data: Record<string, OneInchToken>; exp: number }>();
const TTL_MS = 3 * 60 * 1000; // 3 minutes

export async function fetchOneInchTokenMap(chainId: number): Promise<Record<string, OneInchToken>> {
  const now = Date.now();
  const hit = TOKEN_CACHE.get(chainId);
  if (hit && hit.exp > now) return hit.data;

  const key = process.env.ONEINCH_KEY;
  if (!key) throw new Error("ONEINCH_KEY missing");

  const url = `https://api.1inch.dev/token/v1.2/${chainId}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${key}`,
      // slightly friendlier UA so 1inch dashboards show something meaningful
      "User-Agent": "pcw-swap/1.0 (+token-search-cache)"
    },
    cache: "no-store",
  });

  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    let msg = `1inch token list failed ${res.status}`;
    if (ct.includes("application/json")) {
      try {
        const j = await res.json() as any;
        msg = (j.message || j.error || msg);
      } catch {}
    }
    throw new Error(msg);
  }
  if (!ct.includes("application/json")) throw new Error("1inch response was not JSON");

  const json = await res.json() as Record<string, OneInchToken>;
  TOKEN_CACHE.set(chainId, { data: json, exp: now + TTL_MS });
  return json;
}
