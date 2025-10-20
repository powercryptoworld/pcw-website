"use client";
import React, { useState } from "react";
import { ChainSelect } from "@/components/ChainSelect";
import { EVM_CHAINS } from "@/lib/chains";
import EvmAddrResultRow from "@/components/evm/EvmAddrResultRow";

export default function Page() {
  const [family, setFamily] = useState<"evm" | "sol">("evm");
  const [chainId, setChainId] = useState<number>(56);
  const [query, setQuery] = useState("");
  const [resultAddr, setResultAddr] = useState<string | null>(null);

  const activeChain = EVM_CHAINS.find(c => c.id === chainId);

  const onSearch = () => {
    const v = query.trim();
    // Always force a refresh even if the same value as before
    setResultAddr(null);
    setTimeout(() => {
      setResultAddr(v ? v : null);
    }, 0);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearch();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl mb-4">Token Search (EVM + Solana)</h1>

      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => setFamily("evm")} className="px-2 py-1 rounded bg-white/10">EVM</button>
        <button onClick={() => setFamily("sol")} className="px-2 py-1 rounded bg-white/10">Solana</button>

        <div className="flex items-center gap-2">
          <label>Chain</label>
          <ChainSelect value={chainId} onChange={setChainId} />
        </div>
      </div>

      <div className="text-sm opacity-80 mb-2">
        {family === "evm" ? (
          <>Active EVM chain: <span className="opacity-100">{activeChain?.name}</span> (ID {chainId}) • Results: {resultAddr ? 1 : 0}</>
        ) : (
          <>Source: <span className="opacity-100">Solana token registry</span> • Results: 0</>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <input
          className="px-2 py-1 rounded text-black w-[360px]"
          placeholder="name / symbol / 0xaddress"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          onClick={onSearch}
          className="px-3 py-1 rounded bg-white/10"
        >
          Search
        </button>
      </div>

      {resultAddr && (
        <EvmAddrResultRow
          chainId={chainId}
          address={resultAddr}
          symbol={"XPIN"}
          name={"XPIN Token"}
        />
      )}
    </div>
  );
}
