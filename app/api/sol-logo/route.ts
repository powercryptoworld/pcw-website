import { NextRequest } from "next/server";
import { firstReachableUrl } from "@/lib/firstReachableUrl";

export const dynamic = "force-dynamic";

// Wrapped SOL mint (wSOL) for a reliable logo
const WSOL_MINT = "So11111111111111111111111111111111111111112";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mint = (searchParams.get("mint") || "").trim();
    const symbol = (searchParams.get("symbol") || "").trim().toUpperCase();
    const name = (searchParams.get("name") || "").trim();

    // If we don't have a mint but this is SOL, serve wSOL logo as a stand-in
    if (!mint && (symbol === "SOL" || name.toUpperCase() === "SOLANA")) {
      const url = await firstReachableUrl([
        `https://img.jup.ag/token/${WSOL_MINT}`,
      ]);
      if (url) {
        return new Response(JSON.stringify({ url }), {
          status: 200,
          headers: { "content-type": "application/json", "cache-control": "public, max-age=600" },
        });
      }
      return new Response("not found", { status: 404 });
    }

    if (!mint) {
      return new Response(JSON.stringify({ error: "mint required" }), { status: 400 });
    }

    const candidates: string[] = [
      // Jupiter
      `https://img.jup.ag/token/${mint}`,
      // TrustWallet Solana
      `https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/solana/assets/${mint}/logo.png`,
      // Solana token-list
      `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${mint}/logo.png`,
    ];

    const url = await firstReachableUrl(candidates);
    if (!url) return new Response("not found", { status: 404 });

    return new Response(JSON.stringify({ url }), {
      status: 200,
      headers: { "content-type": "application/json", "cache-control": "public, max-age=600" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "internal_error" }), { status: 500 });
  }
}
