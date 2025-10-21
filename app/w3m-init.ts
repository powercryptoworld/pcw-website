'use client';
import '@web3modal/polyfills';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { mainnet, bsc, polygon, base, arbitrum, optimism } from 'wagmi/chains';
import { wagmiConfig } from './wagmi';

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || '';

if (typeof window !== 'undefined' && projectId && !(window as any).__pcw_w3m_inited) {
  createWeb3Modal({
    wagmiConfig,
    projectId,
    chains: [mainnet, bsc, polygon, base, arbitrum, optimism],
    enableAnalytics: false,
    themeMode: 'dark',
    themeVariables: { '--w3m-accent': '#7c3aed' }
  });
  (window as any).__pcw_w3m_inited = true;
}
