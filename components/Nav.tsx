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

  const headerStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 40,
    boxShadow: scrolled ? "0 1px 0 rgba(255,255,255,.08)" : "none",
  };

  const washStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background:
      "linear-gradient(90deg, rgba(20,241,149,0.18), transparent 30%, rgba(153,69,255,0.18))",
    opacity: 0.25,
  };

  const shellStyle: React.CSSProperties = {
    position: "relative",
    maxWidth: "1080px",
    margin: "0 auto",
    padding: "0 20px",
    backdropFilter: "saturate(120%) blur(12px)",
    WebkitBackdropFilter: "saturate(120%) blur(12px)",
  };

  const navStyle: React.CSSProperties = {
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    border: "1px solid var(--stroke)",
    borderTop: "none",
    borderLeft: "1px solid var(--stroke)",
    borderRight: "1px solid var(--stroke)",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    background:
      "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03))",
  };

  const brandStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "0 12px",
    color: "#e6efff",
    textDecoration: "none",
  };

  const dotStyle: React.CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: "#14f195",
    boxShadow: "0 0 8px rgba(20,241,149,0.6)",
  };

  const linksStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 2,
  };

  return (
    <header style={headerStyle}>
      <div style={washStyle} aria-hidden />
      <div style={shellStyle}>
        <nav style={navStyle} aria-label="Primary">
          {/* Left: logo */}
          <Link href="/" style={brandStyle}>
            <span style={dotStyle} />
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2 }}>
              PCW
            </span>
          </Link>

          {/* Right: links */}
          <div style={linksStyle}>
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    position: "relative",
                    padding: "8px 12px",
                    fontSize: 14,
                    color: "#dfe8ff",
                    opacity: active ? 1 : 0.85,
                    textDecoration: "none",
                  }}
                >
                  <span>{item.label}</span>
                  {/* active underline */}
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: 12,
                      right: 12,
                      bottom: 4,
                      height: 2,
                      borderRadius: 2,
                      background: active ? "#9945ff" : "transparent",
                      boxShadow: active
                        ? "0 0 10px rgba(153,69,255,0.6)"
                        : "none",
                      transition: "background .15s ease, box-shadow .15s ease",
                    }}
                  />
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
