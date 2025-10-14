import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Power Crypto World",
  description: "PCW — minimal, fast, Solana-inspired.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="solana-radials text-foreground antialiased">
        <div className="relative min-h-screen flex flex-col">
          {/* BG layers */}
          <div className="solana-fog" aria-hidden />
          <div className="solana-neon" aria-hidden />
          <div className="vignette" aria-hidden />

          {/* Subtle neon separator pinned above footer */}
          <div
            className="pointer-events-none absolute left-0 right-0 bottom-[88px] h-px glow-line"
            aria-hidden
          />

          <Nav />
          <main className="flex-1">{children}</main>

          {/* Footer neutralizer for readability */}
          <div className="footer-stage" aria-hidden />

          <Footer />
        </div>
      </body>
    </html>
  );
}
