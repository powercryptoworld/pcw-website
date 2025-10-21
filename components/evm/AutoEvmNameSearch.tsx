"use client";
import { useEffect } from "react";

type Props = {
  family: string;
  q: string;
  chainId: number;
  // setList must accept either an array or {items:[]}
  setList: (v: any) => void;
};

/**
 * AutoEvmNameSearch
 * - If on EVM and q is NOT a 0x..40 address, fetch /api/evm-search?q=..&chainId=..
 * - Sets list to {items:[...]} so your existing guarded renderer can map it.
 * - No effect on address searches (your current flow keeps working).
 */
export default function AutoEvmNameSearch({ family, q, chainId, setList }: Props) {
  useEffect(() => {
    const isEvm = family === "evm";
    const isAddr = /^0x[a-fA-F0-9]{40}$/.test(q.trim());
    if (!isEvm || !q || isAddr) return;
    let dead = false;

    (async () => {
      try {
        const url = `/api/evm-search?q=${encodeURIComponent(q)}&chainId=${chainId}`;
        const r = await fetch(url, { cache: "no-store" });
        const json = await r.json();
        if (!dead) {
          const items = Array.isArray(json?.items) ? json.items : Array.isArray(json) ? json : [];
          setList({ items });
        }
      } catch {
        if (!dead) setList({ items: [] });
      }
    })();

    return () => { dead = true; };
  }, [family, q, chainId, setList]);

  return null;
}
