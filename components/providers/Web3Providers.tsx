"use client";

import "@rainbow-me/rainbowkit/styles.css";
import React from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import EVM_CHAINS from "@/lib/chains"; // uses your existing 21-chain list

const transports = Object.fromEntries(
  (EVM_CHAINS as any[]).map((c) => [c.id, http(c.rpcUrls.default.http[0])])
);

const config = createConfig({
  chains: EVM_CHAINS as any,
  transports,
  connectors: [injected()],
  ssr: true,
  multiInjectedProviderDiscovery: true,
});

const queryClient = new QueryClient();

export default function Web3Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
