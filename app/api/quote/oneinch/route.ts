import { NextRequest, NextResponse } from "next/server";

/**
 * /api/quote/oneinch
 * Query params:
 *  - chainId: number (required)
 *  - src: token address (required) — for native use the wrapped token address (e.g. WETH)
 *  - dst: token address (required)
 *  - amount: human amount string, e.g. "0.1234" (required)
 *  - srcDecimals: number (required) — decimals for src token
 *  - includeProtocols: "1" | "0" (optional, default "1")
 *  - slippageBps: number (optional, forwarded if supported by upstream)
 *
 * Returns a normalized JSON with the upstream payload plus a tiny summary for route preview.
 *
 * NOTE: We **do not** expose the API key to the client; everything routes through here.
 */

function decimalToWei(amount: string, decimals: number): bigint {
  // Safe, allocation-free-ish conversion of "12.345" with given decimals into BigInt base units.
  const [whole, fracRaw = ""] = amount.trim().split(".");
  const frac = fracRaw.slice(0, decimals); // trim extra precision
  const fracPadded = frac + "0".repeat(Math.max(0, decimals - frac.length));
  const normalized = (whole || "0").replace(/^0+/, "") || "0";
  const weiStr = (normalized + fracPadded).replace(/^0+/, "") || "0";
  return BigInt(weiStr);
}

function summarizeProtocols(protocols: any): string | null {
  // 1inch v5/v6 returns a nested structure for path splits. We try to flatten readable names.
  // Example shape: [[[{ name: "UNISWAP_V3", part: 100, ... }, ...]], ...]
  try {
    const names: string[] = [];
    const visit = (node: any) => {
      if (Array.isArray(node)) node.forEach(visit);
      else if (node && typeof node === "object" && node.name) names.push(String(node.name));
    };
    visit(protocols);
    const orderedUnique = [...new Set(names)];
    return orderedUnique.length ? orderedUnique.join(" → ") : null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const chainId = url.searchParams.get("chainId");
    const src = url.searchParams.get("src");
    const dst = url.searchParams.get("dst");
    const amountHuman = url.searchParams.get("amount");
    const srcDecimals = url.searchParams.get("srcDecimals");
    const includeProtocols = url.searchParams.get("includeProtocols") ?? "1";
    const slippageBps = url.searchParams.get("slippageBps") ?? undefined;

    if (!chainId || !src || !dst || !amountHuman || !srcDecimals) {
      return NextResponse.json(
        { ok: false, error: "Missing required params: chainId, src, dst, amount, srcDecimals" },
        { status: 400 },
      );
    }

    const amountWei = decimalToWei(amountHuman, Number(srcDecimals));

    const upstream = new URL(`https://api.1inch.dev/swap/v6.0/${chainId}/quote`);
    upstream.searchParams.set("src", src);
    upstream.searchParams.set("dst", dst);
    upstream.searchParams.set("amount", amountWei.toString());
    // Ask for protocols so we can render a route preview in the UI.
    if (includeProtocols === "1") upstream.searchParams.set("includeProtocols", "true");
    // Forward slippage bps if allowed by upstream; ignored otherwise (harmless).
    if (slippageBps) upstream.searchParams.set("slippageBps", slippageBps);

    const key = process.env.ONEINCH_API_KEY;
    if (!key) {
      return NextResponse.json(
        { ok: false, error: "Server misconfigured: ONEINCH_API_KEY missing" },
        { status: 500 },
      );
    }

    const res = await fetch(upstream.toString(), {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${key}`,
      },
      // Keep it quick; this is a UI quote.
      next: { revalidate: 0 },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Normalize upstream errors a bit (rate limits, liquidity, bad params, etc.)
      return NextResponse.json(
        { ok: false, status: res.status, error: data?.description || data?.message || "Upstream error", raw: data },
        { status: res.status },
      );
    }

    // Heuristic field names across 1inch versions (v6 uses dstAmount; sometimes gas/estimatedGas exists)
    const gasUnits = data?.gas ?? data?.estimatedGas ?? null;
    const gasPrice = data?.gasPrice ?? data?.tx?.gasPrice ?? null;
    const routeSummary = summarizeProtocols(data?.protocols ?? data?.route ?? null);

    return NextResponse.json({
      ok: true,
      chainId: Number(chainId),
      src,
      dst,
      amountHuman,
      amountWei: amountWei.toString(),
      quote: {
        dstAmount: data?.dstAmount ?? null,
        protocols: data?.protocols ?? null,
        routeSummary,
        gas: gasUnits,
        gasPrice,
      },
      raw: data,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}
