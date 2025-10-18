import { parseEther } from "viem";

const ONEINCH_BASE = "https://api.1inch.dev/swap/v6.0";
const BSC_CHAIN_ID = 56;
const NATIVE_BNB = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const BSC_USDC = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";

type QuoteResponse = {
  src: string;
  dst: string;
  amount: string;
  dstAmount?: string;
  gas?: string | number;
  error?: string;
};

export async function quoteBnbToUsdc(amountInBnb: string): Promise<QuoteResponse> {
  if (!process.env.ONEINCH_KEY) {
    return { src: NATIVE_BNB, dst: BSC_USDC, amount: "0", error: "Missing ONEINCH_KEY in env" };
  }
  const amountWei = parseEther(amountInBnb).toString();

  const url = new URL(`${ONEINCH_BASE}/${BSC_CHAIN_ID}/quote`);
  url.searchParams.set("src", NATIVE_BNB);
  url.searchParams.set("dst", BSC_USDC);
  url.searchParams.set("amount", amountWei);
  url.searchParams.set("includeGas", "true");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${process.env.ONEINCH_KEY}` },
    cache: "no-store",
  });

  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  if (!res.ok) {
    return { src: NATIVE_BNB, dst: BSC_USDC, amount: amountWei, error: data?.description || String(text) };
  }

  return {
    src: NATIVE_BNB,
    dst: BSC_USDC,
    amount: amountWei,
    dstAmount: data?.dstAmount ?? data?.toTokenAmount,
    gas: data?.gas ?? data?.gasPrice,
  };
}
