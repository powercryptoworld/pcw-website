export type SolMintMeta = {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string | null;
  chainFamily: "solana";
};

const RPCS = [
  "https://rpc.ankr.com/solana",
  "https://api.mainnet-beta.solana.com",
];

function cleanAddr(s: string) {
  return (s || "")
    .replace(/\u200B|\u200C|\u200D/g, "") // zero-width
    .replace(/\u2026/g, "")               // ellipsis …
    .trim();
}

async function rpcCall<T = any>(rpc: string, method: string, params: any[]): Promise<T> {
  const res = await fetch(rpc, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (json?.error) throw new Error(json.error?.message || "solana rpc failed");
  return json.result as T;
}

async function tryAll<T>(fn: (rpc: string) => Promise<T>): Promise<T> {
  let last: any;
  for (const rpc of RPCS) {
    try { return await fn(rpc); } catch (e) { last = e; }
  }
  throw last || new Error("All Solana RPCs failed");
}

/**
 * Accepts either a mint OR a token-account address.
 * We derive decimals from (in order):
 *  1) getTokenSupply(address)
 *  2) getAccountInfo(jsonParsed) -> mint.info.decimals or account.info.tokenAmount.decimals
 *  3) getTokenAccountBalance(address).value.decimals
 */
export async function fetchSolMintMeta(addr: string): Promise<SolMintMeta | null> {
  const address = cleanAddr(addr);

  // 1) getTokenSupply
  try {
    const sup = await tryAll<{ value: { decimals?: number } }>((rpc) =>
      rpcCall(rpc, "getTokenSupply", [address]),
    );
    const d = Number(sup?.value?.decimals);
    if (Number.isFinite(d)) {
      return {
        mint: address,
        symbol: "UNKNOWN",
        name: "Unknown Solana Token",
        decimals: d,
        logoURI: null,
        chainFamily: "solana",
      };
    }
  } catch {}

  // 2) getAccountInfo (jsonParsed)
  try {
    const info = await tryAll<any>((rpc) =>
      rpcCall(rpc, "getAccountInfo", [address, { encoding: "jsonParsed" }]),
    );
    const parsed = info?.value?.data?.parsed;
    let d = NaN;
    if (parsed?.type === "mint") d = Number(parsed?.info?.decimals);
    else if (parsed?.type === "account") d = Number(parsed?.info?.tokenAmount?.decimals);
    if (Number.isFinite(d)) {
      return {
        mint: address,
        symbol: "UNKNOWN",
        name: "Unknown Solana Token",
        decimals: d,
        logoURI: null,
        chainFamily: "solana",
      };
    }
  } catch {}

  // 3) getTokenAccountBalance (token accounts)
  try {
    const bal = await tryAll<any>((rpc) =>
      rpcCall(rpc, "getTokenAccountBalance", [address]),
    );
    const d = Number(bal?.value?.decimals);
    if (Number.isFinite(d)) {
      return {
        mint: address,
        symbol: "UNKNOWN",
        name: "Unknown Solana Token",
        decimals: d,
        logoURI: null,
        chainFamily: "solana",
      };
    }
  } catch {}

  return null;
}
