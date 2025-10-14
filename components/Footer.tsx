import Link from "next/link";

const socials = [
  { label: "LinkedIn",      href: "https://www.linkedin.com/in/power-crypto-world-68b863255/" },
  { label: "Instagram",     href: "https://www.instagram.com/powercryptoworldpcw/" },
  { label: "TikTok",        href: "https://www.tiktok.com/@powercryptoworld" },
  { label: "GitHub",        href: "https://github.com/powercryptoworld" },
  { label: "Discord",       href: "https://discord.com/invite/ffvHRXJkdZ" },
  { label: "YouTube",       href: "https://www.youtube.com/channel/UC9D0upTQoiawh0JFMLREuIg" },
  { label: "Telegram",      href: "https://t.me/+A7Fp1xARJVtiZTYx" },
  { label: "Twitter",       href: "https://x.com/PCWcrypto" },
  { label: "Facebook",      href: "https://www.facebook.com/people/Power-Crypto/100075237947925/" },
  { label: "CoinMarketCap", href: "https://coinmarketcap.com/community/profile/PowerCryptoWorld/" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border/30">
      {/* glow line */}
      <div className="h-px w-full glow-line" />

      <div className="mx-auto max-w-6xl px-6 py-8 grid gap-6 md:grid-cols-2">
        {/* Left: social links */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {socials.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted hover:text-text transition hover:glow-shadow"
            >
              {s.label}
            </Link>
          ))}
        </div>

        {/* Right: Get connected + Contact */}
        <div className="text-left md:text-right">
          <h4 className="text-xs uppercase tracking-wider text-muted">Get connected</h4>
          <div className="mt-2">
            <Link
              href="/contact"
              className="inline-block rounded-lg border border-border px-4 py-2 text-sm hover:border-[var(--sol-green)] transition"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-8">
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} Power Crypto World. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
