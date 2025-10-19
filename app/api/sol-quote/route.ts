import { NextResponse } from "next/server";
import https from "https";

export const runtime = "nodejs";

/** Mints (mainnet) */
const MINT_SOL  = "So11111111111111111111111111111111111111112"; // 9 dec
const MINT_USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // 6 dec

/** Use api.jup.ag (reachable in your env) */
const BASE = "https://api.jup.ag";

/** Force IPv4 */
const ipv4Agent = new https.Agent({ family: 4, keepAlive: true });

function toLamportsDecimalStr(amountStr: string): string {
  const s = (amountStr || "").trim();
  if (!/^\d*(\.\d*)?$/.test(s)) return "0";
  const [w, f = ""] = s.split(".");
  const frac = (f + "000000000").slice(0, 9); // 9 decimals for SOL
  const raw = `${w || "0"}${frac}`.replace(/^0+(?=\d)/, "");
  return raw || "0";
}

async function fetchQuote(lamports: string) {
  const url =
    `${BASE}/v6/quote?` +
    `inputMint=${MINT_SOL}&outputMint=${MINT_USDC}` +
    `&amount=${lamports}&slippageBps=50&onlyDirectRoutes=false`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      // keep minimal headers; v6 should allow server calls from api.jup.ag
    },
    // @ts-ignore
    agent: ipv4Agent,
    cache: "no-store",
    redirect: "follow",
  });

  const text = await res.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch {}
  return { ok: res.ok, status: res.status, json, text, url };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const input = searchParams.get("amount") || "0";
    const lamports = toLamportsDecimalStr(input);

    const out = await fetchQuote(lamports);
    if (out.ok) {
      return NextResponse.json(out.json ?? { raw: out.text, source: "api.jup.ag v6" }, { status: 200 });
    }
    return NextResponse.json(
      { error: `Jupiter error ${out.status}`, url: out.url, data: out.json ?? out.text?.slice(0, 400) },
      { status: 502 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: "Route error", cause: String(err?.message || err) }, { status: 500 });
  }
}
