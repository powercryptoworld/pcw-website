declare global { interface Window { ethereum?: any; } }

export function getMetaMaskProvider(): any | null {
  const eth = (typeof window !== "undefined" ? (window as any).ethereum : undefined);
  if (!eth) return null;
  if (eth.isMetaMask) return eth;
  const providers = eth.providers || [];
  const meta = providers.find((p: any) => p?.isMetaMask) || null;
  return meta || null;
}
