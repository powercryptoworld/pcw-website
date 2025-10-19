import { NextResponse } from "next/server";
import { liveSolanaMeta } from "@/lib/solanaLive";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mint = (searchParams.get("mint") || "").trim();
    if (!mint) return NextResponse.json({ ok: false, error: "no mint" }, { status: 400 });

    const meta = await liveSolanaMeta(mint);
    return NextResponse.json({ ok: true, meta }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "failed" }, { status: 200 });
  }
}
