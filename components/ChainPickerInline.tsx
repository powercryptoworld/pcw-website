"use client";
import React from "react";
import { EVM_CHAINS } from "@/lib/chains";
import { chainLogoFor } from "@/lib/chainLogos";

type Props = {
  value: number;
  onChange: (v: number) => void;
  className?: string;
};

export default function ChainPickerInline({ value, onChange, className }: Props) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  // Close when clicking outside
  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const chain = EVM_CHAINS.find((c) => c.id === value);

  return (
    <div ref={rootRef} className={`relative inline-block ${className || ""}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-8 px-2 py-0 rounded bg-black/30 border border-white/10 text-sm leading-none min-w-[180px] text-left flex items-center justify-between gap-2"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2 truncate">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-white/20 bg-white/5 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={(chain && (chainLogoFor(chain.id) || "")) || ""}
              alt={chain?.short || "CH"}
              width={16}
              height={16}
              style={{ display: "block", width: 16, height: 16, objectFit: "contain" }}
            />
          </span>
          <span className="truncate">
            {chain ? `${chain.name} (${chain.id})` : "Select chain"}
          </span>
        </span>
        <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M5 7l5 6 5-6H5z" fill="currentColor" />
        </svg>
      </button>

      {/* Inline dropdown (absolute, contained inside header area) */}
      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-9 z-[60] w-[280px] max-h-72 overflow-auto overscroll-contain rounded-xl border border-white/10 bg-black/80 backdrop-blur p-1 shadow-2xl"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {EVM_CHAINS.map((c) => {
            const selected = c.id === value;
            const logo = chainLogoFor(c.id) || "";
            return (
              <li
                key={c.id}
                role="option"
                aria-selected={selected}
                tabIndex={0}
                onClick={() => {
                  onChange(c.id);
                  setOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onChange(c.id);
                    setOpen(false);
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    setOpen(false);
                  }
                }}
                className={`flex items-center gap-3 px-2 py-2 rounded cursor-pointer ${
                  selected ? "bg-white/15" : "hover:bg-white/10"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo}
                  alt={c.short}
                  width={20}
                  height={20}
                  style={{ display: "block", width: 20, height: 20, objectFit: "contain" }}
                  className="rounded-full border border-white/20 bg-white/5"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm leading-tight truncate">{c.name}</div>
                  <div className="text-[10px] opacity-70">ID: {c.id} • {c.short}</div>
                </div>
                {selected && (
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
