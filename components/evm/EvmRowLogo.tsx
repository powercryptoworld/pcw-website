"use client";
import React, { useMemo, useState, useEffect } from "react";

/**
 * Inline EVM token logo with prioritized sources:
 * 1) Local: /token-logos/{chainId}/{address}.svg
 * 2) Local: /token-logos/{chainId}/{address}.png
 * 3) CDN:   https://tokens.1inch.io/{address}.png
 * 4) CDN:   TrustWallet assets (e.g., smartchain for BSC)
 * 5) API:   /api/evm-logo?chainId=..&address=..
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
  const addr = String(address).trim().toLowerCase();

  // Map chainId -> TrustWallet chain folder
  const trustFolder =
    c === "56" || c === "0x38" ? "smartchain" :
    c === "1"  || c === "0x1"  ? "ethereum"  :
    c === "137"|| c === "0x89" ? "polygon"   :
    c === "10" || c === "0xa"  ? "optimism"  :
    c === "42161"|| c === "0xa4b1" ? "arbitrum" : null;

  const fallbacks = useMemo(() => {
    const first: string[] = [];
    if (logoURI && logoURI.trim()) first.push(logoURI.trim());
    const arr = [
      ...first,
      `/token-logos/${c}/${addr}.svg`,
      `/token-logos/${c}/${addr}.png`,
      `https://tokens.1inch.io/${addr}.png`,
    ];
    if (trustFolder) {
      arr.push(
        `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${trustFolder}/assets/${addr}/logo.png`
      );
    }
    arr.push(`/api/evm-logo?chainId=${encodeURIComponent(c)}&address=${encodeURIComponent(addr)}`);
    return arr;
  }, [c, addr, logoURI, trustFolder]);

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
