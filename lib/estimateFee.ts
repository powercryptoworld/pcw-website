import type { WalletClient } from "wagmi";
import type { PublicClient } from "viem";
import { formatEther, hexToBigInt } from "viem";

/**
 * Robust gas/fee estimator for a 1inch-built tx.
 * Strategy:
 *  1) estimateGas with account (best)
 *  2) estimateGas without account (some nodes are picky)
 *  3) fallback to a conservative gas guess if both revert (shows a usable fee)
 */
export async function estimateFeeFromBuiltTx(
  publicClient: PublicClient,
  walletClient: WalletClient | null | undefined,
  builtTx: {
    to?: `0x${string}`;
    data?: `0x${string}`;
    value?: `0x${string}` | string | number | bigint;
    gas?: `0x${string}` | string | number | bigint;
    gasPrice?: `0x${string}` | string | number | bigint;
    from?: `0x${string}`;
  }
) {
  if (!publicClient) throw new Error("No public client");
  if (!walletClient) throw new Error("Connect wallet first");
  if (!walletClient.account) throw new Error("No wallet account");
  if (!builtTx?.to || !builtTx?.data) throw new Error("Build swap first");

  // Normalize value to bigint (optional)
  let valueWei: bigint | undefined;
  if (builtTx.value !== undefined && builtTx.value !== null) {
    const v = builtTx.value as any;
    if (typeof v === "string" && v.startsWith("0x")) valueWei = hexToBigInt(v);
    else valueWei = BigInt(v);
  }

  // Current gas price (legacy on BSC)
  const gasPrice = await publicClient.getGasPrice();

  // 1) Try estimating with account context
  let gas: bigint | null = null;
  try {
    gas = await publicClient.estimateGas({
      account: walletClient.account,
      to: builtTx.to,
      data: builtTx.data,
      value: valueWei,
    });
  } catch {
    // 2) Try again without explicit account (some RPCs behave differently)
    try {
      gas = await publicClient.estimateGas({
        to: builtTx.to,
        data: builtTx.data,
        value: valueWei,
      });
    } catch {
      gas = null;
    }
  }

  // 3) Final fallback if node keeps reverting: conservative fixed guess
  //    220,000 is usually safe for simple router swaps on BSC.
  if (gas === null) {
    gas = 220_000n;
  }

  const feeWei = gas * gasPrice;
  const feeEth = formatEther(feeWei);

  return {
    gas,
    gasPrice,
    feeWei,
    feeEth,
    usedFallback: gas === 220_000n,
  };
}
