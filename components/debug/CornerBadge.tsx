"use client";

import { useEffect } from "react";

/** Tiny floating badge to prove our layout-mounted client scripts are running */
export default function CornerBadge() {
  useEffect(() => {
    // @ts-ignore
    (window as any)._pcwLogoScriptsMounted = true;
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        right: 8,
        bottom: 8,
        fontSize: 11,
        padding: "4px 6px",
        borderRadius: 6,
        background: "rgba(0,0,0,0.45)",
        color: "#9FF",
        zIndex: 999999,
        pointerEvents: "none",
        backdropFilter: "blur(4px)",
      }}
    >
      logo-scripts: ON
    </div>
  );
}
