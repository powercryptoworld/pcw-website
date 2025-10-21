"use client";

import React from "react";
import { useAccount, useDisconnect } from "wagmi";

// Allow the custom element <w3m-connect-button /> in TSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "w3m-connect-button": any;
    }
  }
}

function shortAddr(addr?: `0x${string}`) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  if (!isConnected) {
    // Plain connect button from Web3Modal (no balance, no chain icon)
    return <w3m-connect-button />;
  }

  // Connected: show ONLY the short address + Disconnect
  return (
    <div className="flex items-center gap-2">
      <span className="px-2 py-1 text-xs rounded border border-white/20 bg-white/10">
        {shortAddr(address)}
      </span>
      <button
        onClick={() => disconnect()}
        className="px-2 py-1 text-xs rounded border border-white/20 bg-white/10 hover:bg-white/20"
      >
        Disconnect
      </button>
    </div>
  );
}
