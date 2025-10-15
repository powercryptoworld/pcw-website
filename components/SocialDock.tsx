// components/SocialDock.tsx
"use client";

import { useState } from "react";

type Social = { label: string; href: string; icon: string };

const socials: Social[] = [
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

const row1 = socials.slice(0, 5);
const row2 = socials.slice(5); // rest

export default function SocialDock() {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      aria-label="PCW social links"
      style={{
        position: "fixed",
        left: 24,
        bottom: 24,
        zIndex: 40,
      }}
    >
      <div style={{ display: "grid", gap: 8 }}>
        {/* Row 1 — always visible, plus/minus toggle at the end */}
        <nav className="dock" aria-label="Social links main row" style={{ width: "max-content" }}>
          {row1.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              title={s.label}
            >
              <img src={s.icon} alt={s.label} width={18} height={18} />
            </a>
          ))}

          {/* Toggle button */}
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-label={expanded ? "Hide more socials" : "Show more socials"}
            title={expanded ? "Hide" : "More"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,.12)",
              background: "rgba(255,255,255,.06)",
              color: "#e5e7eb",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1, marginTop: -2 }}>
              {expanded ? "−" : "+"}
            </span>
          </button>
        </nav>

        {/* Row 2 — only shows when expanded */}
        {expanded && row2.length > 0 && (
          <nav className="dock" aria-label="Social links more row" style={{ width: "max-content" }}>
            {row2.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                title={s.label}
              >
                <img src={s.icon} alt={s.label} width={18} height={18} />
              </a>
            ))}
          </nav>
        )}
      </div>
    </aside>
  );
}
