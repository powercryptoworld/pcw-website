import type { Address } from "viem";

/** Wrapped-native token per chain (for pricing only). */
const WRAPPED_BY_CHAIN: Record<number, Address> = {
  // Ethereum mainnet – WETH
  1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  // BNB Chain – WBNB
  56: "0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  // Polygon – WMATIC
  137: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  // Arbitrum – WETH
  42161: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  // Optimism – WETH (predeploy)
  10: "0x4200000000000000000000000000000000000006",
  // Base – WETH (predeploy)
  8453: "0x4200000000000000000000000000000000000006",
  // Avalanche C – WAVAX
  43114: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
  // Fantom – WFTM
  250: "0x21be370D5312f44cB42ce377BC9b8a0cef1A4C83",
  // Gnosis – WXDAI
  100: "0xE91D153E0b41518A2Ce8Dd3D7944Fa863463a97d",
  // Celo – WCELO
  42220: "0x471EcE3750Da237f93B8E339c536989b8978a438",
} as const;

export function wrappedAddressFor(chainId: number): Address | undefined {
  return WRAPPED_BY_CHAIN[chainId];
}
