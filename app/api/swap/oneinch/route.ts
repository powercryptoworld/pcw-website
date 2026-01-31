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
    const from = url.searchParams.get("from") || "";
    const src = url.searchParams.get("src") || "";
    const dst = url.searchParams.get("dst") || "";
    const amount = url.searchParams.get("amount") || "0";
    const srcDec = Number(url.searchParams.get("srcDecimals") || "18");
    const slippageBps = Number(url.searchParams.get("slippageBps") || "50");

    if (!chainId || !from || !src || !dst) {
      return NextResponse.json({ ok: false, error: "Missing params" }, { status: 400 });
    }

    const apiKey = process.env.ONEINCH_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "Missing ONEINCH_API_KEY" }, { status: 500 });
    }

    // amount can be human (0.0013) OR wei (1300000000000000)
    const amountWei =
      amount.includes(".")
        ? toWei(amount, srcDec)
        : amount;
    const slippagePct = (slippageBps / 100).toFixed(2);

    const params = new URLSearchParams({
      src,
      dst,
      amount: amountWei,
      from,
      slippage: slippagePct,
      allowPartialFill: "false",
      disableEstimate: "false",
    });

    const u = `${ONEINCH_BASE}/${chainId}/swap?${params.toString()}`;
    const r = await fetch(u, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        accept: "application/json",
      },
      cache: "no-store",
    });

    const j = await r.json();

    if (!r.ok || !j?.tx) {
      return NextResponse.json({ ok: false, error: j }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      tx: {
        to: j.tx.to,
        data: j.tx.data,
        value: j.tx.value,
        gas: j.tx.gas,
        gasPrice: j.tx.gasPrice,
      },
      quote: {
        dstAmount: j.dstAmount,
        protocols: j.protocols,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
