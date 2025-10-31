"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./NavTabs.module.css";

const LOGO_SIZE = 28;

const links = [
  { href: "/", label: "Swap" },
  { href: "/buy-pcw", label: "Buy PCW" },
  { href: "/roadmap", label: "Roadmap" }, // <— renamed from NFTs
  { href: "/giveaway", label: "Giveaways" },
  { href: "/token-burning", label: "Token Burning" },
];

export default function Nav() {
  const router = useRouter();
  const [path, setPath] = React.useState<string>("/");
  React.useEffect(() => setPath(window.location.pathname || "/"), []);

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid rgba(255,255,255,.06)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        background: "linear-gradient(180deg, rgba(12,16,24,.72), rgba(12,16,24,.45))",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 10px",
          width: "100%",
        }}
      >
        {/* Brand */}
        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label="Power Crypto World — Home"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: "transparent",
            border: "none",
            padding: 0,
            margin: 0,
            cursor: "pointer",
            color: "#e8eef9",
          }}
        >
          <span
            style={{
              position: "relative",
              width: LOGO_SIZE,
              height: LOGO_SIZE,
              display: "inline-block",
            }}
          >
            <Image
              src="/pcw-logo.png"
              alt="PCW logo"
              fill
              sizes={`${LOGO_SIZE}px`}
              style={{ objectFit: "contain" }}
              priority
            />
          </span>
          <span
            style={{
              fontFamily: "Sora, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: ".08em",
              fontSize: 16.5,
              opacity: 0.98,
            }}
          >
            Power Crypto World
          </span>
        </button>

        {/* Tabs */}
        <nav aria-label="Primary">
          <div className={styles.row}>
            {links.map((l) => {
              const active =
                path === l.href || (l.href !== "/" && path.startsWith(l.href));
              return (
                <button
                  key={l.href}
                  type="button"
                  onClick={() => router.push(l.href)}
                  onMouseMove={handleMove}
                  className={[styles.tab, active ? styles.active : ""].join(" ")}
                >
                  {l.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
