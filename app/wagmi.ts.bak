'use client';

import { http, createConfig } from 'wagmi';
import { mainnet, bsc, polygon, base, arbitrum, optimism } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || '';

const chains = [mainnet, bsc, polygon, base, arbitrum, optimism] as const;

const transports = {
  [mainnet.id]: http(),
  [bsc.id]: http(),
  [polygon.id]: http(),
  [base.id]: http(),
  [arbitrum.id]: http(),
  [optimism.id]: http(),
} as const;

export const wagmiConfig = createConfig({
  chains,
  transports,
  connectors: [
    injected(),
    walletConnect({ projectId, showQrModal: false }),
  ],
});
