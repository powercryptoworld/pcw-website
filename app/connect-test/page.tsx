"use client";

import ConnectWallet from "@/components/ConnectWallet";

export default function ConnectTestPage() {
  return (
    <section className="container mx-auto max-w-xl pt-16 pb-24">
      <h1 className="text-2xl font-semibold mb-6">Wallet Connect — Test Page</h1>
      <p className="mb-4 opacity-80">
        This page is isolated. Click the button to connect/disconnect your EVM wallet (MetaMask, etc.).
      </p>
      <ConnectWallet />
    </section>
  );
}
