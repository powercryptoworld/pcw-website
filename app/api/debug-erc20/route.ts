import { NextResponse } from "next/server";
import { fetchErc20Meta } from "@/lib/erc20";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chainId = Number(searchParams.get("chainId") || "56");
  const address = (searchParams.get("address") || "") as `0x${string}`;
  try {
    const meta = await fetchErc20Meta(chainId, address);
    return NextResponse.json({ ok: true, meta }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
