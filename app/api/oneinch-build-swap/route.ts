import { NextResponse } from "next/server";

const ONEINCH_BASE = "https://api.1inch.dev/swap/v6.0";
const BSC = 56;
const NATIVE_BNB = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const BSC_USDC = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const amountWei = (searchParams.get("amountWei") || "").trim(); // example: 10000000000000000 (0.01 BNB)
  const from = (searchParams.get("from") || "").trim();           // your wallet address
  const slippage = (searchParams.get("slippage") || "0.5").trim(); // percent as string

  if (!process.env.ONEINCH_KEY) return NextResponse.json({ error: "Missing ONEINCH_KEY" }, { status: 400 });
  if (!amountWei) return NextResponse.json({ error: "Missing ?amountWei=<wei>" }, { status: 400 });
  if (!from) return NextResponse.json({ error: "Missing ?from=<wallet address>" }, { status: 400 });

  const url = new URL(`${ONEINCH_BASE}/${BSC}/swap`);
  url.searchParams.set("src", NATIVE_BNB);
  url.searchParams.set("dst", BSC_USDC);
  url.searchParams.set("amount", amountWei);
  url.searchParams.set("from", from);
  url.searchParams.set("slippage", slippage);
  url.searchParams.set("disableEstimate", "true");  // simpler response
  url.searchParams.set("allowPartialFill", "false");

  try {
    const r = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${process.env.ONEINCH_KEY}` },
      cache: "no-store",
    });
    const text = await r.text();
    let data: any; try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!r.ok || data?.error) {
      return NextResponse.json({ error: data?.description || data?.message || `HTTP ${r.status}`, debug: data }, { status: 400 });
    }

    // Expected: { tx: { to, data, value, gasPrice? ... }, ... }
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Network error" }, { status: 500 });
  }
}
