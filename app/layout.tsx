// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

// components live in /components (root)
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import SocialDock from "../components/SocialDock";
import ContactDock from "../components/ContactDock";

export const metadata: Metadata = {
  title: "PCW – Swap",
  description: "Power Crypto World",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
        <Footer />
        <SocialDock />
        <ContactDock />
      </body>
    </html>
  );
}
