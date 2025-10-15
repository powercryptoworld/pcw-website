// components/ContactDock/index.tsx
"use client";

export default function ContactDock() {
  return (
    <aside
      aria-label="Contact"
      style={{
        position: "fixed",
        right: 24,   // mirrors socials left offset (24px)
        bottom: 24,  // aligns with the SECOND (bottom) row of socials
        zIndex: 40,
      }}
    >
      <a
        href="mailto:pcw@powercryptoworld.com"
        className="px-4 py-2 rounded-full"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          height: 36,
          border: "1px solid rgba(255,255,255,.12)",
          background: "rgba(255,255,255,.06)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          color: "#e5e7eb",
          textDecoration: "none",
          width: "max-content",
          lineHeight: 1,
        }}
      >
        Contact
      </a>
    </aside>
  );
}
