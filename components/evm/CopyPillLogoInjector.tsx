"use client";

import { useEffect } from "react";

/**
 * CopyPillLogoInjector
 * Targets the exact UI pattern on /token-search-test EVM rows:
 *  - The token address is followed by a small "Copy" pill.
 * We locate that pill, walk left to the address node, and insert a 18x18 <img>
 * right before the address text.
 *
 * Logo source priority:
 *   1) /token-logos/<chainId>/<addr-lc>.svg
 *   2) /token-logos/<chainId>/<addr-lc>.png
 *   3) /api/evm-logo?chainId=<id>&address=<addr>
 */
export default function CopyPillLogoInjector() {
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

    const getChainId = () => {
      const sel = findChainSelect();
      if (!sel) return 0;
      const v = parseInt(sel.value || "0", 10);
      return Number.isFinite(v) ? v : 0;
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
      img.addEventListener(
        "error",
        () => {
          if (i + 1 < tries.length) {
            i += 1;
            img.src = tries[i];
          }
        },
        { passive: true }
      );
      return img;
    };

    const addrRe = /0x[a-fA-F0-9]{40}/;

    const scan = () => {
      const chainId = getChainId();
      if (!chainId) return;

      // Find every element whose text is exactly "Copy" (the pill)
      const all = Array.from(scope.querySelectorAll("*")) as HTMLElement[];
      const copyPills = all.filter((el) => (el.textContent || "").trim() === "Copy");

      copyPills.forEach((pill) => {
        const parent = pill.parentElement;
        if (!parent) return;

        // Walk left among siblings to find the node that contains the address
        let node: ChildNode | null = pill.previousSibling;
        while (node) {
          let text = "";
          if (node.nodeType === Node.TEXT_NODE) {
            text = (node.textContent || "").trim();
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            text = ((node as Element).textContent || "").trim();
          }
          const m = text.match(addrRe);
          if (m) {
            const addr = m[0];
            // Prevent duplicate insertion
            if ((parent as any)._pcwCopyLogo === addr) return;

            // Insert <img> before the address node
            const img = mkImg(chainId, addr);
            parent.insertBefore(img, node);
            (parent as any)._pcwCopyLogo = addr;
            return;
          }
          node = node.previousSibling;
        }
      });
    };

    // Initial and reactive runs
    scan();
    const mo = new MutationObserver(() => scan());
    mo.observe(scope, { childList: true, subtree: true });

    // Re-run when chain changes
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
