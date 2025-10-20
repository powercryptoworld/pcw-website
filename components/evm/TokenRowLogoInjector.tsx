"use client";

import { useEffect } from "react";

/**
 * TokenRowLogoInjector v3
 * - Scans ONLY inside `.pcw-tscope` (the /token-search-test content wrapper).
 * - Looks for address badges rendered inside <code>…0x…</code>.
 * - Injects a 18x18 <img> immediately BEFORE that <code>.
 * - Image resolution order:
 *    1) /token-logos/<chainId>/<address-lc>.svg
 *    2) /token-logos/<chainId>/<address-lc>.png
 *    3) /api/evm-logo?chainId=<id>&address=<addr>
 */
export default function TokenRowLogoInjector() {
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

    const makeImg = (chainId: number, addr: string) => {
      const img = document.createElement("img");
      img.width = 18;
      img.height = 18;
      img.alt = "token logo";
      img.draggable = false;
      img.className = "inline-block align-middle rounded-sm mr-1";
      img.loading = "lazy";

      const lower = addr.toLowerCase();
      const tries = [
        `/token-logos/${chainId}/${lower}.svg`,
        `/token-logos/${chainId}/${lower}.png`,
        `/api/evm-logo?chainId=${chainId}&address=${addr}`,
      ];
      let i = 0;
      const next = () => {
        if (i + 1 < tries.length) {
          i += 1;
          img.src = tries[i];
        }
      };
      img.addEventListener("error", next, { passive: true });
      img.src = tries[0];
      return img;
    };

    const injectForCode = (codeEl: HTMLElement, chainId: number, addr: string) => {
      if ((codeEl as any)._pcwLogoInjected) return;
      const img = makeImg(chainId, addr);
      codeEl.parentElement?.insertBefore(img, codeEl);
      (codeEl as any)._pcwLogoInjected = true;
    };

    const scan = () => {
      const sel = findChainSelect();
      const chainId = getChainId(sel);

      // Only scan inside the content scope
      const codes = Array.from(scope.querySelectorAll("code")) as HTMLElement[];
      for (const c of codes) {
        const t = (c.textContent || "").trim();
        const m = t.match(/^0x[a-fA-F0-9]{40}$/);
        if (!m) continue;
        injectForCode(c, chainId, m[0]);
      }
    };

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
