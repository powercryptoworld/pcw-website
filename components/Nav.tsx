"use client";
import Link from "next/link";
import { useState } from "react";

export default function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-bg/70">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ background: "var(--accent)" }} />
          <span className="font-semibold tracking-tight">PCW</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link className="text-sm text-muted hover:text-text transition" href="/">Home</Link>
          <Link className="text-sm text-muted hover:text-text transition" href="/buy-pcw">Buy PCW</Link>
        </nav>

        <button
          className="md:hidden rounded-xl border border-border px-3 py-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border">
          <div className="px-6 py-3 grid gap-3">
            <Link className="text-sm text-muted hover:text-text transition" href="/" onClick={() => setOpen(false)}>Home</Link>
            <Link className="text-sm text-muted hover:text-text transition" href="/buy-pcw" onClick={() => setOpen(false)}>Buy PCW</Link>
          </div>
        </div>
      )}
    </header>
  );
}
