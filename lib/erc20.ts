import { createPublicClient, http } from "viem";

const ERC20_ABI = [
  { type: "function", name: "name",    stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "symbol",  stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "decimals",stateMutability: "view", inputs: [], outputs: [{ type: "uint8"  }] },
];

export type Erc20Meta = {
  address: `0x${string}`;
  name: string;
  symbol: string;
  decimals: number;
  chainId: number;
  logoURI?: string | null;
};

function rpcListFor(chainId: number): string[] {
  const envSingle = ({
    1:"RPC_ETHEREUM",56:"RPC_BSC",250:"RPC_FANTOM",137:"RPC_POLYGON",10:"RPC_OPTIMISM",
    42161:"RPC_ARBITRUM",8453:"RPC_BASE",43114:"RPC_AVALANCHE",100:"RPC_GNOSIS",324:"RPC_ZKSYNC",
    59144:"RPC_LINEA",534352:"RPC_SCROLL",81457:"RPC_BLAST",42220:"RPC_CELO",1284:"RPC_MOONBEAM",
    5000:"RPC_MANTLE",7777777:"RPC_ZORA",480:"RPC_WORLD",
  } as Record<number,string|undefined>)[chainId];

  const envListKey = ({
    1:"RPC_ETHEREUM_LIST",56:"RPC_BSC_LIST",250:"RPC_FANTOM_LIST",137:"RPC_POLYGON_LIST",10:"RPC_OPTIMISM_LIST",
    42161:"RPC_ARBITRUM_LIST",8453:"RPC_BASE_LIST",43114:"RPC_AVALANCHE_LIST",100:"RPC_GNOSIS_LIST",324:"RPC_ZKSYNC_LIST",
    59144:"RPC_LINEA_LIST",534352:"RPC_SCROLL_LIST",81457:"RPC_BLAST_LIST",42220:"RPC_CELO_LIST",1284:"RPC_MOONBEAM_LIST",
    5000:"RPC_MANTLE_LIST",7777777:"RPC_ZORA_LIST",480:"RPC_WORLD_LIST",
  } as Record<number,string|undefined>)[chainId];

  const single = envSingle ? (process.env[envSingle] as string|undefined) : undefined;
  const list = envListKey && process.env[envListKey] ? (process.env[envListKey] as string).split(",").map(s=>s.trim()).filter(Boolean) : [];

  const publicFallbacks: Record<number,string[]> = {
    1:["https://rpc.ankr.com/eth"],
    56:["https://bsc-dataseed.binance.org"],
    250:["https://rpc.ankr.com/fantom","https://rpc.ftm.tools","https://fantom-mainnet.public.blastapi.io","https://rpc2.fantom.network"],
    137:["https://polygon-rpc.com"],
    10:["https://mainnet.optimism.io"],
    42161:["https://arb1.arbitrum.io/rpc"],
    8453:["https://mainnet.base.org"],
    43114:["https://api.avax.network/ext/bc/C/rpc"],
    100:["https://rpc.gnosischain.com"],
    324:["https://mainnet.era.zksync.io"],
    59144:["https://rpc.linea.build"],
    534352:["https://rpc.scroll.io"],
    81457:["https://rpc.blast.io"],
    42220:["https://forno.celo.org"],
    1284:["https://rpc.api.moonbeam.network"],
    5000:["https://rpc.mantle.xyz","https://mantle.publicnode.com"],
    7777777:["https://rpc.zora.energy","https://zora.rpc.blxrbdn.com"],
    480:["https://rpc.worldchain.network","https://worldchain-mainnet.public.blastapi.io"],
  };

  const out: string[] = [];
  if (single?.startsWith("http")) out.push(single);
  out.push(...list.filter(u=>u.startsWith("http")));
  out.push(...(publicFallbacks[chainId]||[]));
  if (process.env.QUICKNODE_HTTP?.startsWith("http")) out.push(process.env.QUICKNODE_HTTP);
  return Array.from(new Set(out));
}

async function tryReadAll(chainId:number, address:`0x${string}`) {
  let lastErr:any;
  for (const rpc of rpcListFor(chainId)) {
    try {
      const client = createPublicClient({ transport: http(rpc) });
      const symbol = await client.readContract({ address, abi: ERC20_ABI, functionName: "symbol" }) as string;
      const [nameRes, decRes] = await Promise.allSettled([
        client.readContract({ address, abi: ERC20_ABI, functionName: "name" }) as Promise<string>,
        client.readContract({ address, abi: ERC20_ABI, functionName: "decimals" }) as Promise<number>,
      ]);
      const name = nameRes.status === "fulfilled" ? nameRes.value : symbol;
      const decimals = decRes.status === "fulfilled" ? Number(decRes.value) : 18;
      return { name, symbol, decimals };
    } catch(e){ lastErr = e; }
  }
  throw lastErr ?? new Error("All RPCs failed");
}

export async function fetchErc20Meta(chainId:number, address:`0x${string}`){
  const { name, symbol, decimals } = await tryReadAll(chainId, address);
  if (!symbol) throw new Error("Not an ERC-20 (symbol() missing)");
  return { address, name, symbol, decimals, chainId, logoURI: null };
}
