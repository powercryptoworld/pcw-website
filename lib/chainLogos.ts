/**
 * Lightweight SVG data-URIs for major EVM chains.
 * Neutral dev-friendly marks (not official brand assets).
 */
const enc = (svg: string) =>
  `data:image/svg+xml;utf8,${svg.replace(/\s+/g," ").replace(/#/g,"%23")}`;

const circle = (bg: string, inner?: string) => enc(
  `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='12' fill='${bg}'/>${inner||""}</svg>`
);
const ring = (bg: string, fg: string) => enc(
  `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='12' fill='${bg}'/><circle cx='12' cy='12' r='6.5' fill='none' stroke='${fg}' stroke-width='3'/></svg>`
);
const bar = (bg: string, fg: string) => enc(
  `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='12' fill='${bg}'/><rect x='6' y='11' width='12' height='2' rx='1' fill='${fg}'/></svg>`
);
const diamond = (bg: string, fg: string) => enc(
  `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><rect x='4' y='4' width='16' height='16' transform='rotate(45 12 12)' fill='${fg}'/><circle cx='12' cy='12' r='11.5' fill='none' stroke='${bg}' stroke-width='1'/></svg>`
);
const tri = (bg: string, fg: string) => enc(
  `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='12' fill='${bg}'/><path d='M12 6 L18 16 H6 Z' fill='${fg}'/></svg>`
);

export const CHAIN_LOGOS: Record<number, string> = {
  1: ring("#0b1220", "#ffffff"),                                // Ethereum
  56: circle("#0f172a","<rect x='8' y='8' width='8' height='8' rx='2' fill='%23f5d90a'/>"), // BNB
  137: tri("#1b1034", "#9b5cff"),                               // Polygon
  42161: diamond("#0b1220", "#7cc4ff"),                         // Arbitrum
  10: circle("#b91c1c","<circle cx='12' cy='12' r='5' fill='white'/>"), // Optimism
  8453: enc("<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%23DDE7FF'/><stop offset='100%' stop-color='%232D63FF'/></linearGradient></defs><circle cx='12' cy='12' r='12' fill='url(%23g)'/><circle cx='12' cy='12' r='6' fill='white'/><rect x='6.5' y='11' width='11' height='2' rx='1' fill='%232D63FF'/></svg>"), // Base
  43114: tri("#7f1d1d", "#ffffff"),                             // Avalanche
  250: ring("#0b1220", "#60a5fa"),                              // Fantom
  100: circle("#052e2b","<circle cx='12' cy='12' r='5' fill='%234ef0c8'/>"), // Gnosis
  324: diamond("#0b1220", "#ffffff"),                           // zkSync Era
  59144: bar("#0b1220", "#60a5fa"),                             // Linea
  534352: circle("#111827","<rect x='8' y='8' width='8' height='8' rx='2' fill='%23facc15'/>"), // Scroll
  81457: ring("#111827", "#facc15"),                            // Blast
  42220: circle("#1a2e05","<circle cx='12' cy='12' r='5' fill='%23eab308'/>"), // Celo
  1284: circle("#0b1020","<circle cx='12' cy='12' r='5' fill='%23ff52d1'/>"), // Moonbeam
  5000: ring("#0b1220","#9efc7f"),                              // Mantle
  7777777: diamond("#0b1220","#ffffff"),                        // Zora
  480: circle("#111827","<rect x='8' y='8' width='8' height='8' rx='2' fill='%235eead4'/>"),  // World
};
export function chainLogoFor(chainId: number): string | null { return CHAIN_LOGOS[chainId] || null; }
