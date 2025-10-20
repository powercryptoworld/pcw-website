"use client";

import { useEffect } from "react";

/**
 * ExactAddressLogoPin
 * - Searches within `.pcw-tscope` for TEXT NODES that contain the exact token
 *   address (case-insensitive). When found, it splits the text node and inserts
 *   a 18x18 <img> immediately before the address text itself.
 * - This avoids relying on specific DOM structure (Copy pill, <code>, etc.).
 * - Currently pins BSC (56) for PCW + XPIN. Easy to extend.
 */
export default function ExactAddressLogoPin() {
  useEffect(() => {
    const scope = (document.querySelector(".pcw-tscope") || document.body) as ParentNode;

    // Known addresses (lowercased) → local svg first (works offline), then API fallback.
    const PAIRS: Array<{ addr: string; srcs: string[] }> = [
      {
        addr: "0x9370a51c9f2ae6b23719ab74f05261891c609a23", // PCW
        srcs: [
          "/token-logos/56/0x9370a51c9f2ae6b23719ab74f05261891c609a23.svg",
          "/api/evm-logo?chainId=56&address=0x9370a51C9F2Ae6B23719ab74f05261891C609A23",
        ],
      },
      {
        addr: "0xd955c9ba56fb1ab30e34766e252a97ccce3d31a6", // XPIN
        srcs: [
          "/token-logos/56/0xd955c9ba56fb1ab30e34766e252a97ccce3d31a6.svg",
          "/api/evm-logo?chainId=56&address=0xD955c9bA56Fb1AB30e34766e252A97ccCE3D31A6",
        ],
      },
    ];

    // Walk all text nodes under scope
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let n: Node | null = walker.nextNode();
    while (n) {
      if (n.nodeType === Node.TEXT_NODE) textNodes.push(n as Text);
      n = walker.nextNode();
    }

    const pinAtTextNode = (textNode: Text, addrLc: string, srcs: string[]) => {
      // Prevent duplicate pinning
      const parent = textNode.parentElement;
      if (!parent) return;
      if ((parent as any)._pcwPinnedFor === addrLc) return;

      // Find start index of the address in this text (case-insensitive)
      const full = textNode.data;
      const idx = full.toLowerCase().indexOf(addrLc);
      if (idx === -1) return;

      // Split the text node: [before][addr][after]
      const before = full.slice(0, idx);
      const after = full.slice(idx);
      textNode.data = before;

      const addrNode = document.createTextNode(after);
      parent.insertBefore(addrNode, textNode.nextSibling ?? null);

      // Create the <img> and place it before the addrNode
      const img = document.createElement("img");
      img.width = 18;
      img.height = 18;
      img.alt = "token logo";
      img.className = "inline-block align-middle rounded-sm mr-1";
      img.draggable = false;

      let i = 0;
      const tryNext = () => {
        if (i + 1 < srcs.length) {
          i += 1;
          img.src = srcs[i];
        }
      };
      img.addEventListener("error", tryNext, { passive: true });
      img.src = srcs[0];

      parent.insertBefore(img, addrNode);
      (parent as any)._pcwPinnedFor = addrLc;
    };

    const scan = () => {
      // For each known address, search all text nodes and pin if present
      for (const t of textNodes) {
        const content = t.data.toLowerCase();
        for (const p of PAIRS) {
          if (content.includes(p.addr)) {
            pinAtTextNode(t, p.addr, p.srcs);
          }
        }
      }
    };

    scan();

    // Re-scan on dynamic updates
    const mo = new MutationObserver(() => {
      // Refresh list of text nodes (new results)
      const w = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
      textNodes.length = 0;
      let nn: Node | null = w.nextNode();
      while (nn) {
        if (nn.nodeType === Node.TEXT_NODE) textNodes.push(nn as Text);
        nn = w.nextNode();
      }
      scan();
    });
    mo.observe(scope, { childList: true, subtree: true });

    return () => mo.disconnect();
  }, []);

  return null;
}
