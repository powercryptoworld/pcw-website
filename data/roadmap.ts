// data/roadmap.ts
export type Status = "Planned" | "Research" | "Building" | "Live";

export type Item = {
  title: string;
  blurb: string;
  deliverables: string[];
  quarter: string; // e.g., "Q3’26"
  status: Status;
};

export type Year = {
  year: number;
  kpis?: string[];
  items: Item[];
};

export const ROADMAP: Year[] = [
  {
    year: 2026,
    kpis: ["25k MAU wallet", "$15M cumulative swap volume"],
    items: [
      {
        title: "Decentralized Exchange (DEX)",
        blurb: "Spot swaps, multi-chain routing, and fee switch.",
        deliverables: ["ETH/BSC/SOL to start", "Aggregator routing", "Fee switch"],
        quarter: "Q3’26",
        status: "Building",
      },
      {
        title: "Wallet Storage",
        blurb: "Non-custodial, seedless-recovery beta, multi-chain.",
        deliverables: ["MPC/seedless beta", "Multi-chain accounts", "Backup & recovery"],
        quarter: "Q4’26",
        status: "Research",
      },
      {
        title: "Rewards on Currency (v1)",
        blurb: "Swap-fee rebates in PCW with streak bonuses.",
        deliverables: ["Fee rebates", "Streak bonuses", "Basic tiers"],
        quarter: "Q4’26",
        status: "Research",
      },
    ],
  },
  {
    year: 2027,
    kpis: ["500 merchants", "$3M card GMV"],
    items: [
      {
        title: "Debit/Credit Card Expansion",
        blurb: "KYC, BIN sponsorship, virtual cards; cashback in PCW.",
        deliverables: ["Onboarding/KYC", "BIN partner", "Virtual card + cashback"],
        quarter: "Q2–Q4’27",
        status: "Research",
      },
      {
        title: "Business Accounts (v1)",
        blurb: "Multi-user treasury with roles and invoicing.",
        deliverables: ["Roles & permissions", "Invoices", "Basic reporting"],
        quarter: "Q3’27",
        status: "Research",
      },
      {
        title: "Yield on Crypto (v1)",
        blurb: "Curated, transparent vaults with clear risk tiers.",
        deliverables: ["ETH/LST vaults", "Stable pools", "Risk disclosures"],
        quarter: "Q4’27",
        status: "Research",
      },
    ],
  },
  {
    year: 2028,
    kpis: ["$50M stablecoin float", "100k MAU wallet"],
    items: [
      {
        title: "Stable Coin (PCW-USD)",
        blurb: "Fully reserved, chain-agnostic mint/redeem with attestations.",
        deliverables: ["Reserve custodian", "Attestations", "Mint/Redeem flows"],
        quarter: "Q2–Q3’28",
        status: "Research",
      },
      {
        title: "Blockchain Ecosystem (PCW Chain — testnet)",
        blurb: "EVM-compatible L2/appchain; low fees; on-chain rewards.",
        deliverables: ["Testnet", "Bridges", "On-chain rewards"],
        quarter: "Q4’28",
        status: "Research",
      },
      {
        title: "DEX v2",
        blurb: "Cross-chain swaps and limit orders.",
        deliverables: ["Limit orders", "Cross-chain", "Improved routing"],
        quarter: "Q2’28",
        status: "Planned",
      },
    ],
  },
  {
    year: 2029,
    kpis: ["2k business accounts", "$250M TVL across products"],
    items: [
      {
        title: "Business Accounts (v2)",
        blurb: "Payroll, mass payouts, API keys, accounting exports.",
        deliverables: ["Mass payouts", "API keys", "CSV/ERP exports"],
        quarter: "Q1–Q2’29",
        status: "Planned",
      },
      {
        title: "Yield on Crypto (v2)",
        blurb: "Auto-rebalancing strategies and protection layers.",
        deliverables: ["Auto-rebalance", "Strategy marketplace", "Risk controls"],
        quarter: "Q2’29",
        status: "Planned",
      },
      {
        title: "Card Expansion (Intl)",
        blurb: "EU/LatAm rollout with interchange-backed rewards.",
        deliverables: ["EU BIN", "LatAm pilots", "Interchange rewards"],
        quarter: "Q3’29",
        status: "Planned",
      },
      {
        title: "PCW Chain (mainnet)",
        blurb: "Ecosystem grants to bootstrap apps.",
        deliverables: ["Mainnet", "Ecosystem grants", "Dev tooling"],
        quarter: "Q4’29",
        status: "Planned",
      },
    ],
  },
  {
    year: 2030,
    kpis: ["1M MAU", "$1B annualized volume"],
    items: [
      {
        title: "AI Dev Tools",
        blurb: "Agent SDKs for routing, compliance pre-checks, wallet copilot.",
        deliverables: ["Agent SDK", "Compliance pre-check", "Wallet copilot"],
        quarter: "Q2’30",
        status: "Planned",
      },
      {
        title: "Rewards on Currency (v3)",
        blurb: "Dynamic AI-driven tiers, partner offers, real-time boosts.",
        deliverables: ["Dynamic tiers", "Partner offers", "Real-time boosts"],
        quarter: "Q3’30",
        status: "Planned",
      },
      {
        title: "Unified Super-App",
        blurb: "Cards + DEX + yield + business in one UX; AI summaries.",
        deliverables: ["Unified UX", "Cross-product nav", "AI summaries"],
        quarter: "Q4’30",
        status: "Planned",
      },
    ],
  },
];
