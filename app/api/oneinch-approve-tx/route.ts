import { NextResponse } from "next/server";

const ONEINCH_BASE = "https://api.1inch.dev/swap/v6.0";
const BSC_CHAIN_ID = 56;

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = (searchParams.get("token") || "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d").trim();
  const amount = (searchParams.get("amount") || "0").trim(); // 0 = unlimited (per 1inch)

  if (!process.env.ONEINCH_KEY) {
    return NextResponse.json({ error: "Missing ONEINCH_KEY" }, { status: 400 });
  }

  const url = `${ONEINCH_BASE}/${BSC_CHAIN_ID}/approve/transaction?tokenAddress=${token}&amount=${amount}`;
  try {
    const r = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.ONEINCH_KEY}`,
        Accept: "application/json",
        "User-Agent": "pcw-codespaces",
      },
      cache: "no-store",
    });

    const text = await r.text();

    // If success and JSON, just pass it through
    try {
      const data = JSON.parse(text);
      if (r.ok && !data?.error) return NextResponse.json(data);
    } catch {}

    // On error, return the raw upstream body so we can read it
    return new Response(text, {
      status: r.status,
      headers: { "content-type": r.headers.get("content-type") || "text/plain" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Network error" }, { status: 500 });
  }
}
