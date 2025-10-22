export const dynamic = "force-dynamic";

export default function Page() {
  // dynamic import keeps this page small; Next.js 15 app router friendly
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl">Swap Lab (EVM) — balances + USD + flip</h1>
      <p className="opacity-70 text-sm">This is a sandbox nested under /token-search-test. Your main test page is untouched.</p>
      {/* @ts-expect-error async Server Component wrapper */}
      <SwapClient />
    </div>
  );
}

async function SwapClient() {
  const SwapPanel = (await import("@/components/swap/SwapPanel")).default;
  return <SwapPanel />;
}
