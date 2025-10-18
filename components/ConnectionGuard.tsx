"use client";

import { useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";

/**
 * Disconnect on load unless the user explicitly chose to connect.
 * We store an opt-in flag in localStorage: "pcw_opt_in_connect" = "1"
 */
export default function ConnectionGuard() {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    const optedIn = typeof window !== "undefined" && localStorage.getItem("pcw_opt_in_connect") === "1";
    if (!optedIn && isConnected) {
      disconnect();
    }
  }, [isConnected, disconnect]);

  return null;
}
