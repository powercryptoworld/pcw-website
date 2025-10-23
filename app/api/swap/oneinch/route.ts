import { NextResponse } from "next/server";

const ONEINCH_BASE = "https://api.1inch.dev/swap/v6.0";

// Convert human amount to wei string using token decimals
function toWei(human: string, decimals: number) {
  const [intPart, frac = ""] = (human || "0").trim().split(".");
  const d = Math.max(0, Math.min(36, Number(decimals) || 0));
  const fracPadded = (frac + "0".repeat(d)).slice(0, d);
  try {
    const intWei = BigInt(intPart || "0") * (10n ** BigInt(d));
    const fracWei = BigInt(fracPadded || "0");
    return (intWei + fracWei).toString();
  } catch {
    return "0";
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const chainId = Number(url.searchParams.get("chainId") || "");
    const from     = url.searchParams.get("from") || "";
    const src      = url.searchParams.get("src") || "";
    const dst      = url.searchParams.get("dst") || "";
    const amount   = url.searchParams.get("amount") || "0";
    const srcDec   = Number(url.searchParams.get("srcDecimals") || "18");
    const slippageBps = Number(url.searchParams.get("slippageBps") || "50");

    if (!chainId || !from || !src || !dst) {
      return NextResponse.json({ ok: false, error: "Missing chainId/from/src/dst" }, { status: 400 });
    }

    const apiKey = process.env.ONEINCH_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "Missing ONEINCH_API_KEY" }, { status: 500 });
    }

    const amountWei = toWei(amount, srcDec);
    const slippagePct = (slippageBps / 100).toFixed(2); // 50 -> "0.50"

    const params = new URLSearchParams({
      src,
      dst,
      amount: amountWei,
      from,
      slippage: slippagePct,           // percent string
      allowPartialFill: "false",
      disableEstimate: "false",
      includeProtocols: "true",
      // You can add other 1inch params here if needed (e.g., referrer, fee, etc.)
    });

    const u = `${ONEINCH_BASE}/${chainId}/swap?${params.toString()}`;
    const r = await fetch(u, {
      headers: { Authorization: `Bearer ${apiKey}`, accept: "application/json" },
      cache: "no-store",
    });
    const j = await r.json().catch(() => ({}));

    if (!r.ok || !j?.tx) {
      return NextResponse.json(
        { ok: false, error: j?.description || `HTTP ${r.status}`, raw: j },
        { status: r.status }
      );
    }

    // Normalize some fields + a simple route summary
    const tx = j.tx || {};
    const dstAmount = j?.dstAmount ?? null;
    const protocols = j?.protocols ?? null;
    const routeSummary = Array.isArray(protocols)
      ? (protocols[0] || [])
          .map((leg: any) => (Array.isArray(leg) && leg[0]?.name) ? leg[0].name : "")
          .filter(Boolean)
          .join(" → ")
      : null;

    return NextResponse.json({
      ok: true,
      chainId,
      amountHuman: amount,
      amountWei,
      tx: {
        to: tx.to,
        value: tx.value,
        gas: tx.gas,
        gasPrice: tx.gasPrice,
        dataLen: typeof tx.data === "string" ? tx.data.length : undefined,
      },
      quote: {
        dstAmount,
        protocols,
        routeSummary,
      },
      raw: j,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Unexpected error" }, { status: 500 });
  }
}
