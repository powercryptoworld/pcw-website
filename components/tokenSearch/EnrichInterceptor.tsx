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

export default function EnrichInterceptor() {
  const toast = useToast();

  useEffect(() => {
    const originalFetch = window.fetch;
    async function wrappedFetch(input: RequestInfo | URL, init?: RequestInit) {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : String(input);
      const isEnrich = url.includes("/api/sol-meta-live?mint=");
      try {
        const res = await originalFetch(input as any, init as any);
        if (isEnrich) {
          // Clone & parse safely for UX feedback
          let body: any = undefined;
          try {
            const clone = res.clone();
            body = await clone.json();
          } catch {
            // ignore parse errors; fallback below
          }
          if (res.ok) {
            const updated = !!(body && body.updated);
            if (updated) {
              const fields = Array.isArray(body?.fields) ? body.fields : inferUpdatedFields(body);
              const src = typeof body?.source === "string" ? ` via ${body.source}` : "";
              toast.show(`Updated ${fields.join(", ")}${src}.`, "success");
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
