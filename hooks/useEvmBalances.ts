import { useAccount, useBalance, useConfig, useConnectorClient } from "wagmi";
import { readContracts } from "@wagmi/core";
import type { Address } from "viem";

export type EvmToken = {
  chainId: number;
  address?: Address;     // undefined => native (ETH/BNB/etc)
  symbol?: string;
  decimals?: number;
  name?: string;
  isNative?: boolean;    // hint
};

const ERC20_ABI = [
  { type:"function", name:"decimals", stateMutability:"view", inputs:[], outputs:[{type:"uint8"}] },
  { type:"function", name:"balanceOf", stateMutability:"view", inputs:[{name:"owner",type:"address"}], outputs:[{type:"uint256"}] }
] as const;

export function useEvmBalances(token: EvmToken | null) {
  const { address } = useAccount();
  const cfg = useConfig();
  const { data: client } = useConnectorClient({ chainId: token?.chainId });

  // Native balance via wagmi
  const native = useBalance({
    address,
    chainId: token?.chainId,
    query: { enabled: !!address && !!token && (!token.address || token.isNative) },
  });

  async function erc20Balance(): Promise<{ balance?: bigint; decimals?: number } | null> {
    if (!address || !token?.address || !token.chainId) return null;
    const calls = [
      { address: token.address, abi: ERC20_ABI, functionName: "decimals" as const, chainId: token.chainId },
      { address: token.address, abi: ERC20_ABI, functionName: "balanceOf" as const, args: [address], chainId: token.chainId },
    ];
    const res = await readContracts(cfg, { contracts: calls });
    const dec = Number(res[0].status === "success" ? (res[0].result as any) : token.decimals ?? 18);
    const bal = res[1].status === "success" ? (res[1].result as bigint) : undefined;
    return { balance: bal, decimals: dec };
  }

  return {
    address,
    client,
    native,          // wagmi result for native
    erc20Balance,    // async helper for ERC-20
  };
}
