"use client";

import React, { useCallback } from "react";
import { useToast } from "@/components/ui/Toast";
import { useCooldown } from "@/components/hooks/useCooldown";

type EnrichResult = {
  /** true if anything changed (symbol/name/logo/decimals/etc.) */
  updated: boolean;
  /** which fields were updated, e.g. ["symbol","name","logo"] */
  fields?: string[];
  /** optional new source tag, e.g. "jup" or "dex" */
  source?: string;
};

type Props = {
  /** a stable key for cooldown scoping — e.g. the mint or address string */
  cooldownKey: string;
  /** called when user clicks; return what changed so we can show a toast */
  onEnrich: () => Promise<EnrichResult | void>;
  /** optional: further disable (e.g., while the row is already loading) */
  disabled?: boolean;
  /** button className passthrough */
  className?: string;
};

export default function EnrichButton({ cooldownKey, onEnrich, disabled, className }: Props) {
  const toast = useToast();
  const { isCooling, remainingMs, start } = useCooldown(10_000);

  const handleClick = useCallback(async () => {
    if (isCooling(cooldownKey)) return;

    try {
      start(cooldownKey);
      const res = await onEnrich();
      if (!res) {
        toast.show("Tried live metadata — no changes.", "info");
        return;
      }

      if (res.updated) {
        const fields = res.fields?.length ? res.fields.join(", ") : "metadata";
        const src = res.source ? ` via ${res.source}` : "";
        toast.show(`Updated ${fields}${src}.`, "success");
      } else {
        toast.show("No new data found.", "info");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.show(`Enrich failed: ${msg}`, "error");
    }
  }, [cooldownKey, isCooling, onEnrich, start, toast]);

  const cooling = isCooling(cooldownKey);
  const secs = Math.ceil(remainingMs(cooldownKey) / 1000);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || cooling}
      className={[
        "rounded-xl border px-3 py-1 text-xs",
        "bg-zinc-900/60 border-white/10 text-white",
        "hover:bg-zinc-800/60 disabled:opacity-60 disabled:cursor-not-allowed",
        "transition-colors",
        className ?? ""
      ].join(" ")}
      aria-label="Try live metadata enrichment"
      title="Try to fetch fresh metadata from live sources"
    >
      {cooling ? `Enrich (${secs}s)` : "Enrich"}
    </button>
  );
}
