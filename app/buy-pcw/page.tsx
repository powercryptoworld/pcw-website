// app/buy-pcw/page.tsx
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
          zIndex: -6,
          backgroundImage: "url(/buy-hero.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center 50%",
          backgroundRepeat: "no-repeat",
          filter: "saturate(115%) brightness(0.95)",
          pointerEvents: "none",
        }}
      />

      {/* Neon overlay beams/glow */}
      <div className="buy-vfx" aria-hidden />

      <section className="container pt-12 pb-28" aria-labelledby="buypcw-title">
        <header style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 id="buypcw-title" className="h1">
            Buy PCW
          </h1>
        </header>

        {/* Coin + caption */}
        <div style={{ display: "grid", placeItems: "center", gap: 12 }}>
          <div className="coin-wrap">
            <Image
              src="/pcw-coin.png"
              alt="Power Crypto World coin"
              width={768}
              height={768}
              priority
              className="coin-img"
              style={{ width: "min(460px, 80vw)", height: "auto", display: "block" }}
            />
          </div>

          <p
            style={{
              textAlign: "center",
              margin: 0,
              marginTop: 4,
              fontSize: 14,
              color: "#cfe1ff",
              letterSpacing: 0.3,
            }}
          >
            PCW/BNB —{" "}
            <span
              style={{
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                background: "rgba(255,255,255,.06)",
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid rgba(220,235,255,.12)",
                userSelect: "all",
              }}
            >
              0x9370a51C9F2Ae6B23719ab74f05261891C609A23
            </span>
          </p>
        </div>
      </section>
    </>
  );
}
