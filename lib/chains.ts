/**
 * Public EVM RPC defaults so address lookups & reads work without paid nodes.
 * You can later override with envs or swap URLs for your preferred providers.
 */
export const EVM_CHAINS = [
  // ---- L1s ----
  {
    id: 1,
    name: "Ethereum",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: ["https://ethereum.publicnode.com"] } },
  },
  {
    id: 56,
    name: "BNB Chain",
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    rpcUrls: { default: { http: ["https://bsc-dataseed.binance.org"] } },
  },
  {
    id: 137,
    name: "Polygon",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: { default: { http: ["https://polygon-rpc.com"] } },
  },
  {
    id: 43114,
    name: "Avalanche C-Chain",
    nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
    rpcUrls: { default: { http: ["https://api.avax.network/ext/bc/C/rpc"] } },
  },
  {
    id: 250,
    name: "Fantom",
    nativeCurrency: { name: "FTM", symbol: "FTM", decimals: 18 },
    rpcUrls: { default: { http: [process.env.RPC_FANTOM || "https://rpc.ankr.com/fantom"] } as any },
  },
  {
    id: 100,
    name: "Gnosis",
    nativeCurrency: { name: "xDAI", symbol: "xDAI", decimals: 18 },
    rpcUrls: { default: { http: ["https://rpc.gnosischain.com"] } },
  },
  {
    id: 42220,
    name: "Celo",
    nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
    rpcUrls: { default: { http: ["https://forno.celo.org"] } },
  },
  {
    id: 1313161554,
    name: "Aurora",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: ["https://mainnet.aurora.dev"] } },
  },
  // ---- L2s ----
  {
    id: 42161,
    name: "Arbitrum One",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: ["https://arb1.arbitrum.io/rpc"] } },
  },
  {
    id: 42170,
    name: "Arbitrum Nova",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: ["https://nova.arbitrum.io/rpc"] } },
  },
  {
    id: 10,
    name: "Optimism",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: ["https://mainnet.optimism.io"] } },
  },
  {
    id: 8453,
    name: "Base",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: ["https://mainnet.base.org"] } },
  },
  {
    id: 324,
    name: "zkSync Era",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: ["https://mainnet.era.zksync.io"] } },
  },
  {
    id: 59144,
    name: "Linea",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: ["https://rpc.linea.build"] } },
  },
  {
    id: 534352,
    name: "Scroll",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: ["https://rpc.scroll.io"] } },
  },
  {
    id: 1101,
    name: "Polygon zkEVM",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: ["https://zkevm-rpc.com"] } },
  },
  // ---- Alt L1s / newer ----
  {
    id: 5000,
    name: "Mantle",
    nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
    rpcUrls: { default: { http: ["https://rpc.mantle.xyz"] } },
  },
  {
    id: 81457,
    name: "Blast",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: ["https://rpc.blast.io"] } },
  },
  {
    id: 7777777,
    name: "Zora",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: ["https://rpc.zora.energy"] } },
  },
  {
    id: 2222,
    name: "Kava EVM",
    nativeCurrency: { name: "KAVA", symbol: "KAVA", decimals: 18 },
    rpcUrls: { default: { http: ["https://evm.kava.io"] } },
  },
  {
    id: 1284,
    name: "Moonbeam",
    nativeCurrency: { name: "GLMR", symbol: "GLMR", decimals: 18 },
    rpcUrls: { default: { http: ["https://rpc.api.moonbeam.network"] } },
  },
];

export const CHAINS = EVM_CHAINS;
export default EVM_CHAINS;
