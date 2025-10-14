import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Power Crypto World",
  description: "PCW — minimal, fast, Solana-inspired.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Do NOT force dark; keep system pref. Light stays default.
    <html lang="en">
      {/* Apply the Solana nebula directly to body */}
      <body className="solana-radials text-foreground antialiased">
        <div className="relative min-h-screen flex flex-col">
          {/* BG layers */}
          <div className="solana-fog" aria-hidden />
          <div className="solana-neon" aria-hidden />
          {/* Soft vignette (declared in CSS but rendered as a node) */}
          <div className="vignette" aria-hidden />

          {/* Thin neon separator pinned above footer */}
          <div
            className="pointer-events-none absolute left-0 right-0 bottom-[88px] h-px glow-line"
            aria-hidden
          />

          {/* Content */}
          <Nav />
          <main className="flex-1">{children}</main>

          {/* Footer-protection stage: neutrals the BG so icons stay readable */}
          <div className="footer-stage" aria-hidden />

          <Footer />
        </div>
      </body>
    </html>
  );
}
