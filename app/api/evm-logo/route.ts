import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CdnHit = { url: string; buf: Buffer; contentType: string; source: string };

const MIN_BYTES = 1024;

/* === paths/fs === */
function pngPath(chainId: number, addrLc: string) {
  return path.join(process.cwd(), "public", "token-logos", String(chainId), `${addrLc}.png`);
}
function pngHref(chainId: number, addrLc: string) {
  return `/token-logos/${chainId}/${addrLc}.png`;
}
async function statBytes(p: string): Promise<number | null> { try { const s = await fs.stat(p); return s.isFile() ? s.size : null; } catch { return null; } }
async function readLocal(chainId: number, addrLc: string): Promise<Buffer | null> { try { return await fs.readFile(pngPath(chainId, addrLc)); } catch { return null; } }
async function ensureDirFor(p: string) { await fs.mkdir(path.dirname(p), { recursive: true }); }

/* === headers === */
function cacheHeaders() { return { "Cache-Control": "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400" }; }
function pngHeaders(extra: Record<string, string> = {}) { return { "Content-Type": "image/png", ...cacheHeaders(), ...extra }; }

/* === chains === */
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
function chainSlug(chainId: number): string | null {
  switch (chainId) {
    case 1: return "ethereum";
    case 56: return "bsc";
    case 137: return "polygon";
    case 250: return "fantom";
    case 43114: return "avalanche";
    case 42161: return "arbitrum";
    case 10: return "optimism";
    case 8453: return "base";
    default: return null;
  }
}

/* === CDN candidates (expanded) === */
function candidates(chainId: number, addrRaw: string, addrLc: string): string[] {
  const list: string[] = [];
  const tw = trustWalletChain(chainId);
  const slug = chainSlug(chainId);

  // TrustWallet (raw/lc + jsdelivr mirror)
  if (tw) {
    list.push(`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${tw}/assets/${addrRaw}/logo.png`);
    list.push(`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${tw}/assets/${addrLc}/logo.png`);
    list.push(`https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/${tw}/assets/${addrRaw}/logo.png`);
    list.push(`https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/${tw}/assets/${addrLc}/logo.png`);
  }

  // 1inch (both hosts)
  list.push(`https://tokens-data.1inch.io/images/${chainId}/${addrRaw}.png`);
  list.push(`https://tokens-data.1inch.io/images/${chainId}/${addrLc}.png`);
  list.push(`https://tokens.1inch.io/${addrRaw}.png`);
  list.push(`https://tokens.1inch.io/${addrLc}.png`);

  // Pancake — ALL common patterns
  list.push(`https://assets.pancakeswap.finance/web/tokens/${addrRaw}.png`);
  list.push(`https://assets.pancakeswap.finance/web/tokens/${addrLc}.png`);
  list.push(`https://assets.pancakeswap.finance/web/${addrRaw}.png`);
  list.push(`https://assets.pancakeswap.finance/web/${addrLc}.png`);
  list.push(`https://assets.pancakeswap.finance/images/tokens/${addrRaw}.png`);
  list.push(`https://assets.pancakeswap.finance/images/tokens/${addrLc}.png`);

  // DexScreener — both paths seen in the wild
  if (slug) {
    list.push(`https://cdn.dexscreener.com/token-images/${slug}/${addrRaw}.png`);
    list.push(`https://cdn.dexscreener.com/token-images/${slug}/${addrLc}.png`);
    list.push(`https://cdn.dexscreener.com/token-icons/${slug}/${addrRaw}.png`);
    list.push(`https://cdn.dexscreener.com/token-icons/${slug}/${addrLc}.png`);
  }
  return list;
}

function okImage(ct?: string) { return !!ct && ct.startsWith("image/"); }
async function tryFetch(url: string): Promise<CdnHit | null> {
  try {
    const r = await fetch(url, { redirect: "follow", cache: "no-store" });
    if (!r.ok) return null;
    const ct = r.headers.get("content-type") || "";
    if (!okImage(ct)) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.byteLength < MIN_BYTES) return null;
    return { url, buf, contentType: ct, source: new URL(url).hostname };
  } catch { return null; }
}
async function firstGood(chainId: number, addrRaw: string, addrLc: string): Promise<CdnHit | null> {
  for (const u of candidates(chainId, addrRaw, addrLc)) {
    const hit = await tryFetch(u);
    if (hit) return hit;
  }
  return null;
}

/* === handler === */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const chainId = Number(searchParams.get("chainId") || "0");
    const addressRaw = (searchParams.get("address") || "").trim();
    const prefer = (searchParams.get("prefer") || "").toLowerCase();
    const redirect = searchParams.get("redirect") === "1";
    if (!chainId || !/^0x[0-9a-fA-F]{40}$/.test(addressRaw)) return new NextResponse("Bad params", { status: 400 });

    const addrLc = addressRaw.toLowerCase();

    // Local PNG first (if present)
    const local = await readLocal(chainId, addrLc);
    const localBytes = await statBytes(pngPath(chainId, addrLc));
    if (prefer !== "cdn" && local && (localBytes ?? 0) > 0) {
      if (redirect) return NextResponse.redirect(pngHref(chainId, addrLc), 302);
      return new NextResponse(local, { status: 200, headers: pngHeaders({ "x-pcw-source": "local" }) });
    }

    // CDNs → write-through cache
    const cdn = await firstGood(chainId, addressRaw, addrLc);
    if (cdn) {
      const out = pngPath(chainId, addrLc);
      const canWrite = (localBytes ?? 0) === 0 || cdn.buf.byteLength > (localBytes ?? 0);
      if (canWrite) { try { await ensureDirFor(out); await fs.writeFile(out, cdn.buf); } catch {} }
      if (redirect) return NextResponse.redirect(pngHref(chainId, addrLc), 302);
      return new NextResponse(cdn.buf, { status: 200, headers: pngHeaders({ "x-pcw-source": `cdn:${cdn.source}`, "x-pcw-url": cdn.url }) });
    }

    // SVG fallback
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#a3e635"/><stop offset="100%" stop-color="#22d3ee"/></linearGradient></defs><rect width="100%" height="100%" fill="#0b1220"/><circle cx="32" cy="32" r="28" fill="url(#g)"/><text x="32" y="38" font-family="system-ui" font-size="20" text-anchor="middle" fill="#0b1220">?</text></svg>`;
    return new NextResponse(svg, { status: 200, headers: { "Content-Type": "image/svg+xml", ...cacheHeaders(), "x-pcw-source": "svg" } });
  } catch (e: any) {
    return new NextResponse(`evm-logo error: ${e?.message || "unknown"}`, { status: 500 });
  }
}
