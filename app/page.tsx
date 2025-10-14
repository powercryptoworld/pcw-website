"use client";

export default function SwapHome() {
  return (
    <section className="relative gradient-hero">
      <div className="relative mx-auto max-w-5xl px-6 py-16 md:py-24">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">PCW Swap</h1>
        <p className="mt-3 text-muted max-w-2xl">
          Simple, Solana-style swap interface. (Demo UI only — wire up your logic later.)
        </p>

        <div className="mt-10 grid place-items-center">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-elev/60 backdrop-blur p-6 shadow-xl">
            {/* Network / Wallet row (placeholder) */}
            <div className="flex items-center justify-between text-sm text-muted">
              <span>Network: <strong className="text-text">BNB</strong></span>
              <button className="rounded-lg border border-border px-3 py-1 hover:border-[var(--sol-green)] transition">Connect</button>
            </div>

            {/* Pay card */}
            <div className="mt-5 rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">You pay</span>
                <button className="text-xs rounded-lg border border-border px-2 py-1 hover:border-[var(--sol-green)] transition">MAX</button>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <select className="rounded-lg bg-elev border border-border px-3 py-2 outline-none focus:border-[var(--sol-green)]">
                  <option>BNB</option>
                  <option>SOL</option>
                  <option>USDC</option>
                </select>
                <input
                  className="flex-1 rounded-lg bg-elev border border-border px-3 py-2 outline-none focus:border-[var(--sol-green)]"
                  placeholder="0.0"
                />
              </div>
            </div>

            {/* Swap arrow */}
            <div className="my-4 grid place-items-center">
              <div className="h-9 w-9 grid place-items-center rounded-full border border-border">↕</div>
            </div>

            {/* Receive card */}
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">You receive</span>
                <span className="text-xs text-muted">est.</span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <select className="rounded-lg bg-elev border border-border px-3 py-2 outline-none focus:border-[var(--sol-green)]">
                  <option>USDC</option>
                  <option>SOL</option>
                  <option>BNB</option>
                </select>
                <input
                  className="flex-1 rounded-lg bg-elev border border-border px-3 py-2 outline-none focus:border-[var(--sol-green)]"
                  placeholder="0.0"
                />
              </div>
            </div>

            {/* Slippage row (display only) */}
            <div className="mt-4 flex items-center justify-between text-sm text-muted">
              <span>Slippage</span>
              <div className="flex gap-2">
                <span className="rounded-full bg-elev border border-border px-3 py-1">Slow</span>
                <span className="rounded-full bg-elev border border-border px-3 py-1">Market</span>
                <span className="rounded-full bg-elev border border-border px-3 py-1">Fast</span>
                <span className="rounded-full bg-elev border border-border px-3 py-1">0.25%</span>
              </div>
            </div>

            {/* Swap button with Solana gradient */}
            <button
              className="mt-5 w-full rounded-xl py-3 text-bg font-medium transition glow-shadow"
              style={{ background: "linear-gradient(90deg, var(--sol-green), var(--sol-purple))" }}
              onClick={(e) => e.preventDefault()}
            >
              Swap
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
