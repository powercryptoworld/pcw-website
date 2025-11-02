"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import TokenRow from "@/components/swap/TokenRow";
import QuotePanel from "@/components/swap/QuotePanel";
import { ChainSelect } from "@/components/ChainSelect";
import InlineRowLogoInjector from "@/components/evm/InlineRowLogoInjector";
import { SolRowLogo } from "@/components/sol/SolRowLogo";
import { EVM_CHAINS } from "@/lib/chains";
import { normalizeList } from "@/lib/normalizeList";
import { useEvmQuote } from "@/hooks/useEvmQuote";

type Addr = `0x${string}`;
type TokenRef = { chainId: number; address: Addr; decimals: number; symbol?: string; name?: string; logoURI?: string };

// small utility (no classnames dep)
const cx = (...a: (string | undefined | false | null)[]) => a.filter(Boolean).join(" ");

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

// Token chip shown above rows — supports EVM or Solana preview
function TokenChip({
  family,
  chainId,
  address,
  symbol,
  name,
  logoURI,
  mint,
  onClear,
  className
}:{
  family:"evm"|"sol";
  chainId?: number;
  address?: string;
  symbol?: string;
  name?: string;
  logoURI?: string | null;
  mint?: string;
  onClear?: () => void;
  className?: string;
}) {
  return (
    <span className={cx("inline-flex items-center gap-2 px-2 py-1 rounded-lg border border-white/10 bg-white/5", className)}>
      {family === "evm" ? (
        <InlineRowLogoInjector
          address={(address || "") as any}
          chainId={chainId!}
          symbol={symbol}
          name={name}
          logoURI={logoURI || undefined}
          size={16}
        />
      ) : (
        <SolRowLogo mint={mint || ""} size={16} />
      )}
      <span className="text-xs font-medium">{symbol || (family==="sol" ? "SOL" : "TKN")}</span>
      {family === "sol" && <span className="text-[10px] px-1 py-0.5 rounded bg-yellow-500/20 border border-yellow-500/30">Solana preview</span>}
      {onClear && (
        <button onClick={onClear} title="Clear" className="text-[10px] px-1 rounded hover:bg-white/10">×</button>
      )}
    </span>
  );
}

