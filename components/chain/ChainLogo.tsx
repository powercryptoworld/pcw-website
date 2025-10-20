"use client";

import React, { useMemo, useState } from "react";

/**
 * Renders a chain logo from /public/chains/<chainId>.svg (or .png) with a nice fallback badge.
 * Usage: <ChainLogo chainId={56} name="BNB Chain" size={18} />
 */
export default function ChainLogo({
  chainId,
  name,
  size = 18,
  className = "",
}: {
  chainId: number;
  name?: string;
  size?: number;
  className?: string;
}) {
  const [ext, setExt] = useState<".svg" | ".png">(".svg");
  const [failed, setFailed] = useState(false);

  const label = useMemo(() => {
    if (name && name.trim().length > 0) {
      // try to form a short badge like "ETH", "BSC", "ARB", else first 3 letters
      const up = name.toUpperCase();
      if (/\bETH(EREUM)?\b/.test(up)) return "ETH";
      if (/\bB(NB|SC)\b|BNB CHAIN/.test(up)) return "BSC";
      if (/\bARBITRUM\b/.test(up)) return "ARB";
      if (/\bOPTIMISM\b/.test(up)) return "OP";
      if (/\bPOLYGON\b/.test(up)) return "POLY";
      if (/\bAVALANCHE\b/.test(up)) return "AVAX";
      if (/\bFANTOM\b/.test(up)) return "FTM";
      if (/\bGNOSIS\b/.test(up)) return "GNO";
      if (/\bBASE\b/.test(up)) return "BASE";
      if (/\bZKSYNC\b/.test(up)) return "ZKS";
      if (/\bLINEA\b/.test(up)) return "LINEA";
      if (/\bSCROLL\b/.test(up)) return "SCRL";
      if (/\bBLAST\b/.test(up)) return "BLAST";
      if (/\bCELO\b/.test(up)) return "CELO";
      if (/\bMOONBEAM\b/.test(up)) return "GLMR";
      return up.replace(/[^A-Z0-9]/g, "").slice(0, 3) || String(chainId);
    }
    return String(chainId);
  }, [name, chainId]);

  if (failed) {
    // Fallback badge (deterministic hue by chainId)
    const hue = (chainId * 37) % 360;
    const bg = `hsl(${hue} 70% 45% / 0.22)`;
    const border = `hsl(${hue} 70% 60% / 0.45)`;
    const fg = `#fff`;

    return (
      <span
        className={[
          "inline-flex select-none items-center justify-center rounded-md border text-[10px] font-semibold",
          className,
        ].join(" ")}
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          lineHeight: `${size - 2}px`,
          background: bg,
          color: fg,
          borderColor: border,
          boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
        }}
        title={name ? `${name} (${chainId})` : `Chain ${chainId}`}
      >
        {label}
      </span>
    );
  }

  const src = `/chains/${chainId}${ext}`;

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={name ? `${name} logo` : `Chain ${chainId} logo`}
      className={["rounded-sm", className].join(" ")}
      onError={() => {
        if (ext === ".svg") setExt(".png");
        else setFailed(true);
      }}
      title={name ? `${name} (${chainId})` : `Chain ${chainId}`}
      draggable={false}
    />
  );
}
