// app/token-burning/page.tsx
export default function TokenBurningPage() {
  return (
    <>
      {/* Fixed hero image behind everything */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -6,
          backgroundImage: "url(/token-burning-hero.jpg)", // lives in /public
          backgroundSize: "cover",
          backgroundPosition: "center 45%",
          backgroundRepeat: "no-repeat",
          filter: "saturate(115%) brightness(0.95)",
          pointerEvents: "none",
        }}
      />

      {/* Reuse the neon overlay (same vibe as other pages) */}
      <div className="swap-vfx" aria-hidden />

      {/* Your existing content */}
      <section className="container pt-12 pb-28" aria-labelledby="burning-title">
        <header style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 id="burning-title" className="h1">Token Burning</h1>
          <p className="subtle">Transparent PCW burn schedule and history — coming soon.</p>
        </header>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            className="glass"
            role="region"
            aria-label="Token burning panel"
            style={{ width: "min(960px, 92vw)", padding: 18 }}
          >
            <p style={{ margin: "0 0 16px 0", color: "#cfe0ff" }}>
              This page will display upcoming burn events, executed burns, and their on-chain proofs.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div className="input" style={{ alignItems: "center" }}>
                <span style={{ fontSize: 14, color: "#b7c5e3" }}>Next burn window</span>
                <span style={{ marginLeft: "auto", fontWeight: 700, color: "#e8eef9" }}>TBA</span>
              </div>
              <div className="input" style={{ alignItems: "center" }}>
                <span style={{ fontSize: 14, color: "#b7c5e3" }}>Target amount</span>
                <span style={{ marginLeft: "auto", fontWeight: 700, color: "#e8eef9" }}>TBA</span>
              </div>
            </div>

            <div style={{ height: 12 }} />

            <button className="btn" style={{ width: "100%", padding: "12px 14px", fontWeight: 700 }}>
              View Burn History (soon)
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
