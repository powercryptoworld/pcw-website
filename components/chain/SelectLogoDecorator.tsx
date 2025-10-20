"use client";

import { useEffect } from "react";

/**
 * This decorates the EXISTING chain <select> on /token-search-test by
 * rendering a small logo preview right next to it. No page edits needed.
 * It detects a <select> whose <option> values are numeric (chain IDs).
 */
export default function SelectLogoDecorator() {
  useEffect(() => {
    // Find the first <select> whose options look like chain IDs.
    const selects = Array.from(document.querySelectorAll("select"));
    const target = selects.find((sel) => {
      const opts = Array.from(sel.querySelectorAll("option"));
      // Heuristic: at least 6 options and most values are integers.
      const ints = opts.filter((o) => /^\d+$/.test((o as HTMLOptionElement).value)).length;
      return opts.length >= 6 && ints / Math.max(1, opts.length) > 0.6;
    }) as HTMLSelectElement | undefined;

    if (!target) return;

    // Create preview container next to the select if not present
    let holder = target.nextElementSibling as HTMLSpanElement | null;
    if (!holder || !holder.classList.contains("pcw-chainlogo-holder")) {
      holder = document.createElement("span");
      holder.className = "pcw-chainlogo-holder inline-flex items-center gap-2 ml-2 align-middle";
      target.insertAdjacentElement("afterend", holder);
    }

    // Helper to render the logo for current value
    const render = () => {
      const idStr = target.value || "";
      const id = parseInt(idStr, 10);
      holder!.innerHTML = ""; // clear

      // Build <img> with svg->png fallback, and a badge fallback if both fail.
      const size = 18;
      const img = document.createElement("img");
      img.width = size;
      img.height = size;
      img.alt = `Chain ${id} logo`;
      img.draggable = false;
      img.className = "rounded-sm";
      img.title = `Chain ${id}`;

      let triedPng = false;
      img.onerror = () => {
        if (!triedPng) {
          triedPng = true;
          img.src = `/chains/${id}.png`;
        } else {
          // Final fallback: badge
          const badge = document.createElement("span");
          const hue = (id * 37) % 360;
          badge.textContent = isFinite(id) ? String(id) : "?";
          badge.className = "inline-flex select-none items-center justify-center rounded-md border text-[10px] font-semibold";
          badge.style.width = `${size}px`;
          badge.style.height = `${size}px`;
          badge.style.minWidth = `${size}px`;
          badge.style.minHeight = `${size}px`;
          badge.style.lineHeight = `${size - 2}px`;
          badge.style.background = `hsl(${hue} 70% 45% / 0.22)`;
          badge.style.color = `#fff`;
          badge.style.borderColor = `hsl(${hue} 70% 60% / 0.45)`;
          badge.style.boxShadow = "0 1px 2px rgba(0,0,0,0.4)";
          holder!.innerHTML = "";
          holder!.appendChild(badge);
        }
      };

      img.src = `/chains/${id}.svg`;
      holder!.appendChild(img);
    };

    render();
    target.addEventListener("change", render);

    // If the page re-renders the select, a MutationObserver keeps the holder in place.
    const mo = new MutationObserver(() => {
      if (!document.body.contains(target)) {
        mo.disconnect();
        return;
      }
      if (!holder || !document.body.contains(holder)) {
        // Re-insert holder if removed
        const newHolder = document.createElement("span");
        newHolder.className = "pcw-chainlogo-holder inline-flex items-center gap-2 ml-2 align-middle";
        target.insertAdjacentElement("afterend", newHolder);
        holder = newHolder;
      }
      render();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      target.removeEventListener("change", render);
      mo.disconnect();
    };
  }, []);

  return null;
}
