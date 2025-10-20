import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

/**
 * GET /api/debug-file?path=/token-logos/56/0x9370a51c9f2ae6b23719ab74f05261891c609a23.svg
 * Checks if a file under /public exists and returns its absolute path + exists flag.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const rel = url.searchParams.get("path") || "";
  if (!rel.startsWith("/")) {
    return NextResponse.json({ ok: false, error: "path must start with /" }, { status: 400 });
  }
  const abs = path.join(process.cwd(), "public", rel);
  try {
    await fs.access(abs);
    return NextResponse.json({ ok: true, exists: true, path: abs });
  } catch {
    return NextResponse.json({ ok: true, exists: false, path: abs });
  }
}
