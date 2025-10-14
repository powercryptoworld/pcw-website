import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SocialDock from "@/components/SocialDock";

export const metadata: Metadata = {
  title: "Power Crypto World",
  description: "PCW — minimal, fast, Solana-inspired.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Body hosts the Solana-style background and stacking context */}
      <body className="solana-radials relative text-foreground antialiased">
        {/* Background layers (stay under content) */}
        <div className="pointer-events-none absolute inset-0 z-0 solana-fog" aria-hidden />
        <div className="pointer-events-none absolute inset-0 z-0 solana-neon" aria-hidden />
        <div className="pointer-events-none absolute inset-0 z-0 vignette" aria-hidden />
        <div className="pointer-events-none absolute left-0 right-0 bottom-[88px] z-0 h-px glow-line" aria-hidden />

        {/* Content above backgrounds */}
        <div className="relative z-10 min-h-screen flex flex-col">
          <Nav />
          <main className="flex-1">{children}</main>

          {/* neutral stage behind footer so it never gets washed out */}
          <div className="footer-stage absolute inset-x-0 bottom-0 -z-10" aria-hidden />
          <Footer />
        </div>

        {/* Always-visible social/contact dock */}
        <SocialDock />
      </body>
    </html>
  );
}
