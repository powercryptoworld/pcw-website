import { NextRequest, NextResponse } from "next/server";

/**
 * Lab-only gas helper for the Quote panel.
 * Strategy:
 *  - Try 1inch gas endpoint IF an API key is present (server-side).
 *  - If missing/invalid, fall back to eth_feeHistory on QUICKNODE_HTTP (or chain RPC in future).
 * Returns:
 *  { ok, chainId, source: "1inch" | "feeHistory",
 *    standardWei, fastWei, instantWei }
 */

type Hex = `0x${string}`;

function hexToBigInt(h?: string | null): bigint | null {
  if (!h || typeof h !== "string") return null;
  try { return BigInt(h); } catch { return null; }
}

function toDecimalStringWei(v?: bigint | null): string | undefined {
  if (v == null) return undefined;
  return v.toString(10);
}

async function fetchOneInchGas(chainId: number, apiKey?: string) {
  if (!apiKey) return null;
  // 1inch gas endpoint evolves; prefer their v1.x path when available.
  // We'll try a couple of known shapes; if both fail, return null silently.
  const candidates = [
    // Known recent style (example): https://api.1inch.dev/gas/v1.5/1
    `https://api.1inch.dev/gas/v1.5/${chainId}`,
    // Older style (fallback guess):
    `https://api.1inch.dev/gas/v1.4/${chainId}`,
  ];
  for (const url of candidates) {
    try {
      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store",
      });
      if (!r.ok) continue;
      const j = await r.json();
      // Accept common shapes:
      // { standard: { maxFeePerGas }, fast: {...}, instant: {...} }
      // or { baseFee, speeds: { standard: { maxFeePerGas }, ... } }
      const unwrap = (obj: any, key: string): bigint | null => {
        const v =
          obj?.[key]?.maxFeePerGas ??
          obj?.[key]?.maxFee ??
          obj?.[key]?.price ??
          obj?.[key]?.wei;
        if (typeof v === "string") {
          // could be decimal string or hex
          if (v.startsWith("0x")) return hexToBigInt(v);
          try { return BigInt(v); } catch { /* ignore */ }
        }
        return null;
      };

      let standard = unwrap(j?.speeds ?? j, "standard");
      let fast     = unwrap(j?.speeds ?? j, "fast");
      let instant  = unwrap(j?.speeds ?? j, "instant");

      // Another possible flat shape: { standardWei, fastWei, instantWei }
      if (!standard && typeof j?.standardWei === "string") {
        standard = hexToBigInt(j.standardWei) ?? BigInt(j.standardWei);
        fast     = hexToBigInt(j.fastWei) ?? BigInt(j.fastWei);
        instant  = hexToBigInt(j.instantWei) ?? BigInt(j.instantWei);
      }

      if (standard && fast && instant) {
        return {
          ok: true,
          chainId,
          source: "1inch",
          standardWei: standard.toString(10),
          fastWei: fast.toString(10),
          instantWei: instant.toString(10),
        };
      }
    } catch {
      // try next candidate
    }
  }
  return null;
}

async function feeHistoryTiers(rpcUrl: string) {
  // Ask the last ~10 blocks, request tip percentiles for 10/50/90
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_feeHistory",
    params: [10, "latest", [10, 50, 90]],
  };
  const r = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`feeHistory HTTP ${r.status}`);
  const j = await r.json();
  const baseFees: Hex[] = j?.result?.baseFeePerGas ?? [];
  const rewards: Hex[][] = j?.result?.reward ?? [];

  if (!Array.isArray(baseFees) || baseFees.length === 0 || !Array.isArray(rewards) || rewards.length === 0) {
    throw new Error("feeHistory: empty result");
  }

  // Use the last block (most recent) base fee + tip percentiles as maxFeePerGas-ish
  const base = hexToBigInt(baseFees[baseFees.length - 1]) ?? BigInt(0);

  const lastReward = rewards[rewards.length - 1]; // array of hex tips matching requested percentiles
  // We requested [10, 50, 90]
  const tip10 = hexToBigInt(lastReward?.[0]) ?? BigInt(0);
  const tip50 = hexToBigInt(lastReward?.[1]) ?? tip10;
  const tip90 = hexToBigInt(lastReward?.[2]) ?? tip50;

  // Standard/Fast/Instant = base + tip10/50/90
  const standard = base + tip10;
  const fast = base + tip50;
  const instant = base + tip90;

  return {
    standardWei: toDecimalStringWei(standard),
    fastWei: toDecimalStringWei(fast),
    instantWei: toDecimalStringWei(instant),
    source: "feeHistory" as const,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const chainId = Number(searchParams.get("chainId") || "1");
    if (!Number.isFinite(chainId) || chainId <= 0) {
      return NextResponse.json({ ok: false, error: "Missing or invalid chainId" }, { status: 400 });
    }

    // 1) Try 1inch gas (only if key present)
    const ONEINCH_API_KEY = process.env.ONEINCH_API_KEY;
    const oneInch = await fetchOneInchGas(chainId, ONEINCH_API_KEY || undefined);
    if (oneInch) return NextResponse.json(oneInch);

    // 2) Fallback: feeHistory via RPC
    // For now, we support mainnet through QUICKNODE_HTTP (already in your env).
    // You can expand this to per-chain RPCs later (lab-only).
    const rpcUrl = process.env.QUICKNODE_HTTP;
    if (!rpcUrl) {
      return NextResponse.json({ ok: false, error: "No RPC configured for feeHistory fallback" }, { status: 500 });
    }

    const tiers = await feeHistoryTiers(rpcUrl);
    return NextResponse.json({ ok: true, chainId, ...tiers });

  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
