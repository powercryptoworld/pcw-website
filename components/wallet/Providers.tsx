"use client";

import "@rainbow-me/rainbowkit/styles.css";
import React from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import {
  mainnet, bsc, polygon, arbitrum, optimism, base, avalanche,
  fantom, gnosis, celo
} from "wagmi/chains";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const config = createConfig(getDefaultConfig({
  appName: "PCW",
  projectId: "pcw-temp-local", // can be any string for local/dev
  chains: [mainnet, bsc, polygon, arbitrum, optimism, base, avalanche, fantom, gnosis, celo],
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
    [avalanche.id]: http(),
    [fantom.id]: http(),
    [gnosis.id]: http(),
    [celo.id]: http(),
  },
}));

const qc = new QueryClient();

export default function WalletProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={qc}>
        <RainbowKitProvider modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
