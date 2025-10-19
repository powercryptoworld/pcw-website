"use client";
import { useEffect } from "react";

export default function ClearFeeOnAmountChange({ targetId = "pay" }: { targetId?: string }) {
  useEffect(() => {
    const input = document.getElementById(targetId) as HTMLInputElement | null;
    if (!input) return;

    const clear = () => {
      try {
        const fee = document.getElementById("wallet-fee");
        if (fee) fee.textContent = "—";
        // Invalidate previously built tx so user must click "Build tx" again
        (window as any).__lastBuiltTx = null;
      } catch {}
    };

    input.addEventListener("input", clear);
    input.addEventListener("change", clear);
    return () => {
      input.removeEventListener("input", clear);
      input.removeEventListener("change", clear);
    };
  }, [targetId]);

  return null;
}
