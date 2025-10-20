"use client";
import React from "react";
import InlineRowLogoInjector from "@/components/evm/InlineRowLogoInjector";

type Props = {
  chainId: number | string;
  address: string;
  symbol?: string | null;
  name?: string | null;
};

export default function EvmAddrResultRow({ chainId, address, symbol, name }: Props) {
  const c = String(chainId).trim();
  const cid = Number(c) || 0;
  const a = String(address).trim();
  const aLower = a.toLowerCase();

  return (
    <div className="mb-4">
      {/* Mount injector with the exact chain/address for immediate + observed swaps */}
      <InlineRowLogoInjector chainId={cid} address={aLower} />

      <div
        className="text-lg truncate flex items-center gap-2"
        data-chain-id={c}
        data-address={aLower}
      >
        {/* Logo element (the injector will upgrade this src in-place) */}
        <img
          data-evm-row-logo
          alt={`${symbol ?? "Token"} logo`}
          className="w-6 h-6 rounded-full object-cover"
          width={24}
          height={24}
          // Direct API fallback so it works even if injector is delayed
          src={`/api/evm-logo?chainId=${cid}&address=${aLower}`}
        />
        <span className="font-semibold">{symbol ?? "UNKNOWN"}</span>
        <span className="opacity-70"> — {name ?? "Token"}</span>
      </div>

      <div className="text-sm opacity-80">ChainId: {c}</div>
      <div className="text-xs opacity-80">{a}</div>
    </div>
  );
}
