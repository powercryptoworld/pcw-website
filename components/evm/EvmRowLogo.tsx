"use client";
import React, { useMemo, useState, useEffect } from "react";

/**
 * Priority order (to mimic Pancake/1inch behavior):
 * 0) Provided logoURI (if present)
 * 1) 1inch CDN:     https://tokens.1inch.io/{address}.png
 * 2) TrustWallet:   blockchains/{folder}/assets/{address}/logo.png
 * 3) Local SVG:     /token-logos/{chainId}/{address}.svg
 * 4) Local PNG:     /token-logos/{chainId}/{address}.png
 * 5) Fallback API:  /api/evm-logo?chainId=..&address=..
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

  const trustFolder =
    c === "56" || c === "0x38" ? "smartchain" :
    c === "1"  || c === "0x1"  ? "ethereum"  :
    c === "137"|| c === "0x89" ? "polygon"   :
    c === "10" || c === "0xa"  ? "optimism"  :
    c === "42161"|| c === "0xa4b1" ? "arbitrum" : null;

  const fallbacks = useMemo(() => {
    const list: Array<{src:string}> = [];
    if (logoURI && logoURI.trim()) list.push({ src: logoURI.trim() });
    list.push({ src: `https://tokens.1inch.io/${addr}.png` });
    if (trustFolder) {
      list.push({
        src: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${trustFolder}/assets/${addr}/logo.png`,
      });
    }
    list.push({ src: `/token-logos/${c}/${addr}.svg` });
    list.push({ src: `/token-logos/${c}/${addr}.png` });
    list.push({
      src: `/api/evm-logo?chainId=${encodeURIComponent(c)}&address=${encodeURIComponent(addr)}`,
    });
    return list;
  }, [c, addr, logoURI, trustFolder]);

  const [idx, setIdx] = useState(0);
  const [src, setSrc] = useState(fallbacks[0]?.src ?? "");

  useEffect(() => {
    setIdx(0);
    setSrc(fallbacks[0]?.src ?? "");
  }, [fallbacks]);

  const onError = () => {
    const next = idx + 1;
    if (next < fallbacks.length) {
      setIdx(next);
      setSrc(fallbacks[next].src);
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
