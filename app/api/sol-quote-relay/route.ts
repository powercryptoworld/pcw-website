import { NextResponse } from "next/server";

const SOL = "So11111111111111111111111111111111111111112";
const USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

function buildMirrorUrl(lamports: string) {
  const q = new URLSearchParams({
    inputMint: SOL,
    outputMint: USDC,
    amount: lamports,
    slippageBps: "50",
    swapMode: "ExactIn",
    onlyDirectRoutes: "false",
  }).toString();
  // Use HTTPS host wrapped by r.jina.ai (adds permissive CORS)
  return `https://r.jina.ai/https://quote-api.jup.ag/v6/quote?${q}`;
}

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const amount = (searchParams.get("amount") || "").trim();
    if (!amount) return NextResponse.json({ error: "Provide ?amount=<SOL amount> (e.g., 0.1)" }, { status: 400 });

    const [whole, frac = ""] = amount.split(".");
    const fracPadded = (frac + "000000000").slice(0, 9);
    const lamports = (BigInt(whole || "0") * 1000000000n + BigInt(fracPadded || "0")).toString();

    const url = buildMirrorUrl(lamports);
    const res = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0",
        "accept": "application/json,text/plain,*/*",
      },
      cache: "no-store",
    });

    const text = await res.text();
    let data: any; try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!res.ok || data?.error || !data?.outAmount) {
      return NextResponse.json({ error: data?.error || `HTTP ${res.status}`, debug: data }, { status: 502 });
    }

    return NextResponse.json({
      via: "relay",
      inputMint: SOL,
      outputMint: USDC,
      inAmount: lamports,
      outAmount: data.outAmount,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Relay error" }, { status: 500 });
  }
}
