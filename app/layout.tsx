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
          {/* Soft pastel fog (subtle in light) */}
          <div className="solana-fog" aria-hidden />
          {/* Extra neon punch (only shows in dark) */}
          <div className="solana-neon dark:block hidden" aria-hidden />

          {/* Thin neon separator pinned above footer */}
          <div
            className="pointer-events-none absolute left-0 right-0 bottom-[72px] h-px glow-line"
            aria-hidden
          />

          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
