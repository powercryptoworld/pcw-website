// app/nfts/page.tsx
import React from "react";

export default function NFTsPage() {
  return (
    <section className="container pt-12 pb-28" aria-labelledby="nfts-title">
      <header style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 id="nfts-title" className="h1">NFTs</h1>
        <p className="subtle">Showcase and mint PCW NFTs — coming soon.</p>
      </header>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          className="glass"
          role="region"
          aria-label="NFTs panel"
          style={{ width: "min(960px, 92vw)", padding: 18 }}
        >
          <p style={{ margin: 0, color: "#cfe0ff" }}>
            We’re preparing a curated NFT experience with a Solana-style gallery and mint flow.
            Stay tuned.
          </p>
        </div>
      </div>
    </section>
  );
}
