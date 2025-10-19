"use client";

export type EnrichResult = {
  updated: boolean;
  fields?: string[];
  source?: string; // e.g., "jup" or "dex"
};

/**
 * Calls our live Solana metadata API and returns a normalized EnrichResult.
 * The API is expected at /api/sol-meta-live?mint=<mint>
 */
export async function enrichSolMint(mint: string): Promise<EnrichResult> {
  const url = `/api/sol-meta-live?mint=${encodeURIComponent(mint)}`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) {
    const msg = await safeText(res);
    throw new Error(msg || `HTTP ${res.status}`);
  }
  const data = await res.json().catch(() => ({}));

  // We expect the API to return something like:
  // { updated: boolean, fields?: string[], source?: "jup"|"dex", symbol?: string, name?: string, logo?: string, decimals?: number }
  const updated = !!data.updated;
  const fields: string[] = Array.isArray(data.fields)
    ? data.fields
    : inferUpdatedFields(data);

  const source = typeof data.source === "string" ? data.source : undefined;

  return { updated, fields, source };
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
