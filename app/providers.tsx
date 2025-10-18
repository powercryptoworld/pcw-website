"use client";

import { PropsWithChildren, useState } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, bsc, polygon, base, arbitrum, optimism } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";
import { createWeb3Modal } from "@web3modal/wagmi/react";

// --- memory-only storage so wagmi won't auto-reconnect on reload ---
const memoryStorage = {
  getItem: (_: string) => null,
  setItem: (_: string, __: string) => {},
  removeItem: (_: string) => {}
};

const PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID!;

// Build wagmi config
export const wagmiConfig = createConfig({
  autoConnect: false, // don't connect on load
  storage: { ...memoryStorage } as any,
  chains: [mainnet, bsc, polygon, base, arbitrum, optimism],
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
    [polygon.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
  connectors: [
    // Browser extensions (MetaMask, Brave, Coinbase Ext, etc.)
    injected({ shimDisconnect: true }),

    // WalletConnect (enables QR + "All Wallets" directory in Web3Modal)
    walletConnect({
      projectId: PROJECT_ID,
      showQrModal: false, // Web3Modal handles the QR UI
    }),

    // Optional: Coinbase Wallet app connector
    coinbaseWallet({
      appName: "Power Crypto World",
    }),
  ],
});

// Wire Web3Modal (WalletConnect UI) one time
createWeb3Modal({
  wagmiConfig,
  projectId: PROJECT_ID,
  enableAnalytics: false,
  themeMode: "dark",
  themeVariables: {
    "--w3m-font-family":
      "Sora, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial",
  },
});

export default function Providers({ children }: PropsWithChildren) {
  const [qc] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
