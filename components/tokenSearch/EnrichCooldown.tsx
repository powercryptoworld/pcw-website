"use client";
import { useEffect } from "react";

/**
 * Adds a 10s cooldown to any button that either:
 *  - has innerText exactly "Enrich" (case-sensitive), or
 *  - has aria-label="Enrich"
 *
 * We attach via MutationObserver so it works for dynamically-rendered rows.
 * No page edits required.
 */
export default function EnrichCooldown() {
  useEffect(() => {
    const COOLDOWN_MS = 10_000;

    const isEnrichBtn = (el: Element) => {
      if (!(el instanceof HTMLButtonElement)) return false;
      const label = (el.getAttribute("aria-label") || "").trim();
      const text = (el.textContent || "").trim();
      return label === "Enrich" || text === "Enrich" || /^Enrich \(\d+s\)$/.test(text);
    };

    const attach = (btn: HTMLButtonElement) => {
      if ((btn as any)._pcwCooldownAttached) return;
      (btn as any)._pcwCooldownAttached = true;

      btn.addEventListener("click", () => {
        // If already cooling, ignore.
        if (btn.disabled) return;

        // Start cooldown immediately after click.
        const endAt = Date.now() + COOLDOWN_MS;
        const orig = btn.textContent || "Enrich";
        btn.disabled = true;

        const tick = () => {
          const left = Math.max(0, endAt - Date.now());
          const secs = Math.ceil(left / 1000);
          if (left <= 0) {
            btn.disabled = false;
            btn.textContent = "Enrich";
            return;
          }
          btn.textContent = `Enrich (${secs}s)`;
          raf = requestAnimationFrame(tick);
        };

        let raf = requestAnimationFrame(tick);
        // Safety: re-enable after COOLDOWN_MS even if tab is inactive
        setTimeout(() => {
          try {
            btn.disabled = false;
            btn.textContent = "Enrich";
          } catch {}
        }, COOLDOWN_MS + 200);
      });
    };

    const scan = (root: ParentNode) => {
      root.querySelectorAll("button").forEach((el) => {
        if (isEnrichBtn(el)) attach(el as HTMLButtonElement);
      });
    };

    // Initial scan
    scan(document);

    // Observe future changes
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === "childList") {
          m.addedNodes.forEach((n) => {
            if (n instanceof Element) {
              if (n.tagName === "BUTTON" && isEnrichBtn(n)) attach(n as HTMLButtonElement);
              scan(n);
            }
          });
        } else if (m.type === "attributes" && m.target instanceof Element) {
          if (m.target.tagName === "BUTTON" && isEnrichBtn(m.target)) attach(m.target as HTMLButtonElement);
        }
      }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true });

    return () => mo.disconnect();
  }, []);

  return null;
}
