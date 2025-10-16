// app/buy-pcw/page.tsx
import React from "react";
import Image from "next/image";

export default function BuyPCWPage() {
  return (
    <>
      {/* Fixed hero image behind everything */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -6, // same layering approach as Contact
          backgroundImage: "url(/buy-hero.jpg)", // <-- file in /public
          backgroundSize: "cover",
          backgroundPosition: "center 50%",
          backgroundRepeat: "no-repeat",
          filter: "saturate(115%) brightness(0.95)",
          pointerEvents: "none",
        }}
      />

      {/* Neon overlay beams/glow (defined below in globals.css) */}
      <div className="buy-vfx" aria-hidden />

      <section className="container pt-12 pb-28" aria-labelledby="buypcw-title">
        <header style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 id="buypcw-title" className="h1">Buy PCW</h1>
          <p className="subtle">Purchase PCW tokens — secure and fast.</p>
        </header>

        {/* Coin only — centered, no glass box */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Image
            src="/pcw-coin.png"
            alt="Power Crypto World coin"
            width={768}
            height={768}
            priority
            style={{
              width: "min(460px, 80vw)",
              height: "auto",
              display: "block",
              filter: "saturate(112%) brightness(1.02)",
            }}
          />
        </div>
      </section>
    </>
  );
}
