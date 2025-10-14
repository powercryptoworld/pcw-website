"use client";
import Link from "next/link";
import { useState } from "react";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const Item = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link className="text-sm text-muted hover:text-text transition" href={href}>
      {children}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-bg/70">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ background: "var(--sol-green)" }} />
          <span className="font-semibold tracking-tight">PCW</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Item href="/">Swap</Item>
          <Item href="/buy-pcw">Buy PCW</Item>
          <Item href="/nfts">NFTs</Item>
          <Item href="/giveaway">Giveaway</Item>
          <Item href="/token-burning">Token Burning</Item>
        </nav>

        <button
          className="md:hidden rounded-xl border border-border px-3 py-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >☰</button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border">
          <div className="px-6 py-3 grid gap-3">
            <Item href="/">Swap</Item>
            <Item href="/buy-pcw">Buy PCW</Item>
            <Item href="/nfts">NFTs</Item>
            <Item href="/giveaway">Giveaway</Item>
            <Item href="/token-burning">Token Burning</Item>
          </div>
        </div>
      )}
    </header>
  );
}
