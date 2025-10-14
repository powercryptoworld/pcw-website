export default function Home() {
  return (
    <div className="relative mx-auto max-w-5xl px-6 py-16">
      {/* Hero */}
      <header className="mb-8">
        <h1 className="text-5xl font-semibold tracking-tight">PCW Swap</h1>
        <p className="mt-2 text-sm opacity-80">
          Simple, Solana-style swap interface. (Demo UI only — wire up your logic later.)
        </p>
      </header>

      {/* Glass Swap Card */}
      <section
        className="relative rounded-2xl overflow-hidden"
        style={{
          boxShadow:
            "0 12px 32px rgba(0,0,0,.10), inset 0 0 0 1px rgba(0,0,0,.08)",
          backdropFilter: "saturate(120%) blur(12px)",
          WebkitBackdropFilter: "saturate(120%) blur(12px)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,.70), rgba(255,255,255,.52))",
        }}
      >
        {/* neon edge stroke */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            padding: 1,
            background:
              "linear-gradient(90deg, rgba(20,241,149,.55), rgba(153,69,255,.55))",
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />

        <div className="relative p-6 md:p-8">
          {/* Network row */}
          <div className="mb-5 flex items-center justify-between text-sm">
            <div>
              <span className="opacity-60">Network:</span>{" "}
              <span className="font-medium">BNB</span>
            </div>
            <button className="ui-chip">Connect</button>
          </div>

          {/* You pay */}
          <div className="rounded-xl border border-black/10 dark:border-white/10 p-3 mb-4 bg-white/70 dark:bg-white/5 backdrop-blur">
            <div className="mb-2 text-sm opacity-70">You pay</div>
            <div className="flex items-center gap-3">
              <select className="ui-input">
                <option>BNB</option>
              </select>
              <input className="ui-input flex-1" placeholder="0.0" />
              <button className="ui-chip text-xs">MAX</button>
            </div>
          </div>

          {/* Arrow */}
          <div className="mx-auto my-2 flex h-8 w-8 items-center justify-center rounded-full border border-black/10 dark:border-white/10 text-sm opacity-70 bg-white/60 dark:bg-white/5 backdrop-blur">
            ↑
          </div>

          {/* You receive */}
          <div className="rounded-xl border border-black/10 dark:border-white/10 p-3 mb-5 bg-white/70 dark:bg-white/5 backdrop-blur">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="opacity-70">You receive</span>
              <span className="opacity-50">est.</span>
            </div>
            <div className="flex items-center gap-3">
              <select className="ui-input">
                <option>USDC</option>
              </select>
              <input className="ui-input flex-1" placeholder="0.0" />
            </div>
          </div>

          {/* Slippage */}
          <div className="mb-5">
            <div className="mb-2 text-sm opacity-70">Slippage</div>
            <div className="flex items-center gap-2">
              {["Slow", "Market", "Fast"].map((x) => (
                <button key={x} className="ui-chip">{x}</button>
              ))}
              <button className="ml-auto ui-chip">0.25%</button>
            </div>
          </div>

          {/* Swap button */}
          <button className="w-full btn-neon text-sm font-medium">Swap</button>
        </div>
      </section>

      {/* Footer spacing on small screens */}
      <div className="h-16" />
    </div>
  );
}
