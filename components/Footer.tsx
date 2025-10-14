"use client";
import Link from "next/link";
import {
  Linkedin, Instagram, Clapperboard, Github, Discord,
  Youtube, Send, Twitter, Facebook, CircleDollarSign
} from "lucide-react";

type Social = {
  label: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const socials: Social[] = [
  { label: "LinkedIn",     href: "https://www.linkedin.com/in/power-crypto-world-68b863255/", Icon: Linkedin },
  { label: "Instagram",    href: "https://www.instagram.com/powercryptoworldpcw/",            Icon: Instagram },
  { label: "TikTok",       href: "https://www.tiktok.com/@powercryptoworld",                  Icon: Clapperboard },
  { label: "GitHub",       href: "https://github.com/powercryptoworld",                       Icon: Github },
  { label: "Discord",      href: "https://discord.com/invite/ffvHRXJkdZ",                     Icon: Discord },
  { label: "YouTube",      href: "https://www.youtube.com/channel/UC9D0upTQoiawh0JFMLREuIg",  Icon: Youtube },
  { label: "Telegram",     href: "https://t.me/+A7Fp1xARJVtiZTYx",                            Icon: Send },
  { label: "Twitter (X)",  href: "https://x.com/PCWcrypto",                                   Icon: Twitter },
  { label: "Facebook",     href: "https://www.facebook.com/people/Power-Crypto/100075237947925/", Icon: Facebook },
  { label: "CoinMarketCap",href: "https://coinmarketcap.com/community/profile/PowerCryptoWorld/", Icon: CircleDollarSign },
];

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-black/10 dark:border-white/10">
      <div className="h-px w-full glow-line" />
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* ICONS + LOCAL RIBBON */}
        <div className="relative inline-flex flex-wrap items-center gap-4">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-2 rounded-full blur-xl"
            style={{
              background:
                "linear-gradient(90deg, color-mix(in oklab, var(--sol-green) 45%, transparent), transparent 35%, color-mix(in oklab, var(--sol-purple) 45%, transparent))",
              opacity: 0.6,
            }}
          />
          {socials.map(({ label, href, Icon }) => (
            <span
              key={label}
              className="inline-flex p-[2px] rounded-full bg-gradient-to-r from-[var(--sol-green)] to-[var(--sol-purple)]"
              title={label}
            >
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="group inline-flex h-10 w-10 items-center justify-center rounded-full
                           bg-white/90 dark:bg-white/10 backdrop-blur-md
                           ring-1 ring-black/10 dark:ring-white/15 transition
                           hover:ring-[var(--sol-green)] hover:shadow-[0_0_18px_rgba(153,69,255,.25)]"
              >
                <Icon className="h-4 w-4 opacity-90 transition group-hover:opacity-100 dark:invert dark:brightness-110 dark:contrast-110" />
              </a>
            </span>
          ))}
        </div>

        {/* Bottom row */}
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
                className="inline-block rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 text-sm
                           text-neutral-700 dark:text-neutral-300
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
