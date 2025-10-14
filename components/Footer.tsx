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
    // Strong z-index and its own backdrop so it can’t be “lost”
    <footer className="relative z-20 border-t border-black/10 dark:border-white/10">
      {/* Dedicated footer background for contrast */}
      <div className="absolute inset-0 -z-10 bg-white/92 dark:bg-neutral-950/70 backdrop-blur-md" />

      {/* thin glow line */}
      <div className="h-px w-full glow-line" />

      <div className="mx-auto max-w-6xl px-6 py-10 grid gap-6 md:grid-cols-2">
        {/* BIG, CLEAR SOCIALS */}
        <div className="flex items-center gap-3 md:gap-4 flex-wrap">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              title={s.label}
              className="group inline-flex h-12 w-12 items-center justify-center rounded-full
                         bg-white dark:bg-white/12
                         ring-1 ring-black/10 dark:ring-white/20
                         hover:ring-[var(--sol-green)] transition shadow-sm"
            >
              <img
                src={s.icon}
                alt=""
                className="h-5 w-5 opacity-90 transition group-hover:opacity-100
                           dark:invert dark:brightness-110 dark:contrast-110"
              />
            </a>
          ))}
        </div>

        {/* Right: contact */}
        <div className="text-left md:text-right">
          <h4 className="text-xs uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
            GET CONNECTED
          </h4>
          <div className="mt-2">
            <Link
              href="/contact"
              className="inline-block rounded-lg border border-border px-3 py-2 text-sm
                         text-neutral-700 dark:text-neutral-300
                         hover:text-foreground hover:border-[var(--sol-green)] transition"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-8">
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          © {new Date().getFullYear()} Power Crypto World. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
