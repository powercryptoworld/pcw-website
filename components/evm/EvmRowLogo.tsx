"use client";
import React from "react";

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
  const fallback = `/api/evm-logo?chainId=${chainId}&address=${String(address).toLowerCase()}`;
  const src = (logoURI && logoURI.trim()) || fallback;
  return (
    <img
      src={src}
      alt="token logo"
      width={size}
      height={size}
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
