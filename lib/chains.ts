export type EvmChain = { id: number; name: string; short: string; logo?: string | null; };

export const EVM_CHAINS: EvmChain[] = [
  { id: 1, name: "Ethereum", short: "ETH", logo: null },
  { id: 56, name: "BNB Chain", short: "BNB", logo: null },
  { id: 42161, name: "Arbitrum", short: "ARB", logo: null },
  { id: 10, name: "Optimism", short: "OP", logo: null },
  { id: 8453, name: "Base", short: "BASE", logo: null },
  { id: 137, name: "Polygon", short: "POLY", logo: null },
  { id: 43114, name: "Avalanche", short: "AVAX", logo: null },
  { id: 250, name: "Fantom", short: "FTM", logo: null },
  { id: 100, name: "Gnosis", short: "GNO", logo: null },
  { id: 324, name: "zkSync Era", short: "ZKS", logo: null },
  { id: 59144, name: "Linea", short: "LINE", logo: null },
  { id: 534352, name: "Scroll", short: "SCRL", logo: null },
  { id: 81457, name: "Blast", short: "BLST", logo: null },
  { id: 42220, name: "Celo", short: "CELO", logo: null },
  { id: 1284, name: "Moonbeam", short: "GLMR", logo: null },

  // NEW
  { id: 5000, name: "Mantle", short: "MNTL", logo: null },
  { id: 7777777, name: "Zora", short: "ZORA", logo: null },
  { id: 480, name: "World Chain", short: "WORLD", logo: null },
];
