"use client";
import { useEffect } from "react";

// Heuristic: find rows that show "UNKNOWN — Token" and contain a "mint:" label nearby.
// Then call /api/sol-meta-live and update the row text nodes in place.
// Non-invasive: no state hooks in parent; only DOM mutation like your EVM InlineRowLogoInjector.
export default function AutoEnrichMintInjector() {
  useEffect(() => {
    const root = document;
    let stop = false;

    async function tryEnrichRow(li: HTMLLIElement) {
      if (li.dataset.enriched === "1") return;
      const textBlock = li.querySelector<HTMLElement>(".font-medium");
      const mintLine = li.querySelector<HTMLElement>(".text-xs.break-all, .text-xs.break-all.text-gray-600");
      if (!textBlock || !mintLine) return;

      const text = textBlock.textContent || "";
      const isUnknown = /UNKNOWN\s*—\s*Token/i.test(text);
      if (!isUnknown) return;

      const mintMatch = (mintLine.textContent || "").match(/[1-9A-HJ-NP-Za-km-z]{32,50}/);
      const mint = mintMatch ? mintMatch[0] : null;
      if (!mint) return;

      try {
        const r = await fetch(`/api/sol-meta-live?mint=${encodeURIComponent(mint)}`, { cache: "no-store" });
        if (!r.ok) return;
        const j = await r.json();
        const meta = (j && (j.meta || j.data || j)) || {};
        const sym = typeof meta.symbol === "string" && meta.symbol.length ? meta.symbol : null;
        const name = typeof meta.name === "string" && meta.name.length ? meta.name : null;
        if (sym || name) {
          textBlock.textContent = `${sym || "UNKNOWN"} — ${name || "Token"}`;
          li.dataset.enriched = "1";
        }
      } catch {
        /* ignore */
      }
    }

    const obs = new MutationObserver(() => {
      if (stop) return;
      const solPanel = Array.from(root.querySelectorAll("h1,button"))
        .find(el => el.textContent?.includes("Token Search") )?.closest("div");
      const list = solPanel?.querySelector("ul");
      if (!list) return;
      list.querySelectorAll("li").forEach(li => tryEnrichRow(li as HTMLLIElement));
    });

    obs.observe(root.documentElement, { subtree: true, childList: true });

    return () => {
      stop = true;
      obs.disconnect();
    };
  }, []);

  return null;
}
