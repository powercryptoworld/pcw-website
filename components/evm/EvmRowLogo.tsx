"use client";
import React, { useMemo, useState, useEffect } from "react";

/**
 * Stable inline token logo with prioritized sources:
 * 1) /token-logos/{chainId}/{address}.svg
 * 2) /token-logos/{chainId}/{address}.png
 * 3) /api/evm-logo?chainId=..&address=..
 */
export default function EvmRowLogo({
  chainId,
  address,
  logoURI,
  size = 18,
}: {
  chainId: number | string;
  address: string;
  logoURI?: string | null;
  size?: number;
}) {
  const c = String(chainId).trim();
  const a = String(address).trim().toLowerCase();

  const fallbacks = useMemo(() => {
    const first: string[] = [];
    if (logoURI && logoURI.trim()) first.push(logoURI.trim());
    return [
      ...first,
      `/token-logos/${c}/${a}.svg`,
      `/token-logos/${c}/${a}.png`,
      `/api/evm-logo?chainId=${encodeURIComponent(c)}&address=${encodeURIComponent(a)}`,
    ];
  }, [c, a, logoURI]);

  const [idx, setIdx] = useState(0);
  const [src, setSrc] = useState(fallbacks[0]);

  useEffect(() => {
    setIdx(0);
    setSrc(fallbacks[0]);
  }, [fallbacks]);

  const onError = () => {
    const next = idx + 1;
    if (next < fallbacks.length) {
      setIdx(next);
      setSrc(fallbacks[next]);
    }
  };

  return (
    <img
      src={src}
      alt="token logo"
      width={size}
      height={size}
      onError={onError}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        marginRight: 8,
        borderRadius: 4,
        boxShadow: "0 0 0 1px rgba(255,255,255,0.15) inset",
      }}
    />
  );
}
