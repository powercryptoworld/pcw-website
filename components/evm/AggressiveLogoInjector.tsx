"use client";

import { useEffect } from "react";

/**
 * AggressiveLogoInjector
 * - Works ONLY inside `.pcw-tscope` (the token-search-test page wrapper).
 * - Finds ANY element whose visible text contains a 0x[a-fA-F0-9]{40} address.
 * - Prepends a 18x18 <img> just before the first text node of that element.
 * - Image source order:
 *     /token-logos/<chainId>/<addr-lc>.svg
 *     /token-logos/<chainId>/<addr-lc>.png
 *     /api/evm-logo?chainId=<id>&address=<addr>
 */
export default function AggressiveLogoInjector() {
  useEffect(() => {
    const scope = document.querySelector(".pcw-tscope") || document.body;

    const findChainSelect = (): HTMLSelectElement | undefined => {
      const selects = Array.from(scope.querySelectorAll("select"));
      return selects.find((sel) => {
        const opts = Array.from(sel.querySelectorAll("option"));
        const ints = opts.filter((o) => /^\d+$/.test((o as HTMLOptionElement).value)).length;
        return opts.length >= 6 && ints / Math.max(1, opts.length) > 0.6;
      }) as HTMLSelectElement | undefined;
    };

    const getChainId = (sel?: HTMLSelectElement) => {
      try {
        const v = parseInt((sel?.value || "0"), 10);
        return Number.isFinite(v) ? v : 0;
      } catch { return 0; }
    };

    const mkImg = (chainId: number, addr: string) => {
      const lower = addr.toLowerCase();
      const tries = [
        `/token-logos/${chainId}/${lower}.svg`,
        `/token-logos/${chainId}/${lower}.png`,
        `/api/evm-logo?chainId=${chainId}&address=${addr}`,
      ];
      const img = document.createElement("img");
      img.width = 18;
      img.height = 18;
      img.alt = "token logo";
      img.className = "inline-block align-middle rounded-sm mr-1";
      img.draggable = false;
      let i = 0;
      img.src = tries[i];
      img.addEventListener("error", () => {
        if (i + 1 < tries.length) {
          i += 1;
          img.src = tries[i];
        }
      }, { passive: true });
      return img;
    };

    const injectIntoEl = (el: Element, chainId: number, addr: string) => {
      if ((el as any)._pcwAggLogo === addr) return;
      const img = mkImg(chainId, addr);

      // Insert before the first child (prepend)
      if (el.firstChild) {
        el.insertBefore(img, el.firstChild);
      } else {
        el.appendChild(img);
      }
      (el as any)._pcwAggLogo = addr;
    };

    const scan = () => {
      const sel = findChainSelect();
      const chainId = getChainId(sel);
      if (!chainId) return;

      // Look for any element that is likely to contain the address text
      const candidates = Array.from(scope.querySelectorAll("div,span,td,li,code,b,strong"));
      const addrRe = /0x[a-fA-F0-9]{40}/;

      for (const el of candidates) {
        const text = (el.textContent || "").trim();
        const m = text.match(addrRe);
        if (!m) continue;

        // Avoid injecting inside huge containers; prefer small leaf-ish nodes
        const childrenTextLen = Array.from(el.children).reduce((s, c) => s + (c.textContent || "").length, 0);
        if (childrenTextLen > text.length * 0.8) continue;

        injectIntoEl(el, chainId, m[0]);
      }
    };

    // Initial + reactive scans
    scan();
    const mo = new MutationObserver(() => scan());
    mo.observe(scope, { childList: true, subtree: true });

    const sel = findChainSelect();
    const onChange = () => scan();
    sel?.addEventListener("change", onChange);

    return () => {
      mo.disconnect();
      sel?.removeEventListener("change", onChange);
    };
  }, []);

  return null;
}
