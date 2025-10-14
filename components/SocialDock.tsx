"use client";
import React from "react";

/* Minimal SVGs—clean, legible at 16px */
const ICON = (d: string) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d={d} />
  </svg>
);

const links = [
  // CoinMarketCap
  {
    label: "CoinMarketCap",
    href: "https://coinmarketcap.com/community/profile/PowerCryptoWorld/",
    icon: ICON("M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm0 3a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm0 3.2a3.8 3.8 0 1 0 .001 7.601A3.8 3.8 0 0 0 12 8.2z"),
  },
  // Facebook
  {
    label: "Facebook",
    href: "https://www.facebook.com/people/Power-Crypto/100075237947925/",
    icon: ICON("M13.5 22v-7h2.3l.4-3h-2.7V9.7c0-.9.25-1.5 1.6-1.5H16V5.4c-.28-.04-1.24-.12-2.36-.12-2.34 0-3.94 1.43-3.94 4.05V12H7v3h2.7v7h3.8z"),
  },
  // X / Twitter
  {
    label: "X",
    href: "https://x.com/PCWcrypto",
    icon: ICON("M3 3h5.9l4.1 6.1L17.8 3H21l-7.3 10.1L21 21h-5.9l-4.1-6.1L6.2 21H3l7.3-10.1L3 3z"),
  },
  // YouTube
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UC9D0upTQoiawh0JFMLREuIg",
    icon: ICON("M3 7.5A3.5 3.5 0 0 1 6.5 4h11A3.5 3.5 0 0 1 21 7.5v9A3.5 3.5 0 0 1 17.5 20h-11A3.5 3.5 0 0 1 3 16.5v-9zm7 2.2v4.6L16 12l-6-2.3z"),
  },
  // Discord
  {
    label: "Discord",
    href: "https://discord.com/invite/ffvHRXJkdZ",
    icon: ICON("M7 6c-.9.2-1.7.5-2.5.9C3.5 9 3 11 3 13.1 3 17 6 19 6 19l.6-1.9c.8.3 1.7.6 2.4.7l.3-.9c-1.2-.4-2.3-1.1-3.1-2 .6.4 1.4.7 2.2.9 1.8.4 3.6.4 5.4 0 .8-.2 1.5-.5 2.2-.9-.9.9-2 1.6-3.2 2l.3.9c.8-.1 1.6-.3 2.4-.7l.6 1.9s3-2 3-5.9c0-2.1-.5-4.1-1.6-6.2-.8-.4-1.6-.7-2.5-.9l-.6 1.4c-1-.2-2-.3-3-.3s-2 .1-3 .3L7 6z"),
  },
  // GitHub
  {
    label: "GitHub",
    href: "https://github.com/powercryptoworld",
    icon: ICON("M12 .5a11.5 11.5 0 0 0-3.64 22.42c.58.11.79-.25.79-.56v-2.01c-3.2.7-3.88-1.37-3.88-1.37-.53-1.36-1.28-1.72-1.28-1.72-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.97.1-.74.4-1.25.73-1.54-2.56-.3-5.25-1.28-5.25-5.7 0-1.26.45-2.3 1.2-3.11-.12-.3-.52-1.52.11-3.16 0 0 .98-.31 3.22 1.19a11.17 11.17 0 0 1 5.86 0c2.24-1.5 3.22-1.19 3.22-1.19.63 1.64.23 2.86.11 3.16.75.81 1.2 1.85 1.2 3.11 0 4.43-2.7 5.39-5.28 5.68.41.35.78 1.05.78 2.12v3.14c0 .31.2.68.8.56A11.5 11.5 0 0 0 12 .5z"),
  },
  // TikTok
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@powercryptoworld",
    icon: ICON("M14 3h2.1c.2 1.3 1.1 2.2 2.6 2.4V8c-1.5-.1-2.7-.6-3.6-1.3v6.1A4.8 4.8 0 1 1 9.2 8.2V10c-.9.2-1.6 1-1.6 2a2.8 2.8 0 1 0 5.6 0V3z"),
  },
  // LinkedIn
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/power-crypto-world-68b863255/",
    icon: ICON("M4 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H4zm3.5 7H6v8h1.5v-8zM6.75 6.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zM13 10c-1.3 0-2 .9-2 1.7V10H9.5v8H11v-4.1c0-.9.5-1.4 1.2-1.4.7 0 1.3.5 1.3 1.4V18H15v-4.5C15 11 14 10 13 10z"),
  },
];

export default function SocialDock() {
  return (
    <aside className="social-dock" role="complementary" aria-label="Social links">
      {links.map((l) => (
        <a
          key={l.label}
          className="dock"
          href={l.href}
          target="_blank"
          rel="noreferrer"
          aria-label={l.label}
          title={l.label}
        >
          {l.icon}
        </a>
      ))}
    </aside>
  );
}
