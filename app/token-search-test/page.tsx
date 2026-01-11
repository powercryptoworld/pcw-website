"use client";
import React, { useCallback, useMemo, useState } from "react";
import { ChainSelect } from "@/components/ChainSelect";
import { EVM_CHAINS } from "@/lib/chains";
import { normalizeList } from "@/lib/normalizeList";
import InlineRowLogoInjector from "@/components/evm/InlineRowLogoInjector";
import { SolRowLogo } from "@/components/sol/SolRowLogo";

type EvmItem = { chainId: number; address: string; symbol: string; name: string; decimals: number | null; logoURI?: string | null };
type SolItem = { mint: string; symbol: string; name: string; decimals: number | null; logoURI?: string | null; source?: string };

function isEvmAddr(s: string) { return /^0x[a-fA-F0-9]{40}$/.test((s||"").trim()); }

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => { try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(()=>setCopied(false),1200);} catch{} };
  return (
    <button className="px-2 py-1 text-xs border rounded" onClick={onCopy}>{copied?"Copied":"Copy"}</button>
  );
}

export default function TokenSearchTest() {
  const [family, setFamily] = useState<"evm"|"solana">("evm");
  const [selectedChainId, setSelectedChainId] = useState<number>(56);
  const [text, setText] = useState("");
  const [list, setList] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const chain = useMemo(()=>EVM_CHAINS.find(c=>c.id===selectedChainId) || EVM_CHAINS[0], [selectedChainId]);

  const doSearch = useCallback(async ()=>{
    const q = (text||"").trim();
    if (!q) { setList([]); return; }
    setLoading(true);

    try {
      if (family==="solana") {
        const r = await fetch(`/api/sol-search?q=${encodeURIComponent(q)}`, { cache: "no-store" });
        const j = await r.json();
        setList(normalizeList(j)); // {items:[]}
      } else {
        // EVM family
        if (isEvmAddr(q)) {
          // NEW: address path -> use our EVM search API so addresses work
          const r = await fetch(`/api/evm-search?q=${encodeURIComponent(q)}&chainId=${selectedChainId}`, { cache: "no-store" });
          const j = await r.json().catch(()=>null);
          setList(normalizeList(j));
        } else {
          // 1) try chain-scoped search first
          const r1 = await fetch(`/api/evm-search?q=${encodeURIComponent(q)}&chainId=${selectedChainId}`, { cache: "no-store" });
          const j1 = await r1.json().catch(()=>null);
          let items = normalizeList(j1);

          // 2) if nothing, try without chainId (some routes aggregate across chains or expect no chain param)
          if (!items.length) {
            const r2 = await fetch(`/api/evm-search?q=${encodeURIComponent(q)}`, { cache: "no-store" }).catch(()=>null);
            const j2 = r2 ? await r2.json().catch(()=>null) : null;
            const items2 = normalizeList(j2);
            if (items2.length) items = items2.filter(Boolean);
          }

          setList(items);
        }
      }
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [text, family, selectedChainId]);

  const rows = normalizeList(list);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Token Search (EVM + Solana)</h1>

      <div className="flex gap-2">
        <button onClick={()=>setFamily("evm")} className={`px-3 py-1 border rounded ${family==="evm"?"bg-white/10":""}`}>EVM</button>
        <button onClick={()=>setFamily("solana")} className={`px-3 py-1 border rounded ${family==="solana"?"bg-white/10":""}`}>Solana</button>
        {family==="evm" && (
          <div className="flex items-center gap-2">
            <span className="text-sm">Chain</span>
            <ChainSelect value={selectedChainId} onChange={setSelectedChainId} />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input className="flex-1 border rounded px-3 py-2" placeholder={family==="evm"?"0x… or symbol/name":"mint or symbol/name"}
          value={text} onChange={(e)=>setText(e.target.value)} />
        <button className="search-pill" onClick={doSearch} disabled={loading}>{loading?"Searching…":"Search"}</button>
      </div>

      <div className="space-y-2">
        {/* EVM results */}
        {family==="evm" && rows.map((t: any, i: number)=>(
          <div key={`${t.address||i}-${t.chainId??selectedChainId}`} className="p-3 search-result-pill">
            <div className="flex items-center gap-3">
              <InlineRowLogoInjector
                address={t.address}
                chainId={t.chainId ?? selectedChainId}
                symbol={t.symbol}
                name={t.name}
                logoURI={t.logoURI}
                size={32}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {t.symbol || "UNKNOWN"} <span className="text-xs text-white/60">— {t.name || "Token"}</span>
                </div>
                <div className="text-xs text-white/60">
                  ChainId: {t.chainId ?? selectedChainId} &nbsp;•&nbsp; Network: {(EVM_CHAINS.find(c=>c.id===(t.chainId ?? selectedChainId))?.name) || "EVM"}
                </div>
              </div>
              <code className="text-xs truncate max-w-[38ch]">{t.address}</code>
              <CopyBtn value={t.address || ""}/>
            </div>
          </div>
        ))}

        {/* Solana results */}
        {family==="solana" && rows.map((t: any, i: number)=>(
          <div key={`${t.mint||i}`} className="p-3 search-result-pill">
            <div className="flex items-center gap-3">
              <SolRowLogo uri={t.logoURI} alt={t.symbol || t.name || "token"} mint={t.mint} symbol={t.symbol} name={t.name}
                logoURI={t.logoURI} />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {t.symbol || "UNKNOWN"} <span className="text-xs text-white/60">— {t.name || "Token"}</span>
                </div>
                <div className="text-xs text-white/60">Network: Solana{t.source ? ` • Source: ${t.source}` : ""}</div>
              </div>
              <code className="text-xs truncate max-w-[38ch]">{t.mint}</code>
              <CopyBtn value={t.mint || ""}/>
            </div>
          </div>
        ))}

        {rows.length===0 && !loading && family==="evm" && (
          <div className="text-sm text-white/70">
            No matches by name/symbol on <span className="underline">{EVM_CHAINS.find(c=>c.id===selectedChainId)?.name || `chainId ${selectedChainId}`}</span>.
            Try another chain or search by address.
          </div>
        )}
        {rows.length===0 && !loading && family==="solana" && (
          <div className="text-sm text-white/70">No results</div>
        )}
      </div>
    </div>
  );
}
