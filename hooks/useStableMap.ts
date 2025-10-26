import type { Address } from "viem";

/** Minimal stablecoin map per EVM chain (add more as needed). */
export const STABLES_BY_CHAIN: Record<number, Record<string, { symbol: string }>> = {
  1: { // Ethereum
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": { symbol: "USDC" },
    "0xdac17f958d2ee523a2206206994597c13d831ec7": { symbol: "USDT" },
    "0x6b175474e89094c44da98b954eedeac495271d0f": { symbol: "DAI" },
  },
  56: { // BNB Chain
    "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d": { symbol: "USDC" },
    "0x55d398326f99059ff775485246999027b3197955": { symbol: "USDT" },
    "0x1af3f329e8bedcddf7e3c08f3c62177cdcaaefbf": { symbol: "DAI" },
  },
  137: { // Polygon
    "0x2791bca1f2de4661ed88a30c99a7a9449aa84174": { symbol: "USDC" },
    "0xc2132d05d31c914a87c6611c10748aeb04b58e8f": { symbol: "USDT" },
    "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063": { symbol: "DAI" },
  },
};

export function isKnownStable(chainId: number, addr?: Address) {
  if (!addr) return false;
  const m = STABLES_BY_CHAIN[chainId];
  if (!m) return false;
  return !!m[addr.toLowerCase()];
}
