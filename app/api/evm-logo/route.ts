import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";

function toChecksumAddress(address: string) {
  const a = address.toLowerCase().replace(/^0x/, "");
  try {
    const { keccak256 } = require("@ethersproject/keccak256");
    const { toUtf8Bytes } = require("@ethersproject/strings");
    const hash = keccak256(toUtf8Bytes(a));
    let ret = "0x";
    for (let i = 0; i < a.length; i++) ret += parseInt(hash[i + 2], 16) >= 8 ? a[i].toUpperCase() : a[i];
    return ret;
  } catch {
    return "0x" + a;
  }
}

async function tryLocal(chainId: string, addrLower: string) {
  const base = path.join(process.cwd(), "public", "token-logos", chainId);
  for (const ext of ["svg", "png"]) {
    const p = path.join(base, `${addrLower}.${ext}`);
    try {
      const data = await fs.readFile(p);
      const ct = ext === "svg" ? "image/svg+xml" : "image/png";
      return new Response(data, {
        headers: {
          "content-type": ct,
          "cache-control": "public, max-age=86400, immutable",
          "x-pcw-source": `local:${ext}`,
        },
      });
    } catch {}
  }
  return null;
}

async function headOk(url: string) {
  try {
    const r = await fetch(url, { method: "HEAD", cache: "no-store", redirect: "follow" });
    if (!r.ok) return false;
    const ct = r.headers.get("content-type") ?? "";
    return /^image\//i.test(ct);
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chainId = (searchParams.get("chainId") ?? "").trim();
  const raw = (searchParams.get("address") ?? "").trim().toLowerCase();
  const prefer = (searchParams.get("prefer") ?? "").toLowerCase();   // "cdn" to skip local-first
  const redirect = (searchParams.get("redirect") ?? "").trim() === "1"; // when true, 302 to CDN

  if (!chainId || !raw || !/^0x[0-9a-f]{40}$/.test(raw)) {
    return new Response("Bad params", { status: 400 });
  }

  // local-first unless prefer=cdn
  if (prefer !== "cdn") {
    const local = await tryLocal(chainId, raw);
    if (local) return local;
  }

  const checksum = toChecksumAddress(raw);
  const chainFolder =
    chainId === "56"    ? "smartchain" :
    chainId === "1"     ? "ethereum"   :
    chainId === "137"   ? "polygon"    :
    chainId === "10"    ? "optimism"   :
    chainId === "42161" ? "arbitrum"   :
    "smartchain";
  const dexSlug =
    chainId === "56"    ? "bsc" :
    chainId === "1"     ? "ethereum" :
    chainId === "137"   ? "polygon"  :
    chainId === "10"    ? "optimism" :
    chainId === "42161" ? "arbitrum" :
    "bsc";

  const sources = [
    // Pancake
    `https://assets.pancakeswap.finance/web/tokens/${raw}.png`,
    `https://assets.pancakeswap.finance/web/tokens/${checksum}.png`,
    // 1inch
    `https://tokens.1inch.io/${checksum}.png`,
    `https://tokens.1inch.io/${checksum}.svg`,
    // TrustWallet
    `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chainFolder}/assets/${checksum}/logo.png`,
    // DexScreener
    `https://cdn.dexscreener.com/token-icons/${dexSlug}/${raw}.png`,
    `https://cdn.dexscreener.com/token-icons/${dexSlug}/${checksum}.png`,
  ];

  for (const url of sources) {
    if (await headOk(url)) {
      if (redirect) {
        return new Response(null, {
          status: 302,
          headers: {
            "Location": url,
            "cache-control": "public, max-age=86400, immutable",
            "x-pcw-source": `redirect:${url}`,
          },
        });
      }
      // Fallback: proxy bytes (shouldn't be needed once redirect=1 is used by UI)
      const r = await fetch(url, { cache: "no-store", redirect: "follow" });
      const body = await r.arrayBuffer();
      const ct = r.headers.get("content-type") ?? "image/png";
      return new Response(body, {
        headers: {
          "content-type": ct,
          "cache-control": "public, max-age=86400, immutable",
          "x-pcw-source": url,
        },
      });
    }
  }

  if (prefer === "cdn") {
    const localLast = await tryLocal(chainId, raw);
    if (localLast) return localLast;
  }

  return new Response("Not found", { status: 404 });
}
