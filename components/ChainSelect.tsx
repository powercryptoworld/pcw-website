"use client";
import React from "react";
import { EVM_CHAINS } from "@/lib/chains";
import { chainLogoFor } from "@/lib/chainLogos";

type Props = { value: number; onChange: (v: number) => void; };

export function ChainSelect({ value, onChange }: Props) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  const chain = EVM_CHAINS.find((c) => c.id === value);

  // Click-outside to close
  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const fallbackBadge = (short: string) => {
    const svg = encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'>
         <circle cx='12' cy='12' r='12' fill='#1e293b'/>
         <text x='12' y='15' font-size='8' text-anchor='middle' fill='white'
           font-family='Arial, Helvetica, sans-serif'>${(short || "").slice(0,4)}</text>
       </svg>`
    );
    return `data:image/svg+xml;charset=utf-8,${svg}`;
  };

  const currentLogo = chain
    ? chainLogoFor(chain.id) || fallbackBadge(chain.short)
    : fallbackBadge("CH");

  return (
    <div ref={rootRef} className="relative inline-flex items-center gap-2">
      {/* Button that opens the list (logo INSIDE the pill) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-1.5 min-w-[120px] chain-pill text-sm font-semibold flex items-center justify-between gap-2 text-white ring-2 ring-cyan-400/80 ring-offset-2 ring-offset-black/40 transition-all"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          {/* Logo on the left, inside the pill */}
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-white/30 bg-white/5 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentLogo}
              alt={chain?.short || "CH"}
              width={24}
              height={24}
              style={{ display: "block", width: 24, height: 24, objectFit: "contain" }}
            />
          </span>
          <span className="truncate">
            {chain ? `${chain.name}` : "Select chain"}
          </span>
        </span>
        <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M5 7l5 6 5-6H5z" fill="currentColor" />
        </svg>
      </button>

      {/* Listbox */}
      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-2 w-[280px] max-h-72 overflow-auto rounded-xl border border-white/10 bg-black/80 backdrop-blur p-1 shadow-lg"
        >
          {EVM_CHAINS.map((c) => {
            const logo = chainLogoFor(c.id) || fallbackBadge(c.short);
            const selected = c.id === value;
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
                className={`flex items-center gap-3 px-2 py-1 rounded cursor-pointer ${
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
                </div>
                {selected && (
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M20 6L9 17l-5-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
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
