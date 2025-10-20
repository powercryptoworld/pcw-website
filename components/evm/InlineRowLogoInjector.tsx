"use client";
import { useEffect } from "react";

/**
 * InlineRowLogoInjector (null-safe, immediate scan)
 * Priority:
 *   1) /token-logos/{chainId}/{addr}.png
 *   2) /token-logos/{chainId}/{addr}.svg
 *   3) CDNs (Pancake, 1inch, DexScreener, TrustWallet)
 *   4) /api/evm-logo?chainId=..&address=..
 */
type Props = { chainId: number; address?: string | null };

function trustWalletChain(chainId: number) {
  switch (chainId) {
    case 1: return "ethereum";
    case 56: return "smartchain";
    case 137: return "polygon";
    case 43114: return "avalanchec";
    case 250: return "fantom";
    case 42161: return "arbitrum";
    case 10: return "optimism";
    case 8453: return "base";
    default: return "";
  }
}
function chainSlug(chainId: number): string | null {
  switch (chainId) {
    case 1: return "ethereum";
    case 56: return "bsc";
    case 137: return "polygon";
    case 250: return "fantom";
    case 43114: return "avalanche";
    case 42161: return "arbitrum";
    case 10: return "optimism";
    case 8453: return "base";
    default: return null;
  }
}

function buildSources(chainId: number, addrLc: string) {
  const tw = trustWalletChain(chainId);
  const slug = chainSlug(chainId);

  const localPng = `/token-logos/${chainId}/${addrLc}.png`;
  const localSvg = `/token-logos/${chainId}/${addrLc}.svg`;

  const cdns: string[] = [];
  // Pancake
  cdns.push(`https://assets.pancakeswap.finance/web/tokens/${addrLc}.png`);
  cdns.push(`https://assets.pancakeswap.finance/web/${addrLc}.png`);
  cdns.push(`https://assets.pancakeswap.finance/images/tokens/${addrLc}.png`);
  // 1inch
  cdns.push(`https://tokens.1inch.io/${addrLc}.png`);
  // DexScreener
  if (slug) {
    cdns.push(`https://cdn.dexscreener.com/token-images/${slug}/${addrLc}.png`);
    cdns.push(`https://cdn.dexscreener.com/token-icons/${slug}/${addrLc}.png`);
  }
  // TrustWallet
  if (tw) {
    cdns.push(`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${tw}/assets/${addrLc}/logo.png`);
    cdns.push(`https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/${tw}/assets/${addrLc}/logo.png`);
  }

  const api = `/api/evm-logo?chainId=${chainId}&address=${addrLc}`;
  return [localPng, localSvg, ...cdns, api];
}

function injectInto(target: HTMLImageElement, sources: string[]) {
  if (!target || target.dataset.injected === "1") return;
  target.dataset.injected = "1";
  let i = 0;
  const tryNext = () => {
    if (i >= sources.length) return;
    const url = sources[i++];
    const probe = new Image();
    probe.onload = () => { target.src = url; };
    probe.onerror = tryNext;
    probe.crossOrigin = "anonymous";
    probe.src = url;
  };
  tryNext();
}

export default function InlineRowLogoInjector({ chainId, address }: Props) {
  useEffect(() => {
    // Guard first render: address may be undefined/null
    const raw = (address ?? "").toString().trim();
    if (!/^0x[0-9a-fA-F]{40}$/.test(raw)) return;
    const addrLc = raw.toLowerCase();
    const sources = buildSources(chainId, addrLc);

    // 1) Immediate pass for existing rows
    document
      .querySelectorAll('img[data-evm-row-logo]')
      .forEach((el) => injectInto(el as HTMLImageElement, sources));

    // 2) Observe future rows
    const observer = new MutationObserver((mut) => {
      for (const m of mut) {
        m.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          const target = n.querySelector?.('img[data-evm-row-logo]') as HTMLImageElement | null;
          if (target) injectInto(target, sources);
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [chainId, address]);

  return null;
}
