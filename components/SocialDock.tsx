"use client";

/**
 * Bottom-left socials + bottom-right Contact (with "GET CONNECTED" label).
 * Always visible on every page. Works in light/dark and on mobile/desktop.
 */
const LINKS: [label: string, icon: string, href: string][] = [
  ["LinkedIn","/linkedin.svg","https://www.linkedin.com/in/power-crypto-world-68b863255/"],
  ["Instagram","/instagram.svg","https://www.instagram.com/powercryptoworldpcw/"],
  ["TikTok","/tiktok.svg","https://www.tiktok.com/@powercryptoworld"],
  ["GitHub","/github.svg","https://github.com/powercryptoworld"],
  ["Discord","/discord.svg","https://discord.com/invite/ffvHRXJkdZ"],
  ["YouTube","/youtube.svg","https://www.youtube.com/channel/UC9D0upTQoiawh0JFMLREuIg"],
  ["Telegram","/telegram.svg","https://t.me/+A7Fp1xARJVtiZTYx"],
  ["X","/x.svg","https://x.com/PCWcrypto"],
  ["Facebook","/facebook.svg","https://www.facebook.com/people/Power-Crypto/100075237947925/"],
  ["CoinMarketCap","/cmc.svg","https://coinmarketcap.com/community/profile/PowerCryptoWorld/"],
];

export default function SocialDock() {
  return (
    <>
      {/* Bottom-left: icon-only socials */}
      <aside
        className="fixed z-50 left-4 bottom-4 sm:left-6 sm:bottom-6"
        aria-label="Social links"
      >
        <div className="flex flex-wrap gap-2 rounded-full border border-black/10 dark:border-white/15 bg-white/90 dark:bg-neutral-900/70 backdrop-blur-md shadow-sm px-2 py-2">
          {LINKS.map(([label, icon, href]) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={label}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-black/10 dark:ring-white/15 bg-white/95 dark:bg-white/10 hover:ring-[var(--sol-green)] transition"
            >
              <img
                src={icon}
                alt=""
                className="h-4 w-4 opacity-90 dark:invert dark:brightness-110 dark:contrast-110"
                onError={(e)=>((e.target as HTMLImageElement).style.display="none")}
              />
            </a>
          ))}
        </div>
      </aside>

      {/* Bottom-right: label + Contact button */}
      <aside
        className="fixed z-50 right-4 bottom-4 sm:right-6 sm:bottom-6 text-right select-none"
        aria-label="Get connected contact"
      >
        <div className="inline-flex flex-col items-end gap-2">
          <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
            GET CONNECTED
          </span>
          <a
            href="/contact"
            className="inline-block rounded-full px-3 py-1.5 text-sm font-medium border border-black/10 dark:border-white/15 text-neutral-800 dark:text-neutral-100 bg-white/95 dark:bg-white/10 hover:border-[var(--sol-green)] hover:text-foreground transition backdrop-blur"
          >
            Contact
          </a>
        </div>
      </aside>
    </>
  );
}
