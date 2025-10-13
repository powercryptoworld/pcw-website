import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border">
      {/* Thin gradient line for Solana vibe */}
      <div
        className="h-px w-full"
        style={{ background: "linear-gradient(90deg, var(--accent), transparent, var(--accent-2))" }}
      />
      <div className="mx-auto max-w-6xl px-6 py-8 grid gap-6 md:grid-cols-2">
        {/* Left: Socials */}
        <div className="flex items-center gap-4">
          <a className="text-muted hover:text-text hover:drop-shadow-[0_0_6px_var(--color-accent-soft)] transition" href="#" aria-label="X / Twitter">X</a>
          <a className="text-muted hover:text-text hover:drop-shadow-[0_0_6px_var(--color-accent-soft)] transition" href="#" aria-label="Telegram">TG</a>
          <a className="text-muted hover:text-text hover:drop-shadow-[0_0_6px_var(--color-accent-soft)] transition" href="#" aria-label="GitHub">GH</a>
        </div>

        {/* Right: Get connected + Contact */}
        <div className="text-left md:text-right">
          <h4 className="text-xs uppercase tracking-wider text-muted">Get connected</h4>
          <div className="mt-2">
            <Link
              className="inline-block rounded-lg border border-border px-3 py-2 text-sm text-muted hover:text-text hover:border-accent transition"
              href="/contact"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-8">
        <p className="text-xs text-muted">© {new Date().getFullYear()} Power Crypto World. All rights reserved.</p>
      </div>
    </footer>
  );
}
