import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MIN_BYTES = 1024;

function pngPath(chainId: number, addrLc: string) {
  return path.join(process.cwd(), "public", "token-logos", String(chainId), `${addrLc}.png`);
}
async function ensureDirFor(p: string) { await fs.mkdir(path.dirname(p), { recursive: true }); }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const chainId = Number(String(body.chainId || "").trim());
    const address = String(body.address || "").trim();
    const url = String(body.url || "").trim();

    if (!chainId || !/^0x[0-9a-fA-F]{40}$/.test(address) || !/^https?:\/\//.test(url)) {
      return NextResponse.json({ ok: false, error: "bad_params" }, { status: 400 });
    }

    const lc = address.toLowerCase();

    const r = await fetch(url, { redirect: "follow", cache: "no-store" });
    if (!r.ok) return NextResponse.json({ ok: false, error: `fetch_${r.status}` }, { status: 400 });

    const ct = r.headers.get("content-type") || "";
    if (!ct.startsWith("image/")) return NextResponse.json({ ok: false, error: "not_image" }, { status: 400 });

    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.byteLength < MIN_BYTES) return NextResponse.json({ ok: false, error: "too_small" }, { status: 400 });

    const out = pngPath(chainId, lc);
    await ensureDirFor(out);
    await fs.writeFile(out, buf);

    return NextResponse.json({ ok: true, bytes: buf.byteLength, saved: `/token-logos/${chainId}/${lc}.png` }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "unknown" }, { status: 500 });
  }
}
