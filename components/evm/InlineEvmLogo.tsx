"use client";

import React, { useMemo, useState } from "react";

/**
 * InlineEvmLogo
 * Renders a 18x18 logo inline with the row (no DOM hacks).
 * Priority:
 *   1) /token-logos/<chainId>/<address-lc>.svg
 *   2) /token-logos/<chainId>/<address-lc>.png
 *   3) /api/evm-logo?chainId=<id>&address=<addr>
 */
export default function InlineEvmLogo({
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
  const addrLc = (address || "").toLowerCase();
  const [i, setI] = useState(0);

  const srcs = useMemo(() => {
    if (!chainId || !addrLc) return [];
    return [
      `/token-logos/${chainId}/${addrLc}.svg`,
      `/token-logos/${chainId}/${addrLc}.png`,
      `/api/evm-logo?chainId=${chainId}&address=${address}`,
    ];
  }, [chainId, addrLc, address]);

  if (!chainId || !addrLc || srcs.length === 0) return null;

  return (
    <img
      src={srcs[i]}
      width={size}
      height={size}
      alt="token logo"
      className={className}
      draggable={false}
      onError={() => setI((prev) => (prev + 1 < srcs.length ? prev + 1 : prev))}
    />
  );
}
