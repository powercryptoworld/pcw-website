export type KnownToken = {
  chainId: number;
  address: string;   // lowercase 0x…
  symbol: string;
  name: string;
  logoURI?: string | null;
  decimals?: number | null;
};

// Local registry. We can add more entries later.
export const KNOWN_TOKENS: KnownToken[] = [
  {
    chainId: 56,
    address: "0x9370a51c9f2ae6b23719ab74f05261891c609a23", // PCW (BNB) — lowercased
    symbol: "PCW",
    name: "Power Crypto World",
    logoURI: "/token-fallback.svg",
    decimals: 18
  },
];

export function findKnownByAddress(addr: string, chainId?: number): KnownToken | undefined {
  const a = (addr || "").toLowerCase();
  if (chainId !== undefined) return KNOWN_TOKENS.find(t => t.chainId === chainId && t.address === a);
  return KNOWN_TOKENS.find(t => t.address === a);
}

export function findKnownByQuery(q: string, chainId?: number): KnownToken[] {
  const qq = (q || "").toLowerCase();
  return KNOWN_TOKENS.filter(t => {
    if (typeof chainId === "number" && t.chainId !== chainId) return false;
    return (t.symbol?.toLowerCase().includes(qq) || t.name?.toLowerCase().includes(qq));
  });
}
