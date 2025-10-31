const fs = require('fs');
const file = 'app/page.tsx';
let src = fs.readFileSync(file, 'utf8');

function replaceHeader(label, replacement) {
  // Match the small header block just above each TokenRow:
  // <div className="flex items-center justify-between mb-1">
  //   <div className="text-[11px] opacity-80">You X</div>
  //   {solX ? ... : ...}
  // </div>
  const re = new RegExp(
    String.raw`<div className="flex items-center justify-between mb-1">\s*` +
    String.raw`<div className="text-\[11px\] opacity-80">${label}</div>\s*` +
    String.raw`(?:\{[\s\S]*?\})\s*` +
    String.raw`</div>`,
    'm'
  );
  const before = src;
  src = src.replace(re, replacement.trim());
  return before !== src;
}

// Replacement blocks
const payBlock = `
<div className="flex items-center gap-2 mb-1">
  {solPay ? (
    <TokenChip family="sol" symbol={solPay?.symbol} name={solPay?.name} mint={solPay?.mint} onClear={() => setSolPay(null)} />
  ) : (
    <TokenChip family="evm" chainId={payToken.chainId} address={payToken.address} symbol={payToken.symbol} name={payToken.name} logoURI={payToken.logoURI} />
  )}
  <button
    onClick={() => setPicker("pay")}
    className="text-xs px-2 py-1 rounded border border-white/15 bg-white/5 hover:bg-white/10"
  >
    Pay token
  </button>
</div>
`;

const receiveBlock = `
<div className="flex items-center gap-2 mb-1">
  {solReceive ? (
    <TokenChip family="sol" symbol={solReceive?.symbol} name={solReceive?.name} mint={solReceive?.mint} onClear={() => setSolReceive(null)} />
  ) : (
    <TokenChip family="evm" chainId={receiveToken.chainId} address={receiveToken.address} symbol={receiveToken.symbol} name={receiveToken.name} logoURI={receiveToken.logoURI} />
  )}
  <button
    onClick={() => setPicker("receive")}
    className="text-xs px-2 py-1 rounded border border-white/15 bg-white/5 hover:bg-white/10"
  >
    Receive token
  </button>
</div>
`;

const ok1 = replaceHeader('You pay', payBlock);
const ok2 = replaceHeader('You receive', receiveBlock);

if (!ok1 && !ok2) {
  console.error('No header blocks matched. File structure may differ; no changes written.');
  process.exit(2);
}
fs.writeFileSync(file, src);
console.log(`Patched: ${ok1 ? 'You pay' : '(pay unchanged)'} | ${ok2 ? 'You receive' : '(receive unchanged)'}`);
