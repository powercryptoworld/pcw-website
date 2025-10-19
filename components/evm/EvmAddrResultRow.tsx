"use client";
import React from "react";
import EvmRowLogo from "@/components/evm/EvmRowLogo";

export default function EvmAddrResultRow({
  chainId,
  address,
  symbol,
  name,
}: {
  chainId: number | string;
  address: string;
  symbol: string;
  name: string;
}) {
  const addr = String(address).trim();
  return (
    <div className="mt-2">
      <div className="text-lg truncate" data-chain-id={chainId} data-address={addr}>
        <EvmRowLogo chainId={chainId} address={addr} logoURI={null} />
        {symbol || "UNK"} — {name || "Token"}
      </div>
      <div className="text-sm opacity-80">ChainId: {chainId}</div>
      <div className="text-sm opacity-80">{addr}</div>
      <div className="text-sm opacity-80">decimals: 18</div>
    </div>
  );
}
