"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import TokenRow from "@/components/swap/TokenRow";
import QuotePanel from "@/components/swap/QuotePanel";
import { ChainSelect } from "@/components/ChainSelect";
import InlineRowLogoInjector from "@/components/evm/InlineRowLogoInjector";
import { SolRowLogo } from "@/components/sol/SolRowLogo";
import { EVM_CHAINS } from "@/lib/chains";
import { normalizeList } from "@/lib/normalizeList";

type Addr = `0x${string}`;
type TokenRef = { chainId: number; address: Addr; decimals: number; symbol?: string; name?: string; logoURI?: string };

const USDC_BY_CHAIN: Record<number, TokenRef> = {
  1:   { chainId: 1, address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6,  symbol: "USDC", name: "USD Coin" },
  56:  { chainId: 56, address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18, symbol: "USDC", name: "USD Coin" },
  137: { chainId: 137, address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", decimals: 6,  symbol: "USDC", name: "USD Coin" },
  8453:{ chainId: 8453,address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6,  symbol: "USDC", name: "USD Coin" },
  42161:{ chainId: 42161,address: "0xaf88d065e77c8C2239327C5EDb3A432268e5831", decimals: 6, symbol: "USDC", name: "USD Coin" },
  10:  { chainId: 10, address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", decimals: 6,  symbol: "USDC", name: "USD Coin" },
};

const WETH_MAINNET: TokenRef = {
  chainId: 1,
  address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  decimals: 18,
  symbol: "WETH",
  name: "Wrapped Ether",
};

function useDebounced<T>(value: T, ms = 180) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function isEvmAddr(s: string) { return /^0x[a-fA-F0-9]{40}$/.test((s||"").trim()); }

export default function Page() {
  // Background + neon overlay (unchanged)
  const HeroBg = (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -6,
        backgroundImage: "url(/swap-hero.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center 55%",
        backgroundRepeat: "no-repeat",
        filter: "saturate(115%) brightness(0.95)",
        pointerEvents: "none",
      }}
    />
  );
  const NeonOverlay = <div className="swap-vfx" aria-hidden />;

  // === Swap state (EVM for STEP 3A/3B) ===
  const [chainId, setChainId] = useState<number>(1);
  const [payToken, setPayToken] = useState<TokenRef>(WETH_MAINNET);
  const [receiveToken, setReceiveToken] = useState<TokenRef>(USDC_BY_CHAIN[1]);

  const [payAmount, setPayAmount] = useState<string>("0.00");
  const [receiveAmount, setReceiveAmount] = useState<string>("");

  const [mode, setMode] = useState<"pay" | "receive">("pay");

  const debouncedPay = useDebounced(payAmount);
  const debouncedReceive = useDebounced(receiveAmount);

  const src = mode === "pay" ? payToken : receiveToken;
  const dst = mode === "pay" ? receiveToken : payToken;
  const humanAmount = mode === "pay" ? debouncedPay : debouncedReceive;

  // === Token Search (lifted from Token Search Test) ===
  const [family, setFamily] = useState<"evm" | "solana">("evm");
  const [selectedChainId, setSelectedChainId] = useState<number>(56); // default BNB like test page
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [picker, setPicker] = useState<"pay" | "receive">("pay"); // which row to apply to
  const [showSearch, setShowSearch] = useState<boolean>(false);

  const doSearch = useCallback(async () => {
    const q = (searchText || "").trim();
    if (!q) { setResults([]); return; }
    setLoading(true);
    try {
      if (family === "solana") {
        const r = await fetch(`/api/sol-search?q=${encodeURIComponent(q)}`, { cache: "no-store" });
        const j = await r.json();
        setResults(normalizeList(j));
      } else {
        if (isEvmAddr(q)) {
          const r = await fetch(`/api/evm-search?q=${encodeURIComponent(q)}&chainId=${selectedChainId}`, { cache: "no-store" });
          const j = await r.json().catch(()=>null);
          setResults(normalizeList(j));
        } else {
          const r1 = await fetch(`/api/evm-search?q=${encodeURIComponent(q)}&chainId=${selectedChainId}`, { cache: "no-store" });
          const j1 = await r1.json().catch(()=>null);
          let items = normalizeList(j1);
          if (!items.length) {
            const r2 = await fetch(`/api/evm-search?q=${encodeURIComponent(q)}`, { cache: "no-store" }).catch(()=>null);
            const j2 = r2 ? await r2.json().catch(()=>null) : null;
            const items2 = normalizeList(j2);
            if (items2.length) items = items2.filter(Boolean);
          }
          setResults(items);
        }
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchText, family, selectedChainId]);

  useEffect(() => { if (showSearch) setResults([]); }, [showSearch, family, selectedChainId]);

  // Apply selection to the chosen row (EVM only for now)
  const applyEvmSelection = (t: any) => {
    const picked: TokenRef = {
      chainId: (t.chainId ?? selectedChainId) as number,
      address: t.address as Addr,
      decimals: Number(t.decimals ?? 18),
      symbol: t.symbol || "TKN",
      name: t.name || "Token",
      logoURI: t.logoURI || null as any,
    };
    if (picker === "pay") {
      setPayToken(picked);
      if (picked.chainId !== chainId) setChainId(picked.chainId);
    } else {
      setReceiveToken(picked);
      if (picked.chainId !== chainId) setChainId(picked.chainId);
    }
    setShowSearch(false);
  };

  // Keep opposite field autofill parity with lab (bridge via event)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<any>).detail;
      if (!detail) return;
      const { dstAmount, dstDecimals } = detail as { dstAmount?: string; dstDecimals?: number };
      if (!dstAmount || !dstDecimals) return;
      const human = Number(dstAmount) / 10 ** (dstDecimals ?? 18);
      let out = human
        .toLocaleString(undefined, { maximumFractionDigits: Math.min(8, dstDecimals ?? 8) })
        .replace(/,/g, "");
      out = out.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "").replace(/\.$/, "");
      if (mode === "pay") {
        if (out !== receiveAmount) setReceiveAmount(out);
      } else {
        if (out !== payAmount) setPayAmount(out);
      }
    };
    window.addEventListener("pcw:quote:dst", handler as EventListener);
    return () => window.removeEventListener("pcw:quote:dst", handler as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, dst.decimals]);

  const flip = () => {
    setPayToken(receiveToken);
    setReceiveToken(payToken);
    setPayAmount(receiveAmount || "");
    setReceiveAmount(payAmount || "");
  };

  // UI pieces
  const topRow = (
    <TokenRow
      title="You pay"
      token={{ ...payToken, chainId: payToken.chainId, symbol: payToken.symbol ?? "SRC" } as any}
      amount={payAmount}
      onAmount={(v: string) => { setMode("pay"); setPayAmount(v); }}
      onComputedBalance={() => {}}
      showMax
    />
  );

  const bottomRow = (
    <TokenRow
      title="You receive"
      token={{ ...receiveToken, chainId: receiveToken.chainId, symbol: receiveToken.symbol ?? "DST" } as any}
      amount={receiveAmount}
      onAmount={(v: string) => { setMode("receive"); setReceiveAmount(v); }}
      onComputedBalance={() => {}}
      showMax
    />
  );

  return (
    <>
      {HeroBg}
      {NeonOverlay}

      <div className="mx-auto max-w-3xl p-4">
        {/* Search / Chain bar */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="flex gap-2">
            <button onClick={()=>setFamily("evm")} className={`px-3 py-1 border rounded ${family==="evm"?"bg-white/10":""}`}>EVM</button>
            <button onClick={()=>setFamily("solana")} className={`px-3 py-1 border rounded ${family==="solana"?"bg-white/10":""}`}>Solana</button>
          </div>

          {family==="evm" && (
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-80">Chain</span>
              <ChainSelect value={selectedChainId} onChange={setSelectedChainId} />
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm opacity-80">Choose for:</span>
            <button onClick={()=>{setPicker("pay"); setShowSearch(true);}} className={`px-2 py-1 text-xs rounded border ${picker==="pay"?"bg-white/10":""}`}>You pay</button>
            <button onClick={()=>{setPicker("receive"); setShowSearch(true);}} className={`px-2 py-1 text-xs rounded border ${picker==="receive"?"bg-white/10":""}`}>You receive</button>
          </div>
        </div>

        {/* Inline search panel (same behavior as your test page) */}
        {showSearch && (
          <div className="mb-4 p-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded px-3 py-2"
                placeholder={family==="evm"?"0x… or symbol/name":"mint or symbol/name"}
                value={searchText}
                onChange={(e)=>setSearchText(e.target.value)}
                onKeyDown={(e)=>{ if(e.key==="Enter") doSearch(); }}
              />
              <button className="px-4 py-2 border rounded" onClick={doSearch} disabled={loading}>{loading?"Searching…":"Search"}</button>
              <button className="px-3 py-2 border rounded" onClick={()=>setShowSearch(false)}>Close</button>
            </div>

            <div className="mt-3 space-y-2 max-h-64 overflow-auto pr-1">
              {/* EVM results */}
              {family==="evm" && results.map((t: any, i: number)=>(
                <button
                  key={`${t.address||i}-${t.chainId??selectedChainId}`}
                  onClick={()=>applyEvmSelection(t)}
                  className="w-full text-left p-3 rounded border border-white/10 bg-white/5 hover:bg-white/10"
                  title="Apply to selected row"
                >
                  <div className="flex items-center gap-3">
                    <InlineRowLogoInjector
                      address={t.address}
                      chainId={t.chainId ?? selectedChainId}
                      symbol={t.symbol}
                      name={t.name}
                      logoURI={t.logoURI}
                      size={28}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {t.symbol || "UNKNOWN"} <span className="text-xs text-white/60">— {t.name || "Token"}</span>
                      </div>
                      <div className="text-xs text-white/60">
                        ChainId: {t.chainId ?? selectedChainId} &nbsp;•&nbsp; Network: {(EVM_CHAINS.find(c=>c.id===(t.chainId ?? selectedChainId))?.name) || "EVM"}
                      </div>
                    </div>
                    <code className="text-xs truncate max-w-[36ch]">{t.address}</code>
                  </div>
                </button>
              ))}

              {/* Solana results (selection disabled in this step to avoid wiring Jupiter here) */}
              {family==="solana" && results.map((t: any, i: number)=>(
                <div key={`${t.mint||i}`} className="p-3 rounded border border-white/10 bg-white/5 opacity-70 cursor-not-allowed">
                  <div className="flex items-center gap-3">
                    <SolRowLogo mint={t.mint} size={28} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {t.symbol || "UNKNOWN"} <span className="text-xs text-white/60">— {t.name || "Token"}</span>
                      </div>
                      <div className="text-xs text-white/60">Solana • mint: <code className="opacity-80">{t.mint}</code></div>
                    </div>
                  </div>
                </div>
              ))}

              {!loading && results.length===0 && (
                <div className="text-sm opacity-70">No matches yet. Try a different term or paste an address/mint.</div>
              )}
            </div>
          </div>
        )}

        {/* Swap card (unchanged baseline) */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4">
          {/* Chain is driven by selected token; optionally show chain selector for convenience */}
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs opacity-80">Active chainId: <span className="font-mono">{chainId}</span></div>
            <div className="flex items-center gap-2">
              <button
                onClick={()=>{ setPicker("pay"); setShowSearch(true); }}
                className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20"
                title="Choose Pay token"
              >
                Choose Pay token
              </button>
              <button
                onClick={()=>{ setPicker("receive"); setShowSearch(true); }}
                className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20"
                title="Choose Receive token"
              >
                Choose Receive token
              </button>
            </div>
          </div>

          {topRow}

          <div className="flex items-center justify-between my-2">
            <button
              onClick={flip}
              className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20"
              title="Flip tokens and amounts"
            >
              Flip
            </button>

            <button
              onClick={() => setMode((m) => (m === "pay" ? "receive" : "pay"))}
              className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20"
              title={mode === "pay" ? "Switch: set output" : "Switch: set input"}
            >
              {mode === "pay" ? "⇄ Set output" : "⇄ Set input"}
            </button>
          </div>

          {bottomRow}

          <QuotePanel
            chainId={chainId}
            src={payToken as any}
            dst={receiveToken as any}
            amount={mode === "pay" ? payAmount : receiveAmount}
            defaultSlippageBps={50}
          />
        </div>
      </div>
    </>
  );
}
