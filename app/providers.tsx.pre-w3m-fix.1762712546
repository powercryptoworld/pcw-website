'use client';

import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig, queryClient } from './wagmi';
import AppKitInitializer from './appkit';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitInitializer />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
