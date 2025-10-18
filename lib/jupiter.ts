const JUP_PRICE = "https://price.jup.ag/v6/quote";
const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

type JupQuote = {
  inputMint: string;
  outputMint: string;
  inAmount: string;   // lamports
  outAmount?: string; // atomic USDC
  error?: string;
};

export async function quoteSolToUsdc(amountSol: string): Promise<JupQuote> {
  // Convert "0.1" SOL -> lamports (1e9)
  const [whole, frac = ""] = amountSol.split(".");
  const fracPadded = (frac + "000000000").slice(0, 9);
  const lamports = (BigInt(whole || "0") * 1000000000n + BigInt(fracPadded)).toString();

  const url = new URL(JUP_PRICE);
  url.searchParams.set("inputMint", SOL_MINT);
  url.searchParams.set("outputMint", USDC_MINT);
  url.searchParams.set("amount", lamports);
  url.searchParams.set("slippageBps", "50");

  const res = await fetch(url.toString(), { cache: "no-store" });
  const text = await res.text();
  let data: any; try { data = JSON.parse(text); } catch { data = { raw: text }; }

  if (!res.ok || data?.error) {
    return { inputMint: SOL_MINT, outputMint: USDC_MINT, inAmount: lamports, error: data?.error || text };
  }
  return { inputMint: SOL_MINT, outputMint: USDC_MINT, inAmount: lamports, outAmount: data?.outAmount };
}
