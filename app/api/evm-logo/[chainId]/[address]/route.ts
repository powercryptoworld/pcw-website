import type { NextRequest } from "next/server";

const ONE_DAY = 60 * 60 * 24;

async function tryFetch(url: string) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      // Stream the bytes through with a sensible content-type if available
      const contentType = res.headers.get("content-type") || "image/png";
      const buf = Buffer.from(await res.arrayBuffer());
      return new Response(buf, {
        status: 200,
        headers: {
          "content-type": contentType,
          "cache-control": `public, max-age=${ONE_DAY}`,
        },
      });
    }
  } catch {}
  return null;
}

/**
 * /api/evm-logo/:chainId/:address
 * Priority:
 *  1) Local project: /token-logos/{chainId}/{address}.svg
 *  2) 1inch CDN:     https://tokens.1inch.io/{address}.png
 *  (We can add TrustWallet checksum path next.)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { chainId: string; address: string } }
) {
  const chainId = params.chainId;
  const addrLower = params.address.toLowerCase();

  // 1) Local project SVG
  // NOTE: this uses our public asset path that Next serves.
  {
    const localUrl = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/token-logos/${chainId}/${addrLower}.svg`;
    const r = await tryFetch(localUrl);
    if (r) return r;
  }

  // 2) 1inch CDN (lowercase address)
  {
    const r = await tryFetch(`https://tokens.1inch.io/${addrLower}.png`);
    if (r) return r;
  }

  // TODO: add TrustWallet checksum source here in a follow-up step

  return new Response("logo not found", { status: 404 });
}
