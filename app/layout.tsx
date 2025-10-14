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
    <html lang="en">
      {/* DO NOT force dark here; we want light base by default */}
      <body className="text-text antialiased">
        {/* Solana glow wrapper applied to the whole page */}
        <div className="solana-radials min-h-screen flex flex-col">
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
