// app/buy-pcw/page.tsx
import React from "react";

export default function BuyPCWPage() {
  return (
    <section className="container pt-12 pb-28" aria-labelledby="buypcw-title">
      <header style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 id="buypcw-title" className="h1">Buy PCW</h1>
        <p className="subtle">Purchase PCW tokens — secure and fast.</p>
      </header>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <div className="glass" role="region" aria-label="Buy PCW panel" style={{ width: "min(960px, 92vw)", padding: 18 }}>
          <p style={{ margin: 0, color: "#cfe0ff" }}>
            Coming soon. You’ll be able to buy PCW directly here.
          </p>
        </div>
      </div>
    </section>
  );
}
