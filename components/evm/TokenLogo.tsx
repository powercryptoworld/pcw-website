"use client";

import React, { useMemo, useState } from "react";

/**
 * TokenLogo
 * Renders a 18x18 logo for an EVM token with this priority:
 *   1) /public override: /token-logos/<chainId>/<address-lc>.svg|png
 *   2) /api/evm-logo?chainId=<id>&address=<addr> (TrustWallet → Pancake → 1inch)
 * If all fail, it renders nothing (your identicon/badge can still show elsewhere).
 */
export default function TokenLogo({
  chainId,
  address,
  size = 18,
  className = "inline-block align-middle rounded-sm mr-2",
}: {
  chainId: number;
  address: string;
  size?: number;
  className?: string;
}) {
  const addr = (address || "").toLowerCase();
  const tries = useMemo(
    () => [
      `/token-logos/${chainId}/${addr}.svg`,
      `/token-logos/${chainId}/${addr}.png`,
      `/api/evm-logo?chainId=${chainId}&address=${address}`,
    ],
    [chainId, addr, address]
  );

  const [idx, setIdx] = useState(0);
  if (!address || !chainId) return null;

  return (
    <img
      src={tries[idx]}
      width={size}
      height={size}
      alt="token logo"
      className={className}
      onError={() => setIdx((i) => (i + 1 < tries.length ? i + 1 : i))}
      draggable={false}
    />
  );
}
