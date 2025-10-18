"use client";

import React from "react";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";

function short(addr?: `0x${string}`) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();

  // Avoid hydration mismatch
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const label = !mounted ? "" : isConnected ? short(address) : "Connect Wallet";

  return (
    <button
      type="button"
      onClick={() => open()}
      className="rounded-2xl px-4 py-2 text-sm backdrop-blur bg-white/10 hover:bg-white/20 transition shadow-md"
      aria-live="polite"
    >
      {label}
    </button>
  );
}
