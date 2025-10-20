import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ---- Config ----
const MIN_BYTES = 1024;
const TOKENLIST_URLS = [
  "https://tokens.pancakeswap.finance/pancakeswap-default.json",
  "https://tokens.pancakeswap.finance/pancakeswap-extended.json",
];

// ---- FS helpers ----
function pngPath(chainId: number, addrLc: string) {
  return path.join(process.cwd(), "public", "token-logos", String(chainId), `${addrLc}.png`);
}
async function statBytes(p: string): Promise<number | null> {
  try { const s = await fs.stat(p); return s.isFile() ? s.size : null; } catch { return null; }
}
async function ensureDirFor(p: string) { await fs.mkdir(path.dirname(p), { recursive: true }); }

// ---- HTTP helpers ----
function okImage(ct?: string | null) { return !!ct && ct.startsWith("image/"); }
async function fetchImage(url: string) {
  try {
    const r = await fetch(url, { redirect: "follow", cache: "no-store" });
    if (!r.ok) return null;
    const ct = r.headers.get("content-type");
    if (!okImage(ct)) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.byteLength < MIN_BYTES) return null;
    return { buf, ct: ct || "image/png", url, host: new URL(url).hostname };
  } catch { return null; }
}

function trustWalletChain(chainId: number) {
  switch (chainId) {
    case 1: return "ethereum";
    case 56: return "smartchain";
    case 137: return "polygon";
    case 43114: return "avalanchec";
    case 250: return "fantom";
    case 42161: return "arbitrum";
    case 10: return "optimism";
    case 8453: return "base";
    default: return "";
  }
}

// Try in priority: override URL -> list logoURI -> TrustWallet mirrors
async function trySources(chainId: number, addrRaw: string, logoURI?: string | null, overrideUrl?: string | null) {
  const addrLc = addrRaw.toLowerCase();
  const urls: string[] = [];
  if (overrideUrl) urls.push(overrideUrl);
  if (logoURI) urls.push(logoURI);
  const tw = trustWalletChain(chainId);
  if (tw) {
    urls.push(`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${tw}/assets/${addrRaw}/logo.png`);
    urls.push(`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${tw}/assets/${addrLc}/logo.png`);
    urls.push(`https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/${tw}/assets/${addrRaw}/logo.png`);
    urls.push(`https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/${tw}/assets/${addrLc}/logo.png`);
  }
  for (const u of urls) {
    const hit = await fetchImage(u);
    if (hit) return hit;
  }
  return null;
}

type TL = { tokens: Array<{ chainId: number; address: string; logoURI?: string }> };

async function fetchJson<T=any>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, { redirect: "follow", cache: "no-store" });
    if (!r.ok) return null;
    return await r.json() as T;
  } catch { return null; }
}

async function readOverrides(): Promise<Record<string, Record<string, string>>> {
  const p = path.join(process.cwd(), "lib", "tokenLogoOverrides.json");
  try {
    const raw = await fs.readFile(p, "utf8");
    return JSON.parse(raw) as Record<string, Record<string, string>>;
  } catch {
    return {};
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const chainId = Number(body.chainId ?? 56); // default BNB (56)
    const limit = Math.max(1, Math.min(2000, Number(body.limit ?? 500))); // cap to avoid abuse

    const overrides = await readOverrides();
    const ovrForChain = overrides[String(chainId)] || {};

    const reports: Array<{ address: string; action: string; bytes?: number; source?: string }> = [];
    let tried = 0, saved = 0, skipped = 0, existing = 0;

    // Collect token candidates from tokenlists (chain-filtered, deduped)
    const addrs = new Map<string, { logoURI?: string; overrideUrl?: string }>(); // addrLc -> data
    for (const url of TOKENLIST_URLS) {
      const list = await fetchJson<TL>(url);
      if (!list?.tokens) continue;
      for (const t of list.tokens) {
        if (t.chainId !== chainId) continue;
        const addr = (t.address || "").trim();
        if (/^0x[0-9a-fA-F]{40}$/.test(addr)) {
          const lc = addr.toLowerCase();
          if (!addrs.has(lc)) addrs.set(lc, { logoURI: t.logoURI, overrideUrl: ovrForChain[lc] });
        }
        if (addrs.size >= limit) break;
      }
      if (addrs.size >= limit) break;
    }

    // Include overrides that might not be on tokenlists yet
    for (const [lc, url] of Object.entries(ovrForChain)) {
      if (!addrs.has(lc)) addrs.set(lc, { logoURI: undefined, overrideUrl: url });
    }

    // Prewarm each token
    for (const [addrLc, { logoURI, overrideUrl }] of addrs) {
      if (tried >= limit) break;
      tried++;
      const out = pngPath(chainId, addrLc);
      const current = await statBytes(out);
      if (current && current >= MIN_BYTES) {
        existing++;
        reports.push({ address: addrLc, action: "exists" });
        continue;
      }
      const hit = await trySources(chainId, addrLc, logoURI, overrideUrl);
      if (!hit) {
        skipped++;
        reports.push({ address: addrLc, action: "miss" });
        continue;
      }
      // write-through (never overwrite with smaller)
      const canWrite = !current || hit.buf.byteLength > current;
      if (canWrite) {
        try { await ensureDirFor(out); await fs.writeFile(out, hit.buf); } catch { /* ignore write errors */ }
      }
      saved++;
      reports.push({ address: addrLc, action: canWrite ? "saved" : "kept-bigger", bytes: hit.buf.byteLength, source: hit.host });
    }

    return NextResponse.json({
      ok: true,
      chainId,
      limit,
      counts: { tried, saved, skipped, existing },
      sample: reports.slice(0, 25),
    }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "unknown" }, { status: 500 });
  }
}
