'use client';

import React from 'react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { mainnet, bsc, polygon, base, arbitrum, optimism } from 'wagmi/chains';
import { wagmiConfig } from './wagmi';

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || '';

export default function AppKitInitializer() {
  React.useEffect(() => {
    if (!projectId) return;
    if (typeof window === 'undefined') return;
    if ((window as any).__pcw_w3m_inited) return;

    createWeb3Modal({
      wagmiConfig,
      projectId,
      chains: [mainnet, bsc, polygon, base, arbitrum, optimism],
      enableAnalytics: false,
      themeMode: 'dark',
      themeVariables: { '--w3m-accent': '#7c3aed' }
    });

    (window as any).__pcw_w3m_inited = true;
  }, []);

  return null;
}
