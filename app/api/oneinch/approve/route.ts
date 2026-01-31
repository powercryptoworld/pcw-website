import "server-only";
import { NextResponse } from "next/server";

function pickChain(chainId: number) {
  switch (chainId) {
    case 1:  return { base: "https://api.1inch.dev/swap/v6.0/1" };
    case 56: return { base: "https://api.1inch.dev/swap/v6.0/56" };
    default: return null;
  }
}

export async function GET(req: Request) {
  try {
    const u = new URL(req.url);
    const chainId = Number(u.searchParams.get("chainId") || "1");
    const token = u.searchParams.get("token") || "";   // ERC-20 address to approve (e.g., WETH)
    const wallet = u.searchParams.get("wallet") || ""; // required for 1inch context, but tx is generic

    if (!process.env.ONEINCH_API_KEY) {
      return NextResponse.json({ ok:false, error:"ONEINCH_API_KEY missing" }, { status:500 });
    }
    if (!chainId || !token || !wallet) {
      return NextResponse.json({ ok:false, error:"Missing chainId/token/wallet" }, { status:400 });
    }
    const cfg = pickChain(chainId);
    if (!cfg) return NextResponse.json({ ok:false, error:"Unsupported chain" }, { status:400 });

    const api = new URL(`${cfg.base}/approve/transaction`);
    api.searchParams.set("tokenAddress", token);

    const r = await fetch(api.toString(), {
      headers: { Authorization: `Bearer ${process.env.ONEINCH_API_KEY}` },
      cache: "no-store",
    });

    const j = await r.json().catch(() => null);
    if (!r.ok) {
      const msg = (j && (j.description || j.message || j.error)) || `HTTP ${r.status}`;
      return NextResponse.json({ ok:false, error:msg, raw:j }, { status:r.status });
    }

    // { to, data, value } for the approve tx
    return NextResponse.json({ ok:true, tx:j, source:"1inch:approve" });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:e?.message || "approve failed" }, { status:500 });
  }
}
