"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Glassy, Solana-style top nav with active underline */
export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const LinkItem = ({ href, label }: { href: string; label: string }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className="relative px-3 py-2 text-sm transition hover:opacity-100 opacity-85"
      >
        <span>{label}</span>
        <span
          className={`absolute left-3 right-3 -bottom-[2px] h-[2px] rounded
            ${active ? "bg-[var(--sol-purple)]" : "bg-transparent"}`}
        />
      </Link>
    );
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-shadow ${
        scrolled ? "shadow-[0_1px_0_0_rgba(0,0,0,0.08)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.08)]" : ""
      }`}
    >
      {/* soft color wash behind glass */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, color-mix(in oklab, var(--sol-green) 18%, transparent), transparent 30%, color-mix(in oklab, var(--sol-purple) 18%, transparent))",
          opacity: 0.25,
        }}
      />
      <div
        className="relative mx-auto max-w-6xl px-5"
        style={{
          backdropFilter: "saturate(120%) blur(12px)",
          WebkitBackdropFilter: "saturate(120%) blur(12px)",
        }}
      >
        <nav className="flex h-14 items-center justify-between rounded-b-2xl border-x border-b border-black/10 dark:border-white/10 bg-white/55 dark:bg-white/5">
          {/* Left: logo */}
          <Link href="/" className="flex items-center gap-2 px-3">
            <span className="h-2 w-2 rounded-full bg-[var(--sol-green)] shadow-[0_0_8px_rgba(20,241,149,0.6)]" />
            <span className="text-sm font-medium tracking-tight">PCW</span>
          </Link>

          {/* Right: links */}
          <div className="flex items-center">
            <LinkItem href="/" label="Swap" />
            <LinkItem href="/buy-pcw" label="Buy PCW" />
            <LinkItem href="/nfts" label="NFTs" />
            <LinkItem href="/giveaway" label="Giveaway" />
            <LinkItem href="/token-burning" label="Token Burning" />
          </div>
        </nav>
      </div>
    </header>
  );
}
