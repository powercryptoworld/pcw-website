"use client";

import { useEffect } from "react";

/**
 * SpecificLogoPin
 * Deterministically prepends a logo <img> right before any <code> element whose
 * content matches one of our known addresses (PCW, XPIN on BSC/56).
 * This guarantees the logos show up on /token-search-test regardless of how rows render.
 */
export default function SpecificLogoPin() {
  useEffect(() => {
    const scope = document.querySelector(".pcw-tscope") || document.body;

    const PAIRS: Array<{ addr: string; src: string }> = [
      {
        addr: "0x9370a51c9f2ae6b23719ab74f05261891c609a23", // PCW
        src: "/token-logos/56/0x9370a51c9f2ae6b23719ab74f05261891c609a23.svg",
      },
      {
        addr: "0xd955c9ba56fb1ab30e34766e252a97ccce3d31a6", // XPIN
        src: "/token-logos/56/0xd955c9ba56fb1ab30e34766e252a97ccce3d31a6.svg",
      },
    ];

    const prependIfNeeded = (codeEl: HTMLElement, src: string, key: string) => {
      if ((codeEl as any)._pcwPinned === key) return;
      const prev = codeEl.previousSibling as HTMLElement | null;
      if (prev && prev.tagName === "IMG") {
        (codeEl as any)._pcwPinned = key;
        return;
      }
      const img = document.createElement("img");
      img.src = src;
      img.width = 18;
      img.height = 18;
      img.alt = "token logo";
      img.className = "inline-block align-middle rounded-sm mr-1";
      img.draggable = false;
      codeEl.parentElement?.insertBefore(img, codeEl);
      (codeEl as any)._pcwPinned = key;
    };

    const scan = () => {
      const codes = Array.from(scope.querySelectorAll("code")) as HTMLElement[];
      for (const c of codes) {
        const t = (c.textContent || "").trim().toLowerCase();
        for (const p of PAIRS) {
          if (t === p.addr) {
            prependIfNeeded(c, p.src, p.addr);
          }
        }
      }
    };

    // initial + reactive scans
    scan();
    const mo = new MutationObserver(() => scan());
    mo.observe(scope, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);

  return null;
}
