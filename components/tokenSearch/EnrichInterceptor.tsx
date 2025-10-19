"use client";
import { useEffect } from "react";
import { useToast } from "@/components/ui/Toast";

function inferUpdatedFields(obj: any): string[] {
  const out: string[] = [];
  if (obj && typeof obj === "object") {
    if (typeof obj.symbol === "string") out.push("symbol");
    if (typeof obj.name === "string") out.push("name");
    if (typeof obj.logo === "string") out.push("logo");
    if (typeof obj.decimals === "number") out.push("decimals");
  }
  return out.length ? out : ["metadata"];
}

/** try to find the table row for a given Solana mint and update its Source pill */
function updateSourcePillForMint(mint: string, source?: string) {
  if (!source) return;
  // Find a <code> element that exactly shows the mint in the Solana results table
  const codeEls = Array.from(document.querySelectorAll("code"));
  const targetCode = codeEls.find((el) => (el.textContent || "").trim() === mint);
  if (!targetCode) return;

  // Row = <tr> ancestor
  const row = targetCode.closest("tr");
  if (!row) return;

  // Assuming Source is the 4th <td> (Token, Mint, Decimals, Source, Actions)
  const tds = row.querySelectorAll("td");
  if (tds.length < 4) return;
  const sourceTd = tds[3];

  // Find the pill (span) and update its text + classes
  const pill = sourceTd.querySelector("span");
  if (!pill) return;

  pill.textContent = source;

  // Remove any previous styling classes that might conflict
  pill.classList.remove(
    "border-emerald-300/40","text-emerald-200/95","bg-emerald-900/20",
    "border-sky-300/40","text-sky-200/95","bg-sky-900/20",
    "border-white/20","text-white/80","bg-white/5",
    "border-white/15","text-white/70","border"
  );

  // Always keep base pill decoration
  pill.classList.add("inline-block","rounded-full","px-2","py-0.5","text-xs","border");

  if (source === "jup") {
    pill.classList.add("border-emerald-300/40","text-emerald-200/95","bg-emerald-900/20");
  } else if (source === "dex") {
    pill.classList.add("border-sky-300/40","text-sky-200/95","bg-sky-900/20");
  } else {
    pill.classList.add("border-white/20","text-white/80","bg-white/5");
  }
}

export default function EnrichInterceptor() {
  const toast = useToast();

  useEffect(() => {
    const originalFetch = window.fetch;
    async function wrappedFetch(input: RequestInfo | URL, init?: RequestInit) {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : String(input);
      const isEnrich = url.includes("/api/sol-meta-live?mint=");
      const mintMatch = isEnrich ? url.match(/[?&]mint=([^&]+)/) : null;
      const mint = mintMatch ? decodeURIComponent(mintMatch[1]) : undefined;

      try {
        const res = await originalFetch(input as any, init as any);

        if (isEnrich) {
          // Clone & parse safely for UX feedback and DOM update
          let body: any = undefined;
          try {
            const clone = res.clone();
            body = await clone.json();
          } catch {
            // ignore parse errors; fallback below
          }

          if (res.ok) {
            const updated = !!(body && body.updated);
            const source: string | undefined = typeof body?.source === "string" ? body.source : undefined;

            if (updated) {
              const fields = Array.isArray(body?.fields) ? body.fields : inferUpdatedFields(body);
              const srcText = source ? ` via ${source}` : "";
              toast.show(`Updated ${fields.join(", ")}${srcText}.`, "success");
              if (mint) updateSourcePillForMint(mint, source);
            } else {
              toast.show("No new data found.", "info");
            }
          } else {
            toast.show(`Enrich failed (HTTP ${res.status}).`, "error");
          }
        }

        return res;
      } catch (err) {
        if (isEnrich) {
          const msg = err instanceof Error ? err.message : String(err);
          toast.show(`Enrich failed: ${msg}`, "error");
        }
        throw err;
      }
    }

    // install wrapper
    (window as any).fetch = wrappedFetch;
    return () => {
      (window as any).fetch = originalFetch;
    };
  }, [toast]);

  return null;
}
