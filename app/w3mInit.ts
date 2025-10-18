"use client";
import "@web3modal/polyfills";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { wagmiConfig } from "./providers";
import { mainnet, bsc, polygon, base, arbitrum, optimism } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "";

if (typeof window !== "undefined" && projectId) {
  const g = window as any;
  if (!g.__pcw_w3m_inited) {
    createWeb3Modal({
      wagmiConfig,
      projectId,
      chains: [mainnet, bsc, polygon, base, arbitrum, optimism],
      enableAnalytics: false,
      themeMode: "dark",
      themeVariables: { "--w3m-accent": "#7c3aed" },
    });
    g.__pcw_w3m_inited = true;
  }
}
