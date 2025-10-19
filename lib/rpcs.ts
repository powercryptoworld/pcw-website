export function getRpcCandidates(chainId: number): string[] {
  const ETH_RPC = process.env.QUICKNODE_HTTP || "https://cloudflare-eth.com";

  const map: Record<number, string[]> = {
    1:   [ETH_RPC, "https://rpc.ankr.com/eth"],
    56:  ["https://bsc-dataseed.binance.org", "https://bsc-dataseed1.defibit.io", "https://rpc.ankr.com/bsc"],
    137: ["https://polygon-rpc.com", "https://rpc.ankr.com/polygon"],
    10:  ["https://mainnet.optimism.io", "https://rpc.ankr.com/optimism"],
    42161:["https://arb1.arbitrum.io/rpc", "https://rpc.ankr.com/arbitrum"],
    8453:["https://mainnet.base.org"],
    43114:["https://api.avax.network/ext/bc/C/rpc", "https://rpc.ankr.com/avalanche"],
    250: ["https://fantom.publicnode.com", "https://rpcapi.fantom.network", "https://rpc.ftm.tools", "https://rpc.ankr.com/fantom"],
  };
  return map[chainId] || [ETH_RPC];
}

export function getRpcForChain(chainId: number): string {
  return getRpcCandidates(chainId)[0];
}