export default function Page() {
  // Background
  const HeroBg = (
    <div aria-hidden style={{
      position:"fixed", inset:0, zIndex:-6,
      backgroundImage:"url(/swap-hero.jpg)", backgroundSize:"cover",
      backgroundPosition:"center 55%", backgroundRepeat:"no-repeat",
      filter:"saturate(115%) brightness(0.95)", pointerEvents:"none"
    }}/>
  );
  const NeonOverlay = <div className="swap-vfx" aria-hidden />;

  // === Swap state (EVM) ===
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

  // === Picker (inside the card) ===
  const [picker, setPicker] = useState<"pay" | "receive" | null>(null);
  const [family, setFamily] = useState<"evm" | "solana">("evm");
  const [selectedChainId, setSelectedChainId] = useState<number>(56);
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // NEW: Solana preview (UI-only)
  const [solPay, setSolPay] = useState<any | null>(null);
  const [solReceive, setSolReceive] = useState<any | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

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

  // Autofocus the search when picker opens; clear results when toggling tabs/chain
  useEffect(() => {
    if (picker && searchRef.current) searchRef.current.focus();
    if (picker) setResults([]);
  }, [picker, family, selectedChainId]);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPicker(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
      setSolPay(null); // clear sol preview if any
    } else if (picker === "receive") {
      setReceiveToken(picked);
      if (picked.chainId !== chainId) setChainId(picked.chainId);
      setSolReceive(null); // clear sol preview if any
    }
    setPicker(null);
  };

  // NEW: Apply Solana preview (UI-only — does NOT affect EVM rows/quotes)
  const applySolPreview = (t: any) => {
    if (picker === "pay") setSolPay(t);
    if (picker === "receive") setSolReceive(t);
    setPicker(null);
  };

  // === Amount mirroring via useEvmQuote (Swap Lab parity) ===
  const q = useEvmQuote({
    chainId,
    src: { address: (src.address as Addr), decimals: src.decimals, symbol: src.symbol },
    dst: { address: (dst.address as Addr), decimals: dst.decimals, symbol: dst.symbol },
    amount: humanAmount || "0",
    slippageBps: 50,
    includeProtocols: true,
    gasSpeed: "fast",
  });

  useEffect(() => {
    const dstAmount = q?.data?.dstAmount ?? null;
    if (!dstAmount) return;
    const human = Number(dstAmount) / 10 ** (dst.decimals ?? 18);
    let out = human.toLocaleString(undefined, { maximumFractionDigits: Math.min(8, dst.decimals ?? 8) }).replace(/,/g,"");
    out = out.replace(/(\.\d*?[1-9])0+$/,"$1").replace(/\.0+$/,"").replace(/\.$/,"");
    if (mode === "pay") {
      if (out !== receiveAmount) setReceiveAmount(out);
    } else {
      if (out !== payAmount) setPayAmount(out);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q?.data?.dstAmount, mode, dst.decimals]);

  const flip = () => {
    setPayToken(receiveToken);
    setReceiveToken(payToken);
    setPayAmount(receiveAmount || "");
    setReceiveAmount(payAmount || "");
    // keep Solana previews with their rows
    const sp = solPay; const sr = solReceive;
    setSolPay(sr); setSolReceive(sp);
  };

  const solNotice = (solPay || solReceive) ? (
    <div className="mt-2 text-[11px] px-2 py-1 rounded border border-yellow-500/30 bg-yellow-500/10">
      Solana token selected in {solPay ? "Pay" : ""}{solPay && solReceive ? " & " : ""}{solReceive ? "Receive" : ""} — EVM quotes shown only. Solana swaps coming soon.
    </div>
  ) : null;

  return (
    <>
      {/* Background */}
      <div aria-hidden style={{
        position:"fixed", inset:0, zIndex:-6,
        backgroundImage:"url(/swap-hero.jpg)", backgroundSize:"cover",
        backgroundPosition:"center 55%", backgroundRepeat:"no-repeat",
        filter:"saturate(115%) brightness(0.95)", pointerEvents:"none"
      }}/>
      <div className="swap-vfx" aria-hidden />

      <div className="mx-auto max-w-3xl p-4">
        <div className="glass swapCard relative">
  <div className="flex items-center justify-between mb-1">
    <div className="text-[11px] opacity-80">
      Network: <span className="font-mono">{EVM_CHAINS.find(c=>c.id===chainId)?.name || `chainId `}</span>
    </div>
    <button onClick={() => setMode((m) => (m === \"pay\" ? \"receive\" : \"pay\"))} className=\"text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20\" title={mode === \"pay\" ? \"Switch: set output\" : \"Switch: set input\"}>{mode === \"pay\" ? \"⇄ Set output\" : \"⇄ Set input\"}</button>
  </div>

  {/* You pay */}
          <div className="flex items-center justify-between mb-1"><div className="flex items-center gap-2"><button className="token-chip-btn chip-icon-only" onClick={()=>setPicker("pay")} title="Choose Pay token">{solPay ? (
  <TokenChip family="sol" symbol={solPay.symbol} name={solPay.name} mint={solPay.mint} onClear={()=>setSolPay(null)} />
) : (
  <TokenChip family="evm" chainId={payToken.chainId} address={payToken.address} symbol={payToken.symbol} name={payToken.name} logoURI={payToken.logoURI} />
)}

              </button>
            </div>
          </div>
          {/* You pay */}
                  title={mode === "pay" ? "Switch: set output" : "Switch: set input"}>
                {mode === "pay" ? "⇄ Set output" : "⇄ Set input"}
              </button>
            </div>
          </div>
          {/* You pay */}
                  title={mode === "pay" ? "Switch: set output" : "Switch: set input"}>
                {mode === "pay" ? "⇄ Set output" : "⇄ Set input"}
              </button>
            </div>
          </div>
          {/* You pay */}
