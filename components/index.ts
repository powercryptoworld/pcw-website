// components/ContactDock/index.tsx
"use client";

import Link from "next/link";

export default function ContactDock() {
  return (
    <aside
      aria-label="Get connected"
      style={{
        position: "fixed",
        right: 24,                                // mirror of socials left
        bottom: "calc(24px + 36px + 8px)",        // align with SOCIALS TOP ROW
        zIndex: 40,
      }}
    >
      <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
        <Link
          href="/contact"
          className="px-4 py-2 rounded-full"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(255,255,255,.06)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            color: "#e5e7eb",
            textDecoration: "none",
            width: "max-content",
          }}
        >
          Get connected
        </Link>

        <a
          href="mailto:pcw@powercryptoworld.com"
          className="px-4 py-2 rounded-full"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(255,255,255,.06)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            color: "#e5e7eb",
            textDecoration: "none",
            width: "max-content",
          }}
        >
          Contact
        </a>
      </div>
    </aside>
  );
}
