"use client";
import React from "react";
import { useAccount } from "wagmi";
import { getMetaMaskProvider } from "../../lib/evm";

const BSC_SCAN_TX = (h: string) => `https://bscscan.com/tx/${h}`;
const toHex = (v: bigint) => ("0x" + v.toString(16));

export default function SwapSendTest() {
  const { address, isConnected } = useAccount();
  const [amountWei, setAmountWei] = React.useState("1000000000000000"); // 0.001 BNB
  const [slippage, setSlippage] = React.useState("0.5");
  const [building, setBuilding] = React.useState(false);
  const [tx, setTx] = React.useState<any>(null);
  const [err, setErr] = React.useState<string>("");
  const [sending, setSending] = React.useState(false);
  const [hash, setHash] = React.useState<string>("");

  async function buildTx() {
    setErr(""); setTx(null); setHash("");
    if (!address) { setErr("Connect wallet first"); return; }
    setBuilding(true);
    try {
      const url = `/api/oneinch-build-swap?from=${encodeURIComponent(address)}&amountWei=${encodeURIComponent(amountWei)}&slippage=${encodeURIComponent(slippage)}`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error || "Build failed");
      setTx(data.tx);
    } catch (e: any) {
      setErr(e?.message || "Network error");
    } finally { setBuilding(false); }
  }

  async function sendTx() {
    setErr(""); setHash("");
    if (!tx || !address) { setErr("No wallet or tx"); return; }

    try {
      const meta = getMetaMaskProvider();
      if (!meta?.request) { setErr("MetaMask not found. Disable Phantom for this site or set Default Wallet = Off."); return; }

      // Ensure BSC
      try { await meta.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x38" }] }); } catch {}

      setSending(true);
      const valueHex = toHex(BigInt(tx.value || "0"));
      const params = [{ from: address, to: tx.to, data: tx.data, value: valueHex }];
      const h: string = await meta.request({ method: "eth_sendTransaction", params });
      setHash(h);
    } catch (e: any) {
      setErr(e?.message || "Send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="container mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Send Swap Tx (BNB → USDC on BSC)</h1>

      <div className="grid gap-3">
        <label className="text-sm">Amount (wei of BNB)</label>
        <input value={amountWei} onChange={(e)=>setAmountWei(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2" />
        <label className="text-sm">Slippage (%)</label>
        <input value={slippage} onChange={(e)=>setSlippage(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2" />
        <button onClick={buildTx} disabled={!isConnected || building}
          className="rounded-lg px-4 py-2 border border-white/10 bg-white/10 hover:bg-white/20">
          {building ? "Building..." : "Build swap tx"}
        </button>
      </div>

      {tx && (
        <>
          <pre className="mt-4 whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-black/40 p-3 text-sm">
{JSON.stringify(tx, null, 2)}
          </pre>
          <button onClick={sendTx} disabled={sending}
            className="mt-3 rounded-lg px-4 py-2 border border-white/10 bg-white/10 hover:bg-white/20">
            {sending ? "Sending..." : "Send tx"}
          </button>
        </>
      )}

      {hash && (
        <p className="mt-4 text-green-400 text-sm">
          Sent! Tx: <a className="underline" href={BSC_SCAN_TX(hash)} target="_blank" rel="noreferrer">{hash}</a>
        </p>
      )}
      {err && <p className="mt-4 text-red-400 text-sm">Error: {err}</p>}
      <div className="mt-6 text-xs text-white/60">
        If Phantom still opens, in Phantom → Settings → Default wallet → set to Off (or “Disable on this site”).
      </div>
    </section>
  );
}
