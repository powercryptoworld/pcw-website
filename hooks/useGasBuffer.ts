import { parseUnits } from "viem";

/**
 * Default native-gas buffer per chain in *native units*.
 * Keep these conservative so users can still submit a tx after MAX.
 */
const DEFAULTS: Record<number, string> = {
  1:  "0.0003",   // Ethereum
  56: "0.0002",   // BNB Chain
  137:"0.5",      // Polygon (MATIC is cheap, but set a visible buffer)
  42161:"0.0002", // Arbitrum
  10:"0.0002",    // Optimism
  8453:"0.0002",  // Base
  43114:"0.005",  // Avalanche (AVAX)
  250:"0.2",      // Fantom
  100:"0.02",     // Gnosis
  42220:"0.02",   // Celo
};

export function getNativeGasBuffer(chainId: number): string {
  return DEFAULTS[chainId] ?? "0.0003";
}

/** Convert the buffer string to wei-like bigint using the token's native decimals. */
export function toBufferWei(chainId: number, decimals: number): bigint {
  const s = getNativeGasBuffer(chainId);
  try { return parseUnits(s as `${number}`, decimals); } catch { return 0n; }
}
