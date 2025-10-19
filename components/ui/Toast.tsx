"use client";
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type ToastKind = "info" | "success" | "error";

type ToastItem = {
  id: number;
  kind: ToastKind;
  text: string;
};

type ToastAPI = {
  show: (text: string, kind?: ToastKind) => void;
};

const ToastCtx = createContext<ToastAPI | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((text: string, kind: ToastKind = "info") => {
    const id = nextId.current++;
    setItems((prev) => [...prev, { id, kind, text }]);
    // Auto-dismiss after 2500ms
    window.setTimeout(() => remove(id), 2500);
  }, [remove]);

  const api = useMemo<ToastAPI>(() => ({ show }), [show]);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      {/* Host */}
      <div className="pointer-events-none fixed top-3 right-3 z-[100] flex flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={[
              "pointer-events-auto min-w-[220px] max-w-[360px] rounded-2xl px-4 py-3 shadow-lg backdrop-blur",
              "text-sm text-white",
              "border",
              t.kind === "success" ? "bg-emerald-600/70 border-emerald-300/30" :
              t.kind === "error"   ? "bg-rose-600/70 border-rose-300/30" :
                                     "bg-zinc-800/70 border-white/10"
            ].join(" ")}
            role="status"
            aria-live="polite"
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
