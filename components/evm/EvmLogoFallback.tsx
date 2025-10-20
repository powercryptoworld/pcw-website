"use client";

import { useEffect } from "react";

/**
 * EvmLogoFallback v2
 * - Detects EVM results rows that contain a 0x...40 address.
 * - If the row has no real logo <img>, injects one that points to /api/evm-logo.
 * - If an <img> exists but fails, retries via /api/evm-logo.
 * - Currently only fetches remote logos when the selected chain is BSC (56).
 */
export default function EvmLogoFallback() {
  useEffect(() => {
    const findChainSelect = (): HTMLSelectElement | undefined => {
      const selects = Array.from(document.querySelectorAll("select"));
      return selects.find((sel) => {
        const opts = Array.from(sel.querySelectorAll("option"));
        const ints = opts.filter((o) => /^\d+$/.test((o as HTMLOptionElement).value)).length;
        return opts.length >= 6 && ints / Math.max(1, opts.length) > 0.6;
      }) as HTMLSelectElement | undefined;
    };

    const chainSel = findChainSelect();
    if (!chainSel) return;

    const getChainId = () => {
      const v = parseInt(chainSel.value || "0", 10);
      return Number.isFinite(v) ? v : 0;
    };

    const isAddress = (s: string) => /^0x[a-fA-F0-9]{40}$/.test(s);

    const findAddressInNode = (node: Element): string | undefined => {
      // Look for code tags or text containing the first 0x...40
      const codes = Array.from(node.querySelectorAll("code"));
      for (const c of codes) {
        const t = (c.textContent || "").trim();
        if (isAddress(t)) return t;
      }
      const m = (node.textContent || "").match(/0x[a-fA-F0-9]{40}/);
      return m ? m[0] : undefined;
    };

    const ensureImg = (row: Element, addr: string, chainId: number) => {
      // If already injected once for this address, skip
      if ((row as any)._pcwInjectedLogo === addr) return;

      // Look for an existing meaningful image
      const existingImg = row.querySelector("img");
      if (existingImg) {
        attachFallback(existingImg as HTMLImageElement, addr, chainId);
        return;
      }

      // Inject a small <img> before the first token title/text node
      const img = document.createElement("img");
      img.width = 18;
      img.height = 18;
      img.alt = `Token logo`;
      img.draggable = false;
      img.className = "mr-2 inline-block align-middle rounded-sm";
      img.setAttribute("data-address", addr);

      attachFallback(img, addr, chainId);

      // Try to insert near the start of the row
      const firstTokenCell =
        row.querySelector("td") || row.querySelector("[data-row],div,li");
      if (firstTokenCell) {
        firstTokenCell.insertBefore(img, firstTokenCell.firstChild);
      } else {
        row.insertBefore(img, row.firstChild);
      }

      (row as any)._pcwInjectedLogo = addr;
    };

    const attachFallback = (img: HTMLImageElement, addr: string, chainId: number) => {
      const tryFallback = () => {
        if ((img as any)._pcwTriedFallback) return;
        (img as any)._pcwTriedFallback = true;

        // Only pull remote logos for BSC for now
        if (chainId !== 56) return;

        img.src = `/api/evm-logo?chainId=${chainId}&address=${addr}`;
      };

      // If src is empty/placeholder, try immediately
      const src = img.getAttribute("src") || "";
      if (!src || src.startsWith("data:") || src === "#" || src === "/") {
        tryFallback();
      }
      img.addEventListener("error", tryFallback, { passive: true });
    };

    const scan = (root: ParentNode) => {
      const chainId = getChainId();
      // Heuristic rows: table rows, list items, or blocks within the results list
      const rows = Array.from(root.querySelectorAll("tr,li,div"));
      rows.forEach((row) => {
        const addr = findAddressInNode(row as Element);
        if (!addr) return;
        ensureImg(row as Element, addr, chainId);
      });
    };

    // Initial pass
    scan(document);

    // React to content updates
    const mo = new MutationObserver((muts) => {
      muts.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node instanceof Element) scan(node);
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // When chain changes, rescan to inject logos for the new chain
    const onChange = () => scan(document);
    chainSel.addEventListener("change", onChange);

    return () => {
      mo.disconnect();
      chainSel.removeEventListener("change", onChange);
    };
  }, []);

  return null;
}
