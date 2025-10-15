// components/Nav.tsx
import Link from "next/link";
import Image from "next/image";

const LOGO_SIZE = 34; // Solana-like brand size (try 34–38 if you want bigger)

const links = [
  { href: "/", label: "Swap" },
  { href: "/buy-pcw", label: "Buy PCW" },
  { href: "/nfts", label: "NFTs" },
  { href: "/giveaway", label: "Giveaways" },
  { href: "/token-burning", label: "Token Burning" },
];

export default function Nav() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid rgba(255,255,255,.06)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        background: "linear-gradient(180deg, rgba(12,16,24,.72), rgba(12,16,24,.45))",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 10px",
          width: "100%",
        }}
      >
        {/* LEFT: Solana-style brand (no pill, larger mark + uppercase wordmark) */}
        <Link
          href="/"
          aria-label="Power Crypto World — Home"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            color: "white",
            textDecoration: "none",
            lineHeight: 1,
          }}
        >
          <span
            style={{
              position: "relative",
              width: LOGO_SIZE,
              height: LOGO_SIZE,
              display: "inline-block",
              borderRadius: 8,
              overflow: "hidden",
              filter: "drop-shadow(0 0 10px rgba(153,69,255,.45))",
            }}
          >
            <Image
              src="/pcw-logo.png" // change to .jpg if needed
              alt="PCW logo"
              fill
              sizes={`${LOGO_SIZE}px`}
              style={{ objectFit: "contain" }}
              priority
            />
          </span>

          <span
            style={{
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: ".08em",
              fontSize: 18,
              opacity: 0.96,
            }}
          >
            Power Crypto World
          </span>
        </Link>

        {/* RIGHT: tabs (unchanged) */}
        <nav aria-label="Primary">
          <ul
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              listStyle: "none",
              margin: 0,
              padding: 0,
            }}
          >
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="pill"
                  style={{
                    textDecoration: "none",
                    fontWeight: 600,
                    padding: ".5rem .9rem",
                  }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
