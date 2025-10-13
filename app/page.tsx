export default function HomePage() {
  return (
    <section className="relative">
      <div
        className="absolute inset-0 blur-3xl opacity-50 pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(40rem 20rem at 20% 0%, var(--color-accent)/0.15, transparent 60%), radial-gradient(30rem 18rem at 80% 20%, var(--color-accent-2)/0.12, transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-5xl px-6 py-20 md:py-28">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">Power Crypto World</h1>
        <p className="mt-5 text-lg md:text-xl text-muted">
          A minimal, fast website inspired by Solana’s clean, dark aesthetic—built with Next.js + Tailwind.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href="/buy-pcw"
            className="rounded-xl px-5 py-3 bg-accent hover:bg-accent/90 transition shadow-[0_0_20px_var(--color-accent-soft)]"
          >
            Buy PCW
          </a>
          <a
            href="/contact"
            className="rounded-xl px-5 py-3 border border-border hover:border-accent hover:text-text transition"
          >
            Contact
          </a>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border p-5 hover:border-accent/60 transition">
            <h3 className="text-xl font-medium">Fast</h3>
            <p className="mt-2 text-sm text-muted">Next.js App Router + edge-ready design.</p>
          </div>
          <div className="rounded-2xl border border-border p-5 hover:border-accent/60 transition">
            <h3 className="text-xl font-medium">Minimal</h3>
            <p className="mt-2 text-sm text-muted">Clean, focused, neon accents.</p>
          </div>
          <div className="rounded-2xl border border-border p-5 hover:border-accent/60 transition">
            <h3 className="text-xl font-medium">Responsive</h3>
            <p className="mt-2 text-sm text-muted">Looks great on any device.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
