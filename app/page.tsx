import React from "react";
import SocialDock from "./components/SocialDock";
import ContactDock from "./components/ContactDock";
import SwapCard from "./components/SwapCard";

export default function Page() {
  return (
    <main className="page-pad">
      {/* vignette layer */}
      <div id="pcw-vignette" aria-hidden />

      <div className="container">
        {/* Title */}
        <header aria-labelledby="pcw-title" className="mb-5">
          <h1 id="pcw-title" className="h1">PCW Swap</h1>
          <p className="subtle">
            Simple, Solana-style swap interface.{" "}
            <span className="text-muted">(Demo UI only — wire up your logic later.)</span>
          </p>
        </header>

        {/* TOP TABS (outside the card, like a site nav) */}
        <nav className="tabs" aria-label="Primary">
          <a className="pill pill-active" href="/">Swap</a>
          <a className="pill" href="/buy-pcw">Buy PCW</a>
          <a className="pill" href="/nfts">NFTs</a>
          <a className="pill" href="/giveaway">Giveaway</a>
          <a className="pill" href="/token-burning">Token Burning</a>
        </nav>

        {/* Glass swap card */}
        <section className="glass mx-auto">
          <SwapCard />
        </section>

        {/* Footer line */}
        <p className="text-xs text-muted mt-6">
          © {new Date().getFullYear()} Power Crypto World. All rights reserved.
        </p>
      </div>

      {/* Bottom docks */}
      <SocialDock />
      <ContactDock />
    </main>
  );
}
