import { NextResponse } from "next/server";

const ONEINCH_BASE = "https://api.1inch.dev/swap/v6.0";
const BSC_CHAIN_ID = 56;

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = (searchParams.get("token") || "").trim(); // ERC-20 address
  const wallet = (searchParams.get("wallet") || "").trim(); // user address

  if (!process.env.ONEINCH_KEY) return NextResponse.json({ error: "Missing ONEINCH_KEY" }, { status: 400 });
  if (!token) return NextResponse.json({ error: "Missing ?token=<erc20 address>" }, { status: 400 });
  if (!wallet) return NextResponse.json({ error: "Missing ?wallet=<user address>" }, { status: 400 });

  const url = `${ONEINCH_BASE}/${BSC_CHAIN_ID}/approve/allowance?tokenAddress=${token}&walletAddress=${wallet}`;
  try {
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.ONEINCH_KEY}` },
      cache: "no-store",
    });
    const text = await r.text();
    let data: any; try { data = JSON.parse(text); } catch { data = { raw: text }; }
    if (!r.ok || data?.error) return NextResponse.json({ error: data?.description || text }, { status: 400 });
    return NextResponse.json(data); // { allowance: "0" | "<wei>" }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Network error" }, { status: 500 });
  }
}
