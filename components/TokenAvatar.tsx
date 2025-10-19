"use client";
import * as React from "react";

export function TokenAvatar(props: {
  size?: number;
  symbol?: string;
  name?: string;
  logoURI?: string | null;
  className?: string;
}) {
  const { size = 28, symbol = "", name = "", logoURI, className = "" } = props;
  const label = (symbol || name || "?").slice(0, 3).toUpperCase();

  if (logoURI) {
    return (
      <img
        src={logoURI}
        alt={symbol || name || "token"}
        width={size}
        height={size}
        className={`rounded-full object-cover border border-white/10 ${className}`}
        onError={(e) => {
          // hide broken images gracefully
          const el = e.currentTarget as HTMLImageElement;
          el.style.display = "none";
        }}
      />
    );
  }

  // Fallback: soft radial badge with initials
  const px = `${size}px`;
  return (
    <div
      style={{
        width: px,
        height: px,
        borderRadius: "9999px",
        background:
          "radial-gradient(120% 120% at 20% 20%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 35%, rgba(0,0,0,0.35) 100%)",
      }}
      className={`grid place-items-center border border-white/10 ${className}`}
      aria-label={symbol || name || "token"}
      title={symbol || name || "token"}
    >
      <span className="text-[10px] leading-none opacity-90">{label}</span>
    </div>
  );
}
