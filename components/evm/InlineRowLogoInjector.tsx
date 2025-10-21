"use client";
import React from "react";

type Props = {
  address?: string;
  chainId?: number;
  symbol?: string;
  name?: string;
  logoURI?: string | null;
  size?: number;
  className?: string;
};

/**
 * Renders a token logo for EVM rows.
 * Priority:
 * 1) logoURI (from API)
 * 2) Fallback: simple initials circle
 */
export default function InlineRowLogoInjector({
  address,
  symbol,
  name,
  logoURI,
  size = 32,
  className,
}: Props) {
  const label = (symbol || name || "T").trim();
  const initials =
    (label.split(/\s+/).map(w => w[0]).join("").slice(0, 3) || "T").toUpperCase();

  if (logoURI && /^https?:\/\//i.test(logoURI)) {
    return (
      <img
        src={logoURI}
        alt={symbol || name || address || "token"}
        width={size}
        height={size}
        className={["rounded-full object-cover", className || ""].join(" ")}
        style={{ width: size, height: size }}
        onError={(e) => {
          // hide broken images; show fallback text bubble
          const el = e.currentTarget;
          el.style.display = "none";
        }}
      />
    );
  }

  // Fallback: simple circle with initials
  return (
    <div
      className={["rounded-full grid place-items-center", className || ""].join(" ")}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.floor(size * 0.45)),
        background:
          "linear-gradient(135deg, rgba(124,58,237,.35), rgba(0,200,255,.28))",
        border: "1px solid rgba(255,255,255,.15)",
        color: "white",
      }}
      title={symbol || name || address || "token"}
    >
      {initials}
    </div>
  );
}
