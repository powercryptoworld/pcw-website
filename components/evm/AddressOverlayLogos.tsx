"use client";

import { useEffect } from "react";

/**
 * AddressOverlayLogos
 * Overlay logos beside known EVM addresses (PCW & XPIN on BSC/56).
 * UPDATED: If a target element has data-pcw-inline-logo="1", we SKIP overlay
 * so we won't double-render once we switch to a true inline injector.
 */
export default function AddressOverlayLogos() {
  useEffect(() => {
    const scope = document.querySelector(".pcw-tscope") || document.body;

    const PINS: Array<{ addrLc: string; src: string }> = [
      {
        addrLc: "0x9370a51c9f2ae6b23719ab74f05261891c609a23", // PCW
        src: "/token-logos/56/0x9370a51c9f2ae6b23719ab74f05261891c609a23.svg",
      },
      {
        addrLc: "0xd955c9ba56fb1ab30e34766e252a97ccce3d31a6", // XPIN
        src: "/token-logos/56/0xd955c9ba56fb1ab30e34766e252a97ccce3d31a6.svg",
      },
    ];

    // Overlay container
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "0";
    container.style.top = "0";
    container.style.pointerEvents = "none";
    container.style.zIndex = "999998";
    document.body.appendChild(container);

    const overlays = new Map<string, HTMLImageElement>();

    const ensureOverlay = (key: string, src: string) => {
      let img = overlays.get(key);
      if (!img) {
        img = document.createElement("img");
        img.width = 18;
        img.height = 18;
        img.src = src;
        img.alt = "logo";
        img.style.position = "absolute";
        img.style.borderRadius = "4px";
        img.style.boxShadow = "0 0 0 1px rgba(0,0,0,0.25)";
        container.appendChild(img);
        overlays.set(key, img);
      }
      return img;
    };

    const addrRe = /0x[a-fA-F0-9]{40}/;

    const findTargets = (): Array<{ key: string; el: HTMLElement; src: string }> => {
      const all = Array.from(scope.querySelectorAll<HTMLElement>("div,span,code,a,b,strong,td,li"));
      const out: Array<{ key: string; el: HTMLElement; src: string }> = [];
      for (const el of all) {
        // NEW: if inline already injected, skip overlay
        if (el.getAttribute("data-pcw-inline-logo") === "1") continue;

        const text = (el.textContent || "").trim().toLowerCase();
        if (!text || !addrRe.test(text)) continue;
        for (const pin of PINS) {
          if (text.includes(pin.addrLc)) {
            out.push({ key: pin.addrLc, el, src: pin.src });
          }
        }
      }
      return out;
    };

    const place = () => {
      const rectOffsetX = window.scrollX;
      const rectOffsetY = window.scrollY;

      const w = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
      const h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      container.style.width = `${w}px`;
      container.style.height = `${h}px`;

      const targets = findTargets();
      const seen = new Set<string>();

      for (const t of targets) {
        const r = t.el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;

        const img = ensureOverlay(t.key, t.src);
        img.style.left = `${rectOffsetX + r.left - 22}px`;
        img.style.top = `${rectOffsetY + r.top + Math.max(0, (r.height - 18) / 2)}px`;
        img.style.display = "block";
        seen.add(t.key);
      }

      for (const [k, img] of overlays) {
        if (!seen.has(k)) img.style.display = "none";
      }
    };

    place();
    const mo = new MutationObserver(() => place());
    mo.observe(scope, { childList: true, subtree: true });
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);

    return () => {
      mo.disconnect();
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
      container.remove();
      overlays.clear();
    };
  }, []);

  return null;
}
