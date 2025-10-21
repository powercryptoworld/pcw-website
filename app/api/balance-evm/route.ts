import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, formatUnits, parseAbi } from "viem";

type ChainCfg = {
  id: number;
  rpcUrls?: { default?: { http?: string[] } } & { http?: string[] };
};

let CHAINS: ChainCfg[] = [];
try {
  // try to use your existing chains list
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require("@/lib/chains");
  CHAINS = (mod?.EVM_CHAINS || mod?.CHAINS || mod?.default || []) as ChainCfg[];
} catch {}

function pickRpcUrl(chainId: number): string | null {
  const found = CHAINS.find((c) => Number(c.id) === Number(chainId));
  const fromList =
    found?.rpcUrls?.default?.http?.[0] ||
    found?.rpcUrls?.http?.[0] ||
    null;
  if (fromList) return fromList;

  // fallbacks (add more as you like)
  if (Number(chainId) === 1 && process.env.QUICKNODE_HTTP) return process.env.QUICKNODE_HTTP;
  return null;
}

const ERC20_ABI = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
]);

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const chainId = Number(searchParams.get("chainId") || "");
    const owner = String(searchParams.get("owner") || "").trim();
    const token = String(searchParams.get("token") || "").trim(); // optional — native if empty

    if (!chainId || !owner) {
      return NextResponse.json({ ok: false, error: "missing chainId or owner" }, { status: 400 });
    }

    const rpcUrl = pickRpcUrl(chainId);
    if (!rpcUrl) {
      return NextResponse.json({ ok: false, error: `no RPC for chainId ${chainId}` }, { status: 400 });
    }

    const client = createPublicClient({ transport: http(rpcUrl) });

    if (!token) {
      // native
      const wei = await client.getBalance({ address: owner as `0x${string}` });
      const decimals = 18;
      return NextResponse.json({
        ok: true,
        source: "native",
        chainId,
        owner,
        token: null,
        balance: wei.toString(),
        decimals,
        formatted: formatUnits(wei, decimals),
      }, { status: 200 });
    }

    // erc20
    const [bal, dec] = await Promise.all([
      client.readContract({
        address: token as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [owner as `0x${string}`],
      }) as Promise<bigint>,
      client.readContract({
        address: token as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "decimals",
        args: [],
      }) as Promise<number>,
    ]);

    return NextResponse.json({
      ok: true,
      source: "erc20",
      chainId,
      owner,
      token,
      balance: bal.toString(),
      decimals: dec,
      formatted: formatUnits(bal, dec),
    }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "failed" }, { status: 200 });
  }
}
