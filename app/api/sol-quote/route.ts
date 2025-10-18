import { NextResponse } from "next/server";
import { quoteSolToUsdc } from "@/lib/jupiter";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const amount = (searchParams.get("amount") || "").trim();
  if (!amount) return NextResponse.json({ error: "Provide ?amount=<SOL amount> (e.g., 0.1)" }, { status: 400 });
  try {
    const quote = await quoteSolToUsdc(amount);
    return NextResponse.json(quote, { status: quote.error ? 400 : 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
