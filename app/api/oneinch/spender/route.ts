import { NextResponse } from "next/server";

// 1inch router (spender) address mapping.
// It's the same address on many EVM chains.
const ONEINCH_SPENDER_BY_CHAIN: Record<number, `0x${string}`> = {
  1:  "0x1111111254EEB25477B68fb85Ed929f73A960582", // Ethereum
  56: "0x1111111254EEB25477B68fb85Ed929f73A960582", // BNB
  137:"0x1111111254EEB25477B68fb85Ed929f73A960582", // Polygon
  42161:"0x1111111254EEB25477B68fb85Ed929f73A960582", // Arbitrum
  10: "0x1111111254EEB25477B68fb85Ed929f73A960582", // Optimism
  8453:"0x1111111254EEB25477B68fb85Ed929f73A960582", // Base
  // add more as we enable them
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chainId = Number(searchParams.get("chainId") || "1");
    const spender = ONEINCH_SPENDER_BY_CHAIN[chainId];

    if (!spender) {
      return NextResponse.json(
        { ok: false, error: `Unsupported chainId: ${chainId}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      chainId,
      spender,
      source: "static-map:1inch",
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Unhandled error" },
      { status: 500 }
    );
  }
}
