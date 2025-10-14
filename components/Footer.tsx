import Link from "next/link";

const socials = [
  { label: "LinkedIn",     href: "https://www.linkedin.com/in/power-crypto-world-68b863255/", icon: "/linkedin.svg" },
  { label: "Instagram",    href: "https://www.instagram.com/powercryptoworldpcw/",            icon: "/instagram.svg" },
  { label: "TikTok",       href: "https://www.tiktok.com/@powercryptoworld",                  icon: "/tiktok.svg" },
  { label: "GitHub",       href: "https://github.com/powercryptoworld",                       icon: "/github.svg" },
  { label: "Discord",      href: "https://discord.com/invite/ffvHRXJkdZ",                     icon: "/discord.svg" },
  { label: "YouTube",      href: "https://www.youtube.com/channel/UC9D0upTQoiawh0JFMLREuIg",  icon: "/youtube.svg" },
  { label: "Telegram",     href: "https://t.me/+A7Fp1xARJVtiZTYx",                            icon: "/telegram.svg" },
  { label: "Twitter (X)",  href: "https://x.com/PCWcrypto",                                   icon: "/x.svg" },
  { label: "Facebook",     href: "https://www.facebook.com/people/Power-Crypto/100075237947925/", icon: "/facebook.svg" },
  { label: "CoinMarketCap",href: "https://coinmarketcap.com/community/profile/PowerCryptoWorld/", icon: "/cmc.svg" },
];

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-black/10 dark:border-white/10">
      {/* thin glow line */}
      <div className="h-px w-full glow-line" />

      <div className="relative mx-auto max-w-6xl px-6 py-10">
        {/* SOLANA RIBBON behind icons */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-2 right-2 top-8 h-12 rounded-full blur"
          style={{
            background:
              "linear-gradient(90deg, color-mix(in oklab, var(--sol-green) 35%, transparent), transparent 40%, color-mix(in oklab, var(--sol-purple) 35%, transparent))",
          }}
        />

        {/* icons row */}
        <div className="flex flex-wrap items-center gap-4">
          {socials.map((s) => (
            <span
              key={s.label}
              className="inline-flex p-[2px] rounded-full bg-gradient-to-r from-[var(--sol-green)] to-[var(--sol-purple)]"
            >
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="group inline-flex h-10 w-10 items-center justify-center rounded-full
                           bg-white/90 dark:bg-white/12 backdrop-blur-md
                           ring-1 ring-black/10 dark:ring-white/20
                           transition shadow-sm hover:shadow-[0_0_24px_rgba(153,69,255,.25)]"
              >
                <img
                  src={s.icon}
                  alt=""
                  className="h-4 w-4 opacity-90 transition group-hover:opacity-100
                             dark:invert dark:brightness-110 dark:contrast-110"
                />
              </a>
            </span>
          ))}
        </div>

        {/* right column: contact */}
        <div className="mt-8 flex items-center justify-between gap-6 flex-wrap">
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            © {new Date().getFullYear()} Power Crypto World. All rights reserved.
          </div>

          <div className="text-right">
            <h4 className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              GET CONNECTED
            </h4>
            <div className="mt-2">
              <Link
                href="/contact"
                className="inline-block rounded-lg border border-border px-3 py-2 text-sm
                           text-neutral-600 dark:text-neutral-300
                           hover:text-foreground hover:border-[var(--sol-green)] transition"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
