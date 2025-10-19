export type EvmToken = {
  address: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  logoURI?: string | null;
};

export async function searchEvmTokens(
  chainId: number,
  q: string,
  opts?: { signal?: AbortSignal }
): Promise<EvmToken[]> {
  const url = `/api/evm-tokens?chainId=${chainId}&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { cache: "no-store", signal: opts?.signal });

  // If the server returned an error or HTML, surface a readable message
  if (!res.ok) {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j?.error || `HTTP ${res.status}`);
    } else {
      const t = await res.text().catch(() => "");
      throw new Error(t?.slice(0, 200) || `HTTP ${res.status}`);
    }
  }

  // Happy path: JSON
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt?.slice(0, 200) || "Response was not JSON");
  }
  return (await res.json()) as EvmToken[];
}
