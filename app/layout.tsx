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
    // NOTE: do NOT force "dark" here — that was making everything black.
    <html lang="en">
      <body className="bg-bg text-text antialiased">
        {/* Background layers */}
        <div className="min-h-screen flex flex-col relative">
          {/* Light-mode pastel fog */}
          <div className="pointer-events-none absolute inset-0 solana-fog" aria-hidden />

          {/* Dark-mode neon rays (only visible when system is dark) */}
          <div className="pointer-events-none absolute inset-0 dark:solana-neon" aria-hidden />

          {/* Thin glow line pinned to footer area */}
          <div className="pointer-events-none absolute left-0 right-0 bottom-[72px] h-px glow-line" aria-hidden />

          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
