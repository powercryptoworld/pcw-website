"use client";

export type EnrichResult = {
  updated: boolean;
  fields?: string[];
  source?: string; // e.g., "jup" or "dex"
};

// Simple in-memory cache with TTL + in-flight de-duplication (per page session)
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes
const cache = new Map<string, { at: number; value: EnrichResult }>();
const inflight = new Map<string, Promise<EnrichResult>>();

export async function enrichSolMint(mint: string): Promise<EnrichResult> {
  const key = mint.trim();
  if (!key) return { updated: false };

  // Serve from cache if fresh
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;

  // De-dupe concurrent calls for the same mint
  const existing = inflight.get(key);
  if (existing) return existing;

  const p = (async () => {
    const url = `/api/sol-meta-live?mint=${encodeURIComponent(key)}`;
    const res = await fetch(url, { method: "GET", cache: "no-store" });
    if (!res.ok) {
      const msg = await safeText(res);
      throw new Error(msg || `HTTP ${res.status}`);
    }
    const raw = await res.json().catch(() => ({}));

    // Normalize a few possible shapes:
    // A) { updated, fields, source, ... }
    // B) { ok: true, meta: { symbol, name, decimals, logoURI, source } }
    // C) anything else => updated=false
    const normalized = normalize(raw);

    cache.set(key, { at: Date.now(), value: normalized });
    return normalized;
  })();

  inflight.set(key, p);
  try {
    return await p;
  } finally {
    inflight.delete(key);
  }
}

function normalize(raw: any): EnrichResult {
  // Case A: explicit updated flag
  if (raw && typeof raw === "object" && typeof raw.updated === "boolean") {
    return {
      updated: !!raw.updated,
      fields: Array.isArray(raw.fields) ? raw.fields : inferUpdatedFields(raw),
      source: typeof raw.source === "string" ? raw.source : undefined,
    };
  }

  // Case B: ok + meta shape (as seen in your debug)
  const meta = raw && typeof raw === "object" ? raw.meta : undefined;
  if (raw?.ok === true && meta && typeof meta === "object") {
    const fields = inferUpdatedFields({
      symbol: meta.symbol,
      name: meta.name,
      logo: meta.logoURI,
      decimals: meta.decimals,
    });
    const source = typeof meta.source === "string" ? meta.source : undefined;
    // Treat presence of meta as an update
    return { updated: true, fields, source };
  }

  // Fallback
  return { updated: false };
}

async function safeText(res: Response): Promise<string | undefined> {
  try { return await res.text(); } catch { return undefined; }
}

/** Best-effort inference of which fields changed when API doesn't explicitly list them */
function inferUpdatedFields(obj: any): string[] {
  const out: string[] = [];
  if (obj && typeof obj === "object") {
    if (typeof obj.symbol === "string") out.push("symbol");
    if (typeof obj.name === "string") out.push("name");
    if (typeof obj.logo === "string") out.push("logo");
    if (typeof obj.decimals === "number") out.push("decimals");
  }
  return out.length ? out : ["metadata"];
}
