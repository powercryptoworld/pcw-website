import Link from "next/link";

const socials = [
  { label: "LinkedIn", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "TikTok", href: "#" },
  { label: "GitHub", href: "#" },
  { label: "Discord", href: "#" },
  { label: "YouTube", href: "#" },
  { label: "Telegram", href: "#" },
  { label: "Twitter", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "CoinMarketCap", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border">
      {/* Solana-style glow line */}
      <div className="h-px w-full glow-line" />

      <div className="mx-auto max-w-6xl px-6 py-8 grid gap-6 md:grid-cols-2">
        {/* Left: Logos/Links list */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted hover:text-text hover:glow-shadow transition"
              aria-label={s.label}
              title={s.label}
            >
              {s.label}
            </a>
          ))}
        </div>

        {/* Right: Get connected + Contact */}
        <div className="text-left md:text-right">
          <h4 className="text-xs uppercase tracking-wider text-muted">Get connected</h4>
          <div className="mt-2">
            <Link
              className="inline-block rounded-lg border border-border px-3 py-2 text-sm text-muted hover:text-text hover:border-[var(--sol-green)] transition"
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
