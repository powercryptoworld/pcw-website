"use client";
import { useEffect, useState } from "react";
import type { Address } from "viem";
import { usePublicClient } from "wagmi";

const ERC20_ALLOWANCE_ABI = [
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "amount", type: "uint256" }],
  },
] as const;

export function useAllowance(args: {
  chainId: number | undefined;
  token?: Address;        // ERC20 address; omit/undefined for native
  owner?: Address;        // wallet
  spender?: Address;      // router/spender
  decimals?: number;      // for human formatting
}) {
  const { chainId, token, owner, spender, decimals = 18 } = args;
  const client = usePublicClient({ chainId });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [wei, setWei] = useState<bigint | null>(null);

  useEffect(() => {
    let alive = true;
    async function go() {
      setError(undefined);
      setWei(null);
      if (!client || !chainId || !token || !owner || !spender) return;
      setLoading(true);
      try {
        const out = await client.readContract({
          address: token,
          abi: ERC20_ALLOWANCE_ABI,
          functionName: "allowance",
          args: [owner, spender],
        });
        if (!alive) return;
        setWei(out as bigint);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "allowance failed");
      } finally {
        if (alive) setLoading(false);
      }
    }
    go();
    return () => { alive = false; };
  }, [client, chainId, token, owner, spender]);

  let human: string | undefined;
  try {
    if (wei != null) {
      const n = Number(wei) / 10 ** decimals;
      human = Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 6 }) : undefined;
    }
  } catch {}
  return { loading, error, allowanceWei: wei, allowanceHuman: human };
}
