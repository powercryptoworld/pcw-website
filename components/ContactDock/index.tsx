"use client";

import React from "react";
import { useRouter } from "next/navigation";
import tabStyles from "../NavTabs.module.css"; // reuse the exact tab styles

export default function ContactDock() {
  const router = useRouter();

  // Make the glow follow the cursor (same as tabs)
  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  // Navigate without showing bottom-left URL preview
  const onClick = () => router.push("/contact");

  // Optional: highlight when on /contact
  const isActive =
    typeof window !== "undefined" && window.location.pathname.startsWith("/contact");

  return (
    <aside
      aria-label="Contact"
      style={{ position: "fixed", right: 24, bottom: 24, zIndex: 40 }}
    >
      <button
        type="button"
        onMouseMove={onMove}
        onClick={onClick}
        className={[tabStyles.tab, isActive ? tabStyles.active : ""].join(" ")}
        aria-label="Contact"
      >
        Contact
      </button>
    </aside>
  );
}
