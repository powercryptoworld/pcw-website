// app/page.tsx — SWAP page with hero background + glow overlay
import SwapCard from "../components/SwapCard";

export default function Page() {
  return (
    <>
      {/* Fixed hero image behind everything */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -6,
          backgroundImage: "url(/swap-hero.jpg)", // file in /public
          backgroundSize: "cover",
          backgroundPosition: "center 55%",
          backgroundRepeat: "no-repeat",
          filter: "saturate(115%) brightness(0.95)",
          pointerEvents: "none",
        }}
      />

      {/* Neon overlay (styled in globals.css as .swap-vfx) */}
      <div className="swap-vfx" aria-hidden />

      {/* Swap UI card */}
      <SwapCard />
    </>
  );
}
