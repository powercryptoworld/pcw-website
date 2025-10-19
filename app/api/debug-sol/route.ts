import { NextResponse } from "next/server";
import { fetchSolMintMeta } from "@/lib/solanaOnchain";

function cors(json: any, init?: number | ResponseInit) {
  const res = NextResponse.json(json, init);
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.headers.set("Cache-Control", "no-store");
  return res;
}
export function OPTIONS() { return cors({}, { status: 204 }); }

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const a = (searchParams.get("addr") || "").trim();
  if (!a) return cors({ ok: false, error: "addr required" }, { status: 400 });
  try {
    const meta = await fetchSolMintMeta(a);
    if (!meta) return cors({ ok: false, error: "not found on-chain" }, { status: 404 });
    return cors({ ok: true, meta }, { status: 200 });
  } catch (e: any) {
    return cors({ ok: false, error: e?.message || "failed" }, { status: 500 });
  }
}
