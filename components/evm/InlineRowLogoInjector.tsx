"use client";

import { useEffect } from "react";

/**
 * InlineRowLogoInjector
 * Finds any element inside `.pcw-tscope` whose text contains a 0x…40 address.
 * It inserts a small <img> BEFORE that address and sets data-pcw-inline-logo="1"
 * so the overlay component will skip it (no double logos).
 *
 * Logo src priority:
 *   1) /token-logos/<chainId>/<address-lc>.svg
 *   2) /token-logos/<chainId>/<address-lc>.png
 *   3) /api/evm-logo?chainId=<id>&address=<addr>
 */
export default function InlineRowLogoInjector() {
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
      let i = 0;
      const img = document.createElement("img");
      img.width = 18;
      img.height = 18;
      img.alt = "token logo";
      img.className = "inline-block align-middle rounded-sm mr-1";
      img.draggable = false;
      img.src = tries[i];
      img.addEventListener("error", () => {
        if (i + 1 < tries.length) {
          i += 1;
          img.src = tries[i];
        }
      });
      return img;
    };

    const addrRe = /0x[a-fA-F0-9]{40}/;

    const inject = () => {
      const chainId = getChainId();
      if (!chainId) return;

      const candidates = Array.from(
        scope.querySelectorAll<HTMLElement>("div,span,code,a,b,strong,td,li")
      );

      for (const el of candidates) {
        if (el.getAttribute("data-pcw-inline-logo") === "1") continue;

        const txt = (el.textContent || "").trim();
        if (!txt) continue;

        const m = txt.match(addrRe);
        if (!m) continue;

        const addr = m[0];

        // Place the image just before the FIRST text node that contains the address
        // Split that node so the image sits exactly in front of the address text.
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let t: Node | null = walker.nextNode();
        let hit: Text | null = null;
        while (t) {
          const data = (t as Text).data;
          if (data && data.toLowerCase().includes(addr.toLowerCase())) {
            hit = t as Text;
            break;
          }
          t = walker.nextNode();
        }
        if (!hit) continue;

        const data = hit.data;
        const idx = data.toLowerCase().indexOf(addr.toLowerCase());
        if (idx < 0) continue;

        // Already has an <img> right before? Skip.
        const prev = hit.previousSibling as HTMLElement | null;
        if (prev && prev.tagName === "IMG") {
          el.setAttribute("data-pcw-inline-logo", "1");
          continue;
        }

        // Split the text node and insert <img>
        const before = data.slice(0, idx);
        const after = data.slice(idx);
        hit.data = before;

        const addrNode = document.createTextNode(after);
        if (hit.nextSibling) {
          el.insertBefore(addrNode, hit.nextSibling);
        } else {
          el.appendChild(addrNode);
        }

        const img = mkImg(chainId, addr);
        el.insertBefore(img, addrNode);
        el.setAttribute("data-pcw-inline-logo", "1");
      }
    };

    // Run now and on DOM changes / chain changes
    inject();
    const mo = new MutationObserver(() => inject());
    mo.observe(scope, { childList: true, subtree: true });

    const sel = findChainSelect();
    const onChange = () => inject();
    sel?.addEventListener("change", onChange);

    return () => {
      mo.disconnect();
      sel?.removeEventListener("change", onChange);
    };
  }, []);

  return null;
}
