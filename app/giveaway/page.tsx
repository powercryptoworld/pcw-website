// app/giveaway/page.tsx
export default function GiveawayPage() {
  return (
    <>
      {/* Fixed hero image behind everything */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -6,
          backgroundImage: "url(/giveaway-hero.jpg)", // file lives in /public
          backgroundSize: "cover",
          backgroundPosition: "center 45%",
          backgroundRepeat: "no-repeat",
          filter: "saturate(115%) brightness(0.95)",
          pointerEvents: "none",
        }}
      />

      {/* Reuse the neon overlay (same vibe as swap/roadmap) */}
      <div className="swap-vfx" aria-hidden />

      {/* Your existing content (unchanged) */}
      <section className="container pt-12 pb-28" aria-labelledby="giveaway-title">
        <header style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 id="giveaway-title" className="h1">Giveaway</h1>
          <p className="subtle">Enter PCW community giveaways — transparent and fair.</p>
        </header>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            className="glass"
            role="region"
            aria-label="Giveaway panel"
            style={{ width: "min(960px, 92vw)", padding: 18 }}
          >
            <p style={{ margin: "0 0 16px 0", color: "#cfe0ff" }}>
              Giveaways will open here soon. You’ll be able to connect your wallet and join with one click.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div className="input" style={{ alignItems: "center" }}>
                <span style={{ fontSize: 14, color: "#b7c5e3" }}>Upcoming prize pool</span>
                <span style={{ marginLeft: "auto", fontWeight: 700, color: "#e8eef9" }}>TBA</span>
              </div>
              <div className="input" style={{ alignItems: "center" }}>
                <span style={{ fontSize: 14, color: "#b7c5e3" }}>Start date</span>
                <span style={{ marginLeft: "auto", fontWeight: 700, color: "#e8eef9" }}>TBA</span>
              </div>
            </div>

            <div style={{ height: 12 }} />

            <button className="btn" style={{ width: "100%", padding: "12px 14px", fontWeight: 700 }}>
              Connect to Join (soon)
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
