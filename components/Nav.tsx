"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Item = { href: string; label: string };

const NAV: Item[] = [
  { href: "/", label: "Swap" },
  { href: "/buy-pcw", label: "Buy PCW" },
  { href: "/nfts", label: "NFTs" },
  { href: "/giveaway", label: "Giveaway" },
  { href: "/token-burning", label: "Token Burning" },
];

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        paddingTop: 10,
      }}
    >
      {/* pill group on the top-right */}
      <nav
        aria-label="Primary"
        style={{
          margin: "0 auto",
          maxWidth: 1200,
          padding: "0 16px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 6,
            padding: 6,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,.12)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03))",
            backdropFilter: "saturate(125%) blur(10px)",
            WebkitBackdropFilter: "saturate(125%) blur(10px)",
            boxShadow: scrolled
              ? "0 6px 24px rgba(0,0,0,.32)"
              : "0 10px 30px rgba(0,0,0,.22)",
          }}
        >
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  position: "relative",
                  padding: "8px 14px",
                  borderRadius: 999,
                  fontSize: 13.5,
                  letterSpacing: 0.1,
                  color: "#e6f0ff",
                  textDecoration: "none",
                  border: "1px solid rgba(255,255,255,.10)",
                  background: active
                    ? "linear-gradient(180deg, rgba(153,69,255,.22), rgba(20,241,149,.18))"
                    : "rgba(255,255,255,.04)",
                }}
              >
                {item.label}
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: 10,
                    right: 10,
                    bottom: 6,
                    height: 2,
                    borderRadius: 2,
                    background: active ? "#9b5cff" : "transparent",
                    boxShadow: active ? "0 0 10px rgba(155,92,255,.7)" : "none",
                  }}
                />
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
