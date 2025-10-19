import { NextResponse } from "next/server";
import https from "https";

const ipv4Agent = new https.Agent({ family: 4, keepAlive: true });

const HOSTS = [
  { name: "lite-api",   url: "https://lite-api.jup.ag/swap/v1/ready" },
  { name: "quote-api",  url: "https://quote-api.jup.ag/v6/ready" },
  { name: "api-main",   url: "https://api.jup.ag/health" },
];

export async function GET() {
  const results: any[] = [];
  for (const h of HOSTS) {
    try {
      const res = await fetch(h.url, {
        method: "GET",
        headers: { accept: "application/json" },
        // @ts-ignore
        agent: ipv4Agent,
        redirect: "follow",
        cache: "no-store",
      });
      const text = await res.text();
      let json: any = null;
      try { json = JSON.parse(text); } catch {}
      results.push({
        host: h.name,
        url: h.url,
        status: res.status,
        ok: res.ok,
        bodySample: json ?? text.slice(0, 300),
      });
    } catch (e: any) {
      results.push({
        host: h.name,
        url: h.url,
        error: String(e?.message || e),
      });
    }
  }
  return NextResponse.json({ results }, { status: 200 });
}
